import {
    addForcedActionToPlayer,
    addParameterRequirementAdjustments,
    announceReadyToStartRound,
    applyDiscounts,
    applyExchangeRateChanges,
    askUserToChooseResourceActionDetails,
    askUserToDuplicateProduction,
    askUserToLookAtCards,
    askUserToMakeActionChoice,
    askUserToPlaceTile,
    claimMilestone as claimMilestoneAction,
    completeAction,
    discardCards,
    discardRevealedCards,
    fundAward as fundAwardAction,
    gainResource,
    increaseParameter,
    increaseProduction,
    increaseTerraformRating,
    makeActionChoice,
    markCardActionAsPlayed,
    moveCardFromHandToPlayArea,
    payForCards,
    payToPlayCard,
    payToPlayStandardProject,
    placeTile,
    removeForcedActionFromPlayer,
    removeResource,
    revealAndDiscardTopCards,
    setCards,
    setCorporation,
    setPlantDiscount,
    skipAction,
    skipChoice,
} from 'actions';
import {ActionGuard} from 'client-server-shared/action-guard';
import {GameActionHandler} from 'client-server-shared/game-action-handler-interface';
import {getOptionsForDuplicateProduction} from 'components/ask-user-to-confirm-duplicate-production';
import {
    getAction,
    ResourceActionOption,
} from 'components/ask-user-to-confirm-resource-action-details';
import {Action, ParameterCounter} from 'constants/action';
import {Award, Cell, CellType, Milestone, Parameter, t, TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {CONVERSIONS} from 'constants/conversion';
import {EffectTrigger} from 'constants/effect-trigger';
import {GameStage, PARAMETER_STEPS} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource, ResourceAndAmount, ResourceLocationType} from 'constants/resource';
import {StandardProjectAction, StandardProjectType} from 'constants/standard-project';
import {
    ActionCardPair,
    createDecreaseProductionAction,
    createGainResourceOptionAction,
    createInitialGainResourceAction,
    createInitialRemoveResourceAction,
    createRemoveResourceOptionAction,
    EffectEvent,
    filterOceanPlacementsOverMax,
    getParameterForTile,
    shouldPause,
} from 'context/app-context';
import {Card} from 'models/card';
import {GameState, PlayerState, reducer} from 'reducer';
import {getForcedActionsForPlayer} from 'selectors/player';

export interface ServerGameModel {
    state: GameState;
    queue: Array<{type: string; payload}>;
    players: Array<string>;
    name: string;
}

export class ApiActionHandler implements GameActionHandler {
    private readonly actionGuard: ActionGuard;
    constructor(public game: ServerGameModel, private readonly username: string) {
        this.loggedInPlayerIndex = this.game.state.players.findIndex(
            player => player.username === this.username
        );
        this.actionGuard = new ActionGuard(this.game.state, username);
    }

    private loggedInPlayerIndex: number;
    private getLoggedInPlayerIndex(): number {
        return this.loggedInPlayerIndex;
    }
    private getLoggedInPlayer(): PlayerState {
        return this.state.players[this.loggedInPlayerIndex];
    }

    private getGameStage(): GameStage {
        return this.state.common.gameStage;
    }

    private get queue() {
        return this.game.queue;
    }

    get state() {
        return this.game.state;
    }

    async handleForcedActionsIfNeededAsync(originalState: GameState) {
        const {state} = this;
        const {currentPlayerIndex} = state.common;
        const gameStage = this.getGameStage();
        if (
            originalState.common.currentPlayerIndex === currentPlayerIndex &&
            gameStage === originalState.common.gameStage
        ) {
            return;
        }

        const forcedActions = getForcedActionsForPlayer(state, currentPlayerIndex);

        for (const forcedAction of forcedActions) {
            this.playAction({state, action: forcedAction, thisPlayerIndex: currentPlayerIndex});
            this.queue.push(completeAction(currentPlayerIndex));
            this.queue.push(removeForcedActionFromPlayer(currentPlayerIndex, forcedAction));
        }
        if (forcedActions.length > 0) {
            this.processQueue();
        }
    }

    async playCardAsync({
        card,
        payment,
    }: {
        card: Card;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const playerIndex = this.getLoggedInPlayerIndex();
        const [canPlay, reason] = this.actionGuard.canPlayCard(card, payment);

        if (!canPlay) {
            throw new Error(reason);
        }

        this.queue.unshift(moveCardFromHandToPlayArea(card, playerIndex));

        // 1. Pay for the card.
        //    - This should account for discounts
        //    - This should account for non-MC payment, which is prompted by the UI
        //      and included in `payment`
        //    - If no `payment` is defined, the reducer will defer to paying with MC
        if (card.cost) {
            this.queue.push(payToPlayCard(card, playerIndex, payment));
        }

        this.processQueue();

        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card affects itself.
        // Must also happen after payment.
        // However, it must be *before* other stuff happens.
        // Why? Imagine you're Credicor and play Underground City.
        // Credicor will give you 4 coins after affording the card.
        // The board is Hellas.
        // You place the city on the "place an ocean for 6 coins" spot.
        // Now if you have 2 coins after paying for the card,
        // you'll now have 6 coins and can afford the card.
        // If the triggerEffects happened after city placement you could not.
        // TODO fix edge cases where the ActionGuard will block you from proceeding
        // even though it's technically possible (e.g. Tharsis and Immigrant City).
        this.triggerEffectsFromPlayedCard(card);

        // 2. Apply effects that will affect future turns:
        //     - parameter requirement adjustments (next turn or permanent)
        //     - discounts (card discounts, standard project discounts, etc)
        //     - exchange rates (e.g. advanced alloys)
        this.queue.push(
            addParameterRequirementAdjustments(
                card.parameterRequirementAdjustments,
                card.temporaryParameterRequirementAdjustments,
                playerIndex
            )
        );

        this.queue.push(applyDiscounts(card.discounts, playerIndex));
        this.queue.push(applyExchangeRateChanges(card.exchangeRates, playerIndex));

        // 3. Play the action
        //     - action choices (done with priority)
        //     - gaining/losing/stealing resources & production
        //     - tile pacements
        //     - discarding/drawing cards
        this.playAction({action: card, state: this.state, parent: card});

        if (card.forcedAction) {
            this.queue.push(addForcedActionToPlayer(playerIndex, card.forcedAction));
        }

        // Don't call `completeAction` for corporations, because we use `player.action` as a proxy
        // for players being ready to start round 1, and don't want to increment it.
        if (card.type !== CardType.CORPORATION) {
            this.queue.push(completeAction(playerIndex));
        }

        this.processQueue();
    }

    private triggerEffectsFromPlayedCard(card: Card) {
        const {cost, tags} = card;
        this.triggerEffects(
            {
                cost: cost || 0,
                tags,
            },
            card
        );
    }

    private triggerEffectsFromTilePlacement(placedTile: TileType, cell: Cell) {
        this.triggerEffects({
            placedTile,
            cell,
        });
    }

    private triggerEffects(event: EffectEvent, playedCard?: Card) {
        const {state} = this;
        const player = this.getLoggedInPlayer();
        // track the card that triggered the action so we can "add resources to this card"
        // e.g. Ecological Zone
        for (const thisPlayer of state.players) {
            const actionCardPairs: ActionCardPair[] = [];
            for (const card of thisPlayer.playedCards) {
                for (const effect of card.effects) {
                    if (effect.trigger && effect.action) {
                        const actions = this.getActionsFromEffect(
                            event,
                            effect.trigger,
                            effect.action,
                            thisPlayer,
                            player.index
                        );
                        actionCardPairs.push(
                            ...actions.map(action => [action, card] as [Action, Card])
                        );
                    }
                }
            }
            for (const [action, card] of actionCardPairs) {
                this.playAction({
                    action,
                    state,
                    parent: card,
                    playedCard,
                    thisPlayerIndex: thisPlayer.index,
                });
            }
        }
    }

    private getActionsFromEffect(
        event: EffectEvent,
        trigger: EffectTrigger,
        effectAction: Action,
        player: PlayerState,
        currentPlayerIndex: number
    ): Action[] {
        if (!trigger.anyPlayer && player.index !== currentPlayerIndex) return [];

        if (trigger.placedTile) {
            if (event.placedTile !== trigger.placedTile) return [];
            if (trigger.onMars && event.cell?.type === CellType.OFF_MARS) return [];

            return [effectAction];
        }

        if (trigger.steelOrTitaniumPlacementBonus) {
            const bonus = event.cell?.bonus || [];
            if (!bonus.includes(Resource.STEEL) && !bonus.includes(Resource.TITANIUM)) return [];
            return [effectAction];
        }

        if (trigger.standardProject) {
            if (!event.standardProject) return [];

            return [effectAction];
        }

        if (trigger.cost) {
            if ((event.cost || 0) < trigger.cost) return [];
            return [effectAction];
        }

        const eventTags = event.tags || [];

        if (trigger.cardTags) {
            for (const tag of trigger.cardTags || []) {
                if (!eventTags.includes(tag)) return [];
            }
            return [effectAction];
        }

        const triggerTags = trigger.tags || [];
        const numTagsTriggered = eventTags.filter(tag => triggerTags.includes(tag)).length;
        return Array(numTagsTriggered).fill(effectAction);
    }

    private processQueue() {
        while (this.queue.length > 0) {
            const item = this.queue.shift()!;
            this.dispatch(item);
            if (shouldPause(item)) {
                break;
            }
        }
    }

    private dispatch(action: {type: string; payload}) {
        this.game.state = reducer(this.game.state, action);
    }

    async playCardActionAsync({
        parent,
        payment,
        choiceIndex,
    }: {
        parent: Card;
        payment?: PropertyCounter<Resource>;
        choiceIndex?: number;
    }): Promise<void> {
        const player = this.getLoggedInPlayer();
        let action = parent.action;
        let isChoiceAction = false;

        if (parent.lastRoundUsedAction === this.state.common.generation) {
            throw new Error('Already used action this round');
        }

        if (choiceIndex !== undefined) {
            action = player?.pendingChoice?.choice?.[choiceIndex];
            if (!action) {
                action = parent.action?.choice?.[choiceIndex];
            } else {
                isChoiceAction = true;
            }
        }

        if (!action) {
            throw new Error('No action found');
        }

        const {state} = this;

        let canPlay: boolean;
        let reason: string;

        if (isChoiceAction) {
            [canPlay, reason] = this.actionGuard.canPlayActionInSpiteOfUI(action, state, parent);
        } else {
            [canPlay, reason] = this.actionGuard.canPlayAction(action, state, parent);
        }

        if (!canPlay) {
            throw new Error(reason);
        }

        // If you use regolith eaters to remove 2 microbes to raise oxygen 1 step,
        // And that triggers an ocean, we want the ocean placement to come up before the action increments.
        // withPriority "unshifts" instead of pushing the items, so they go first.
        const withPriority = isChoiceAction;

        if (!isChoiceAction) {
            this.queue.push(markCardActionAsPlayed(parent, this.loggedInPlayerIndex));
        }

        this.playAction({
            action,
            state,
            parent,
            payment,
            withPriority,
        });

        if (isChoiceAction) {
            this.queue.unshift(makeActionChoice(this.loggedInPlayerIndex));
        } else {
            this.queue.push(completeAction(this.loggedInPlayerIndex));
        }

        this.processQueue();
    }

    async playStandardProjectAsync({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const [canPlay, reason] = this.actionGuard.canPlayStandardProject(standardProjectAction);

        if (!canPlay) {
            throw new Error(reason);
        }

        const playerIndex = this.getLoggedInPlayerIndex();
        this.queue.push(payToPlayStandardProject(standardProjectAction, payment!, playerIndex));

        const {state} = this;
        this.triggerEffectsFromStandardProject(
            standardProjectAction.cost,
            state,
            standardProjectAction.type
        );

        this.playAction({action: standardProjectAction, state});
        this.queue.push(completeAction(playerIndex));

        this.processQueue();
    }

    async confirmCardSelectionAsync({
        selectedCards,
        corporation,
    }: {
        selectedCards: Card[];
        corporation: Card;
    }) {
        const {state} = this;
        const {
            pendingDiscard,
            index: loggedInPlayerIndex,
            buyCards,
            possibleCards,
            cards,
        } = this.getLoggedInPlayer();
        const canConfirmCardSelection =
            possibleCards.length > 0 &&
            this.actionGuard.canConfirmCardSelection(selectedCards.length, state, corporation);
        if (!canConfirmCardSelection) {
            throw new Error('Cannot confirm card selection');
        }
        if (
            !selectedCards.every(selectedCard =>
                possibleCards.some(possibleCard => possibleCard.name === selectedCard.name)
            )
        ) {
            throw new Error('Trying to select invalid card');
        }
        if (pendingDiscard) {
            this.dispatch(discardCards(selectedCards, loggedInPlayerIndex));
            this.processQueue();
            return;
        }
        const gameStage = this.getGameStage();
        if (gameStage === GameStage.CORPORATION_SELECTION) {
            if (!this.actionGuard.canPlayCorporation(corporation)) {
                throw new Error('Cannot play corporation');
            }
            await this.playCardAsync({card: corporation});
            this.dispatch(setCorporation(corporation, loggedInPlayerIndex));
        }

        if (buyCards) {
            this.queue.push(payForCards(selectedCards, loggedInPlayerIndex));
        }

        this.queue.push(setCards(cards.concat(selectedCards), loggedInPlayerIndex));
        this.queue.push(
            discardCards(
                possibleCards.filter(card => !selectedCards.includes(card)),
                loggedInPlayerIndex
            )
        );
        if (gameStage !== GameStage.ACTIVE_ROUND) {
            this.queue.push(announceReadyToStartRound(loggedInPlayerIndex));
        }
        this.processQueue();
    }

    async continueAfterRevealingCardsAsync() {
        this.queue.push(discardRevealedCards());
        this.processQueue();
    }

    async completeChooseDuplicateProductionAsync({index}: {index: number}) {
        const player = this.getLoggedInPlayer();
        if (!player.pendingDuplicateProduction) {
            return [false, 'No pending duplicate production to choose'];
        }
        const {tag} = player.pendingDuplicateProduction;
        const {state} = this;

        const options = getOptionsForDuplicateProduction(tag, player, state);

        const action = options?.[index]?.action;

        if (!action) {
            throw new Error('No action found');
        }

        const [canPlay, reason] = this.actionGuard.canPlayActionInSpiteOfUI(action, state);

        if (!canPlay) {
            throw new Error(reason);
        }

        this.playAction({action, state});
        this.processQueue();
    }

    async skipChooseDuplicateProductionAsync() {
        const [
            canSkipChooseDuplicateProduction,
            reason,
        ] = this.actionGuard.canSkipChooseDuplicateProduction();
        if (!canSkipChooseDuplicateProduction) {
            throw new Error(reason);
        }

        this.queue.unshift(skipChoice(this.loggedInPlayerIndex));
        this.processQueue();
    }

    private triggerEffectsFromStandardProject(
        cost: number | undefined,
        state: GameState,
        type: StandardProjectType
    ) {
        if (!cost) return;

        this.triggerEffects({
            standardProject: type,
            cost,
        });
    }

    async claimMilestoneAsync({
        milestone,
        payment,
    }: {
        milestone: Milestone;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const [canPlay, reason] = this.actionGuard.canClaimMilestone(milestone);

        if (!canPlay) {
            throw new Error(reason);
        }

        const playerIndex = this.getLoggedInPlayerIndex();
        this.queue.push(claimMilestoneAction(milestone, payment, playerIndex));
        this.queue.push(completeAction(playerIndex));
        this.processQueue();
    }

    async fundAwardAsync({
        award,
        payment,
    }: {
        award: Award;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const [canPlay, reason] = this.actionGuard.canFundAward(award);

        if (!canPlay) {
            throw new Error(reason);
        }

        const playerIndex = this.getLoggedInPlayerIndex();
        this.queue.push(fundAwardAction(award, payment, playerIndex));
        this.queue.push(completeAction(playerIndex));
        this.processQueue();
    }

    async doConversionAsync({resource}: {resource: Resource}): Promise<void> {
        const conversion = CONVERSIONS[resource];
        const [canPlay, reason] = this.actionGuard.canDoConversion(conversion);
        if (!canPlay) {
            throw new Error(reason);
        }

        this.playAction({action: conversion, state: this.state});
        const gameStage = this.state.common.gameStage;
        if (gameStage === GameStage.ACTIVE_ROUND) {
            this.queue.push(completeAction(this.getLoggedInPlayerIndex()));
        }
        this.processQueue();
    }

    async skipActionAsync(): Promise<void> {
        const [canSkip, reason] = this.actionGuard.canSkipAction();

        if (!canSkip) {
            throw new Error(reason);
        }

        this.queue.unshift(skipAction(this.loggedInPlayerIndex));
        this.processQueue();
    }

    async completePlaceTileAsync({cell}: {cell: Cell}): Promise<void> {
        const [canCompletePlaceTile, reason] = this.actionGuard.canCompletePlaceTile(cell);

        if (!canCompletePlaceTile) {
            throw new Error(reason);
        }

        const {state} = this;
        const loggedInPlayer = this.getLoggedInPlayer();
        const {pendingTilePlacement} = loggedInPlayer;

        const type = pendingTilePlacement!.type!;
        this.queue.unshift(placeTile({type}, cell, loggedInPlayer.index));

        const parameterForTile = getParameterForTile(type);
        if (parameterForTile) {
            this.playAction({
                state,
                action: {
                    increaseParameter: {
                        [parameterForTile as Parameter]: 1,
                    },
                },
            });
        }

        this.triggerEffectsFromTilePlacement(type, cell);
        this.processQueue();
    }

    async completeChooseResourceActionDetailsAsync({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }): Promise<void> {
        const [
            canCompleteChooseResourceActionDetails,
            reason,
        ] = this.actionGuard.canCompleteChooseResourceActionDetails(option, variableAmount);
        if (!canCompleteChooseResourceActionDetails) {
            throw new Error(reason);
        }

        const action = getAction(option, this.getLoggedInPlayer(), variableAmount);

        this.queue.unshift(action);

        this.processQueue();
    }

    async skipChooseResourceActionDetailsAsync(): Promise<void> {
        const [
            canSkipChooseResourceActionDetails,
            reason,
        ] = this.actionGuard.canSkipChooseResourceActionDetails();
        if (!canSkipChooseResourceActionDetails) {
            throw new Error(reason);
        }

        this.queue.unshift(skipChoice(this.loggedInPlayerIndex));

        this.processQueue();
    }

    async completeLookAtCardsAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void> {}

    async completeChooseDiscardCardsAsync({
        selectedCards,
    }: {
        selectedCards: Array<Card>;
    }): Promise<void> {}

    async completeDuplicateProductionAsync({card}: {card: Card}): Promise<void> {}

    async chooseCorporationAndStartingCardsAsync({
        corporation,
        selectedCards,
    }: {
        corporation: Card;
        selectedCards: Array<Card>;
    }): Promise<void> {}

    async chooseCardsAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void> {}

    async chooseCardForDraftRoundAsync({
        selectedCards,
    }: {
        selectedCards: Array<Card>;
    }): Promise<void> {}

    private playAction({
        action,
        state,
        parent,
        playedCard,
        thisPlayerIndex,
        payment,
        withPriority,
    }: {
        action: Action;
        state: GameState;
        parent?: Card; // origin of action
        playedCard?: Card; // card that triggered action
        thisPlayerIndex?: number;
        payment?: PropertyCounter<Resource>;
        withPriority?: boolean;
    }) {
        const playerIndex = thisPlayerIndex ?? this.getLoggedInPlayerIndex();
        const items: Array<{type: string; payload}> = [];

        // Only accept payment for actions with a parent (ie, card actions).
        // Other actions should already be accounting for payment in their internals.
        // TODO: Consolidate payment logic into here
        if (payment && action.cost && parent) {
            for (const resource in payment) {
                items.push(
                    removeResource(
                        resource as Resource,
                        payment[resource],
                        playerIndex,
                        playerIndex
                    )
                );
            }
        }

        for (const production in action.decreaseProduction) {
            items.push(
                createDecreaseProductionAction(
                    production as Resource,
                    action.decreaseProduction[production],
                    playerIndex,
                    parent
                )
            );
        }

        for (const production in action.decreaseAnyProduction) {
            items.push(
                askUserToChooseResourceActionDetails({
                    actionType: 'decreaseProduction',
                    card: parent!,
                    playerIndex,
                    locationType: ResourceLocationType.ANY_PLAYER,
                    resourceAndAmounts: [
                        {
                            resource: production as Resource,
                            amount: action.decreaseAnyProduction[production],
                        },
                    ],
                })
            );
        }

        if (action.choice) {
            items.push(askUserToMakeActionChoice(action.choice, parent!, playedCard!, playerIndex));
        }

        if (action.tilePlacements) {
            const filteredTilePlacements = filterOceanPlacementsOverMax(
                action.tilePlacements,
                state
            );
            for (const tilePlacement of filteredTilePlacements) {
                items.push(askUserToPlaceTile(tilePlacement, playerIndex));
            }
        }

        for (const resource in action.removeResource) {
            items.push(
                createInitialRemoveResourceAction(
                    resource as Resource,
                    action.removeResource[resource],
                    playerIndex,
                    parent,
                    playedCard,
                    action.removeResourceSourceType
                )
            );
        }

        if (Object.keys(action.removeResourceOption ?? {}).length > 0) {
            items.push(
                createRemoveResourceOptionAction(
                    action.removeResourceOption!,
                    playerIndex,
                    parent,
                    action.removeResourceSourceType
                )
            );
        }

        const stealResourceResourceAndAmounts: Array<ResourceAndAmount> = [];

        // NOTE: This logic means stealResource really behaves more like
        // stealResourceOption (which doesn't exist), but it works in all stealing
        // cases now. If we ever need to support removing / stealing MULTIPLE
        // resource types, this will need to be refactored (same for removeResourceOption).
        for (const resource in action.stealResource) {
            const resourceAndAmount: ResourceAndAmount = {
                resource: resource as Resource,
                amount: action.stealResource[resource] as number,
            };

            stealResourceResourceAndAmounts.push(resourceAndAmount);
        }

        if (stealResourceResourceAndAmounts.length > 0) {
            items.push(
                askUserToChooseResourceActionDetails({
                    actionType: 'stealResource',
                    resourceAndAmounts: stealResourceResourceAndAmounts,
                    card: parent!,
                    playerIndex,
                })
            );
        }

        if (action.revealAndDiscardTopCards) {
            items.push(revealAndDiscardTopCards(action.revealAndDiscardTopCards));
        }

        if (action.lookAtCards) {
            items.push(
                askUserToLookAtCards(
                    playerIndex,
                    action.lookAtCards.numCards,
                    action.lookAtCards.numCardsToTake,
                    action.lookAtCards.buyCards
                )
            );
        }

        for (const production in action.increaseProduction) {
            items.push(
                increaseProduction(
                    production as Resource,
                    action.increaseProduction[production],
                    playerIndex
                )
            );
        }

        if (action.increaseProductionOption !== undefined) {
            const resourceAndAmounts: Array<ResourceAndAmount> = [];
            for (const resource in action.increaseProductionOption) {
                resourceAndAmounts.push({
                    resource: resource as Resource,
                    amount: action.increaseProductionOption[resource] as number,
                });
            }
            if (resourceAndAmounts.length > 0) {
                items.push(
                    askUserToChooseResourceActionDetails({
                        actionType: 'increaseProduction',
                        resourceAndAmounts,
                        playerIndex,
                        card: parent!,
                    })
                );
            }
        }

        if (action.duplicateProduction) {
            items.push(
                askUserToDuplicateProduction({
                    tag: action.duplicateProduction,
                    playerIndex,
                    card: action as Card,
                })
            );
        }

        for (const resource in action.gainResource) {
            items.push(
                createInitialGainResourceAction(
                    resource as Resource,
                    action.gainResource[resource],
                    playerIndex,
                    parent,
                    playedCard,
                    action.gainResourceTargetType
                )
            );
        }

        if (Object.keys(action.gainResourceOption ?? {}).length > 0) {
            items.push(
                createGainResourceOptionAction(
                    action.gainResourceOption!,
                    playerIndex,
                    parent,
                    playedCard,
                    action.gainResourceTargetType
                )
            );
        }

        let terraformRatingIncrease = action.increaseTerraformRating ?? 0;

        if (action.increaseParameter) {
            // Ensure oxygen is checked before temperature.
            const parameters: Parameter[] = [
                Parameter.OCEAN,
                Parameter.OXYGEN,
                Parameter.TEMPERATURE,
                Parameter.VENUS,
            ];

            // First, copy action.increaseParameter (so we can modify the amounts)
            const increaseParametersWithBonuses: ParameterCounter = {};

            for (const parameter of parameters) {
                increaseParametersWithBonuses[parameter] = action.increaseParameter[parameter];
            }

            for (const parameter of parameters) {
                // Start referring to the copied increaseParameter exclusively.
                const amount = increaseParametersWithBonuses[parameter];
                if (amount) {
                    items.push(increaseParameter(parameter as Parameter, amount, playerIndex));

                    // If the increase triggers a parameter increase, update the object.
                    // Relying on the order of the parameters variable here.
                    const newLevel =
                        amount * PARAMETER_STEPS[parameter] + state.common.parameters[parameter];
                    const index = parameters.indexOf(parameter);
                    // A hack, for type purposes.
                    // The increased parameter is immediately after the increaser parameter.
                    // Since TypeScript doesn't like us using Parameter.TEMPERATURE as a key,
                    // we do this instead.
                    const parameterToIncrease = parameters[index + 1];
                    switch (parameter) {
                        case Parameter.OXYGEN:
                            if (newLevel === 7) {
                                // Trigger a temperature increase.
                                increaseParametersWithBonuses[parameterToIncrease] =
                                    (increaseParametersWithBonuses[parameterToIncrease] || 0) + 1;
                            }
                            break;
                        case Parameter.TEMPERATURE:
                            if (newLevel === -28 || newLevel === -26) {
                                // Heat production increase.
                                items.push(increaseProduction(Resource.HEAT, 1, playerIndex));
                            }
                            if (newLevel === 0) {
                                // Place an ocean.
                                const tilePlacements = [t(TileType.OCEAN)];
                                const filteredTilePlacements = filterOceanPlacementsOverMax(
                                    tilePlacements,
                                    state
                                );
                                for (const tilePlacement of filteredTilePlacements) {
                                    items.push(askUserToPlaceTile(tilePlacement, playerIndex));
                                }
                            }
                            break;
                        case Parameter.VENUS:
                            if (newLevel === 8) {
                                // Draw a card.
                                items.push(gainResource(Resource.CARD, 1, playerIndex));
                            }
                            if (newLevel === 16) {
                                (terraformRatingIncrease as number)++;
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        if (terraformRatingIncrease) {
            items.push(increaseTerraformRating(terraformRatingIncrease, playerIndex));
        }

        // TODO: Move this to `applyDiscounts`, change `plantDiscount` to a new discount type
        if (action.plantDiscount) {
            items.push(setPlantDiscount(action.plantDiscount, playerIndex));
        }
        if (withPriority) {
            this.queue.unshift(...items);
        } else {
            this.queue.push(...items);
        }
    }
}
