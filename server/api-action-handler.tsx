import {
    addCards,
    addForcedActionToPlayer,
    addParameterRequirementAdjustments,
    announceReadyToStartRound,
    applyDiscounts,
    applyExchangeRateChanges,
    askUserToChoosePrelude,
    askUserToChooseResourceActionDetails,
    askUserToDiscardCards,
    askUserToDuplicateProduction,
    askUserToFundAward,
    askUserToIncreaseLowestProduction,
    askUserToLookAtCards,
    askUserToMakeActionChoice,
    askUserToPlaceTile,
    askUserToPlayCardFromHand,
    askUserToUseBlueCardActionAlreadyUsedThisGeneration,
    claimMilestone as claimMilestoneAction,
    completeAction,
    completeIncreaseLowestProduction,
    decreaseProduction,
    discardCards,
    discardPreludes,
    discardRevealedCards,
    draftCard,
    fundAward as fundAwardAction,
    gainResource,
    gainResourceWhenIncreaseProduction,
    gainStorableResource,
    increaseParameter,
    increaseProduction,
    increaseTerraformRating,
    makeActionChoice,
    markCardActionAsPlayed,
    moveCardFromHandToPlayArea,
    PAUSE_ACTIONS,
    payForCards,
    payToPlayCard,
    payToPlayCardAction,
    payToPlayStandardProject,
    placeTile,
    removeForcedActionFromPlayer,
    removeResource,
    removeStorableResource,
    revealAndDiscardTopCards,
    revealTakeAndDiscard,
    setCorporation,
    setPlantDiscount,
    setPreludes,
    skipAction,
    skipChoice,
    useBlueCardActionAlreadyUsedThisGeneration,
} from 'actions';
import {ActionGuard} from 'client-server-shared/action-guard';
import {WrappedGameModel} from 'client-server-shared/wrapped-game-model';
import {getOptionsForDuplicateProduction} from 'components/ask-user-to-confirm-duplicate-production';
import {
    getAction,
    ResourceActionOption,
} from 'components/ask-user-to-confirm-resource-action-details';
import {getLowestProductions} from 'components/ask-user-to-increase-lowest-production';
import {Action, ActionType, Amount, ParameterCounter} from 'constants/action';
import {Award, Cell, CellType, Milestone, Parameter, TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {CONVERSIONS} from 'constants/conversion';
import {EffectTrigger} from 'constants/effect-trigger';
import {GameStage, PARAMETER_STEPS} from 'constants/game';
import {PARAMETER_BONUSES} from 'constants/parameter-bonuses';
import {PropertyCounter} from 'constants/property-counter';
import {
    isStorableResource,
    Resource,
    ResourceAndAmount,
    ResourceLocationType,
    USER_CHOICE_LOCATION_TYPES,
} from 'constants/resource';
import {StandardProjectAction, StandardProjectType} from 'constants/standard-project';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {Card} from 'models/card';
import {GameState, PlayerState, reducer, Resources} from 'reducer';
import {AnyAction} from 'redux';
import {getCard} from 'selectors/get-card';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import {getPlayedCards} from 'selectors/get-played-cards';
import {getForcedActionsForPlayer} from 'selectors/player';
import {SerializedCard} from 'state-serialization';

export interface EffectEvent {
    standardProject?: StandardProjectType;
    cost?: number;
    placedTile?: TileType;
    cell?: Cell;
    tags?: Tag[];
    increasedParameter?: Parameter;
    name?: string;
    victoryPoints?: Amount;
}

type PlayActionParams = {
    action: Action;
    state: GameState;
    parent?: Card; // origin of action
    playedCard?: Card; // card that triggered action
    thisPlayerIndex?: number;
    withPriority?: boolean;
    // Like with priority, but instead of "unshifting" onto queue it skips queue and dispatches items immediately.
    playImmediatelyIfNoUserInputNeeded?: boolean;
};

export class ApiActionHandler {
    private readonly actionGuard: ActionGuard;
    constructor(
        public game: WrappedGameModel,
        private readonly username: string,
        dispatch?: (action: AnyAction) => void,
        ignoreSyncing?: boolean
    ) {
        this.loggedInPlayerIndex = this.game.state.players.findIndex(
            player => player.username === this.username
        );
        this.actionGuard = new ActionGuard(this.game.state, username);
        this.actionGuard.ignoreSyncing = !!ignoreSyncing;
        if (dispatch) {
            this.dispatch = dispatch;
        }
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

    set state(state: GameState) {
        this.game.state = state;
        this.actionGuard.state = state;
    }

    handleForcedActionsIfNeeded(originalState: GameState) {
        const {state} = this;
        const {currentPlayerIndex} = state.common;
        const gameStage = this.getGameStage();
        if (
            originalState.common.currentPlayerIndex === currentPlayerIndex &&
            gameStage !== GameStage.ACTIVE_ROUND
        ) {
            return;
        }

        if (getIsPlayerMakingDecision(state, this.getLoggedInPlayer())) {
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

    playCard({
        serializedCard,
        payment,
        conditionalPayments,
    }: {
        serializedCard: SerializedCard;
        payment?: Resources;
        conditionalPayments?: number[];
    }) {
        const card = getCard(serializedCard);
        const playerIndex = this.getLoggedInPlayerIndex();
        const loggedInPlayer = this.getLoggedInPlayer();

        const [canPlay, reason] = this.actionGuard.canPlayCard(
            card,
            loggedInPlayer,
            payment,
            conditionalPayments
        );

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
            this.queue.push(payToPlayCard(card, playerIndex, payment, conditionalPayments));
        }

        this.processQueue();

        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card effects itself.
        // Must also happen after payment.
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
        if (card.playCard) {
            this.queue.push(askUserToPlayCardFromHand(card.playCard, playerIndex));
        }
        this.queue.push(applyExchangeRateChanges(card.name, card.exchangeRates, playerIndex));

        // 3. Play the action
        //     - action steps
        //     - action choices (done with priority)
        //     - gaining/losing/stealing resources & production
        //     - tile pacements
        //     - discarding/drawing cards
        for (const step of card.steps) {
            this.playAction({state: this.state, action: step, parent: card});
        }
        const playActionParams = {action: card, state: this.state, parent: card};
        // Get the resources/production/cards first.
        // Trigger effects after.
        this.playActionBenefits({...playActionParams, withPriority: true});
        this.discardCards(playActionParams);
        // Finally, pay the costs.
        this.playActionCosts(playActionParams);

        if (card.forcedAction) {
            this.queue.push(addForcedActionToPlayer(playerIndex, card.forcedAction));
        }

        const isEphemeralPrelude = card.type === CardType.PRELUDE && loggedInPlayer.choosePrelude;

        if (isEphemeralPrelude) {
            this.queue.push(setPreludes([], playerIndex));
        }

        // Don't call `completeAction` for corporations, because we use `player.action` as a proxy
        // for players being ready to start round 1, and don't want to increment it.
        if (card.type !== CardType.CORPORATION && !card.playCard && !isEphemeralPrelude) {
            this.queue.push(completeAction(playerIndex));
        }

        this.processQueue();
    }

    private triggerEffectsFromPlayedCard(card: Card) {
        const {cost, tags, victoryPoints, name} = card;
        this.triggerEffects(
            {
                cost: cost || 0,
                tags,
                victoryPoints,
                name,
            },
            card
        );
    }

    private triggerEffectsFromIncreasedParameter(parameter: Parameter) {
        this.triggerEffects({
            increasedParameter: parameter,
        });
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
            const actionCardPairs = getActionsFromEffectForPlayer(thisPlayer, event, player);
            for (const [action, card] of actionCardPairs) {
                this.playAction({
                    action,
                    state,
                    parent: card,
                    playedCard,
                    thisPlayerIndex: thisPlayer.index,
                    withPriority: !!event.placedTile,
                    // If the effect causes a choice that benefits from more information,
                    // Then it's better to trigger after everything else.
                    // Otherwise, grant the resources immediately.
                    playImmediatelyIfNoUserInputNeeded: true,
                });
            }
        }
    }

    readonly executedItems: Array<AnyAction> = [];

    private processQueue(items = this.queue) {
        while (items.length > 0) {
            const item = items.shift()!;
            this.executedItems.push(item);
            this.dispatch(item);
            if (this.shouldPause(item)) {
                break;
            }
        }
    }

    private dispatch(action: AnyAction) {
        const newState = reducer(this.game.state, action);
        if (newState) {
            this.game.state = newState;
        }
    }

    playCardAction({
        parent,
        payment,
        choiceIndex,
    }: {
        parent: Card;
        payment?: Resources;
        choiceIndex?: number;
    }) {
        const player = this.getLoggedInPlayer();
        let action = parent.action;
        let isChoiceAction = false;
        const {pendingActionReplay} = player;
        const lastRoundUsedAction = player.playedCards.find(card => card.name === parent.name)!
            .lastRoundUsedAction;

        if (lastRoundUsedAction === this.state.common.generation && !pendingActionReplay) {
            throw new Error('Already used action this round');
        }

        if (lastRoundUsedAction !== this.state.common.generation && pendingActionReplay) {
            throw new Error('Can only replay an action you have already played');
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

        if (isChoiceAction || pendingActionReplay) {
            [canPlay, reason] = this.actionGuard.canPlayCardActionInSpiteOfUI(
                action,
                parent,
                player,
                state,
                payment
            );
        } else {
            [canPlay, reason] = this.actionGuard.canPlayCardAction(
                action,
                parent,
                player,
                state,
                payment
            );
        }

        if (!canPlay) {
            throw new Error(reason);
        }

        if (action.cost) {
            this.queue.push(payToPlayCardAction(action, player.index, parent, payment));
        }

        // If you use regolith eaters to remove 2 microbes to raise oxygen 1 step,
        // And that triggers an ocean, we want the ocean placement to come up before the action increments.
        // withPriority "unshifts" instead of pushing the items, so they go first.
        const withPriority = isChoiceAction;

        if (!isChoiceAction) {
            this.queue.push(markCardActionAsPlayed(parent, this.loggedInPlayerIndex, !action.cost));
        }

        this.playAction({
            action,
            state,
            parent,
            withPriority,
        });

        if (isChoiceAction) {
            this.queue.unshift(makeActionChoice(this.loggedInPlayerIndex));
        } else if (!action.useBlueCardActionAlreadyUsedThisGeneration) {
            this.queue.push(completeAction(this.loggedInPlayerIndex));
        }

        if (pendingActionReplay) {
            // Resolve the ask user to use blue card action call.
            this.queue.unshift(
                useBlueCardActionAlreadyUsedThisGeneration(this.loggedInPlayerIndex)
            );
        }

        this.processQueue();
    }

    playStandardProject({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment: PropertyCounter<Resource>;
    }) {
        const [canPlay, reason] = this.actionGuard.canPlayStandardProject(standardProjectAction);

        if (!canPlay) {
            throw new Error(reason);
        }

        const playerIndex = this.getLoggedInPlayerIndex();
        this.queue.push(payToPlayStandardProject(standardProjectAction, payment, playerIndex));

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

    confirmCardSelection({
        selectedCards,
        selectedPreludes,
        corporation,
        payment,
    }: {
        selectedCards: SerializedCard[];
        selectedPreludes: SerializedCard[];
        corporation: SerializedCard;
        payment?: PropertyCounter<Resource>;
    }) {
        const {state} = this;
        const {
            pendingDiscard,
            index: loggedInPlayerIndex,
            pendingCardSelection,
            cards,
        } = this.getLoggedInPlayer();

        if (!pendingCardSelection && !pendingDiscard) {
            throw new Error('No pending card selection to confirm');
        }
        const isBuyingCards = pendingCardSelection?.isBuyingCards ?? false;
        const possibleCards = pendingCardSelection ? pendingCardSelection.possibleCards : cards;
        const canConfirmCardSelection = this.actionGuard.canConfirmCardSelection(
            selectedCards.map(getCard),
            state,
            getCard(corporation),
            selectedPreludes.map(getCard)
        );
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
        switch (gameStage) {
            case GameStage.CORPORATION_SELECTION: {
                if (!this.actionGuard.canPlayCorporation(getCard(corporation))) {
                    throw new Error('Cannot play corporation');
                }
                this.dispatch(setCorporation(corporation, loggedInPlayerIndex));
                this.playCard({serializedCard: corporation});
                this.queue.push(payForCards(selectedCards, loggedInPlayerIndex, payment));
                this.queue.push(addCards(selectedCards, loggedInPlayerIndex));
                this.queue.push(setPreludes(selectedPreludes, loggedInPlayerIndex));
                this.queue.push(
                    discardCards(
                        possibleCards.filter(
                            card =>
                                !selectedCards.some(selectedCard => selectedCard.name === card.name)
                        ),
                        loggedInPlayerIndex
                    )
                );
                this.queue.push(announceReadyToStartRound(loggedInPlayerIndex));
                break;
            }
            case GameStage.DRAFTING: {
                this.queue.push(draftCard(selectedCards[0], loggedInPlayerIndex));
                break;
            }
            case GameStage.BUY_OR_DISCARD: {
                this.queue.push(payForCards(selectedCards, loggedInPlayerIndex, payment));
                this.queue.push(addCards(selectedCards, loggedInPlayerIndex));
                this.queue.push(
                    discardCards(
                        possibleCards.filter(
                            card =>
                                !selectedCards.some(selectedCard => selectedCard.name === card.name)
                        ),
                        loggedInPlayerIndex
                    )
                );
                this.queue.push(announceReadyToStartRound(loggedInPlayerIndex));
                break;
            }
            case GameStage.ACTIVE_ROUND: {
                if (isBuyingCards) {
                    this.dispatch(payForCards(selectedCards, loggedInPlayerIndex, payment));
                }
                this.dispatch(addCards(selectedCards, loggedInPlayerIndex));
                this.dispatch(
                    discardCards(
                        possibleCards.filter(
                            card =>
                                !selectedCards.some(selectedCard => selectedCard.name === card.name)
                        ),
                        loggedInPlayerIndex
                    )
                );
                break;
            }
        }

        this.processQueue();
    }

    continueAfterRevealingCards() {
        this.queue.push(discardRevealedCards());
        this.processQueue();
    }

    completeChooseDuplicateProduction({index}: {index: number}) {
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

    skipChooseDuplicateProduction() {
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

    claimMilestone({
        milestone,
        payment,
    }: {
        milestone: Milestone;
        payment: PropertyCounter<Resource>;
    }) {
        const [canPlay, reason] = this.actionGuard.canClaimMilestone(milestone);

        if (!canPlay) {
            throw new Error(reason);
        }

        const playerIndex = this.getLoggedInPlayerIndex();
        this.queue.push(claimMilestoneAction(milestone, payment, playerIndex));
        this.queue.push(completeAction(playerIndex));
        this.processQueue();
    }

    fundAward({award, payment}: {award: Award; payment: PropertyCounter<Resource>}) {
        const [canPlay, reason] = this.actionGuard.canFundAward(award);

        if (!canPlay) {
            throw new Error(reason);
        }

        const player = this.getLoggedInPlayer();
        if (player.fundAward) {
            this.queue.unshift(fundAwardAction(award, payment, player.index));
        } else {
            this.queue.push(fundAwardAction(award, payment, player.index));
            this.queue.push(completeAction(player.index));
        }

        this.processQueue();
    }

    doConversion({resource}: {resource: Resource}) {
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

    skipAction() {
        const [canSkip, reason] = this.actionGuard.canSkipAction();

        if (!canSkip) {
            throw new Error(reason);
        }

        this.queue.unshift(skipAction(this.loggedInPlayerIndex));
        const player = this.getLoggedInPlayer();
        const playablePreludes =
            player.preludes?.filter(prelude => {
                const card = getCard(prelude);
                return this.actionGuard.canPlayCard(card)[0];
            }) ?? [];
        if (playablePreludes.length === 0) {
            this.queue.push(discardPreludes(this.loggedInPlayerIndex));
        }
        this.processQueue();
    }

    completePlaceTile({cell}: {cell: Cell}) {
        const [canCompletePlaceTile, reason] = this.actionGuard.canCompletePlaceTile(cell);

        if (!canCompletePlaceTile) {
            throw new Error(reason);
        }

        const {state} = this;
        const loggedInPlayer = this.getLoggedInPlayer();
        const {pendingTilePlacement} = loggedInPlayer;

        const type = pendingTilePlacement!.type!;
        this.triggerEffectsFromTilePlacement(type, cell);

        const parameterForTile = this.getParameterForTile(type);
        if (parameterForTile) {
            this.playAction({
                state,
                action: {
                    increaseParameter: {
                        [parameterForTile as Parameter]: 1,
                    },
                },
                withPriority: true,
            });
        }

        this.queue.unshift(placeTile({type}, cell, loggedInPlayer.index));

        this.processQueue();
    }

    completeChooseResourceActionDetails({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }) {
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

    skipChooseResourceActionDetails() {
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

    increaseLowestProduction({production}: {production: Resource}) {
        const player = this.getLoggedInPlayer();
        if (!player.pendingIncreaseLowestProduction) {
            throw new Error('Cannot increase lowest production right now');
        }
        const lowestProductions = getLowestProductions(player);
        if (!lowestProductions.includes(production)) {
            throw new Error('This production is not one of the lowest');
        }

        this.queue.unshift(
            increaseProduction(production, player.pendingIncreaseLowestProduction, player.index),
            completeIncreaseLowestProduction(player.index)
        );
        this.processQueue();
    }

    private playActionBenefits(
        {action, state, parent, playedCard, thisPlayerIndex, withPriority}: PlayActionParams,
        queue = this.queue
    ) {
        const playerIndex = thisPlayerIndex ?? this.getLoggedInPlayerIndex();
        const items: Array<AnyAction> = [];
        // Must happen first (search for life "gains resource" based on discarded card)
        if (action.revealAndDiscardTopCards) {
            items.push(revealAndDiscardTopCards(action.revealAndDiscardTopCards, playerIndex));
        }
        for (const resource in action.gainResource) {
            items.push(
                this.createInitialGainResourceAction(
                    resource as Resource,
                    action.gainResource[resource],
                    playerIndex,
                    parent,
                    playedCard,
                    action.gainResourceTargetType
                )
            );
        }
        for (const tilePlacement of action?.tilePlacements ?? []) {
            items.push(askUserToPlaceTile(tilePlacement, playerIndex));
        }

        if (action.useBlueCardActionAlreadyUsedThisGeneration) {
            items.push(askUserToUseBlueCardActionAlreadyUsedThisGeneration(playerIndex));
        }

        if (action.choosePrelude) {
            items.push(askUserToChoosePrelude(action.choosePrelude, playerIndex));
        }

        if (action.fundAward) {
            items.push(askUserToFundAward(playerIndex));
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

        if (action.gainResourceWhenIncreaseProduction) {
            items.push(gainResourceWhenIncreaseProduction(playerIndex));
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
        if (action.increaseLowestProduction) {
            const lowestProductions = getLowestProductions(this.getLoggedInPlayer());
            if (lowestProductions.length === 1) {
                items.push(
                    increaseProduction(
                        lowestProductions[0],
                        action.increaseLowestProduction,
                        playerIndex
                    )
                );
            } else {
                items.push(
                    askUserToIncreaseLowestProduction(action.increaseLowestProduction, playerIndex)
                );
            }
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

        for (const resource in action.opponentsGainResource) {
            for (const opponent of state.players) {
                if (opponent.index === playerIndex) {
                    // This is only for opponents.
                    continue;
                }

                items.push(
                    this.createInitialGainResourceAction(
                        resource as Resource,
                        action.opponentsGainResource[resource],
                        opponent.index
                    )
                );
            }
        }

        if (Object.keys(action.gainResourceOption ?? {}).length > 0) {
            items.push(
                this.createGainResourceOptionAction(
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
                increaseParametersWithBonuses[parameter] = action.increaseParameter[parameter] ?? 0;
            }

            for (const parameter of parameters) {
                // Start referring to the copied increaseParameter exclusively.
                const amount = increaseParametersWithBonuses[parameter];
                if (!amount) {
                    continue;
                }
                items.push(increaseParameter(parameter as Parameter, amount, playerIndex));
                // Check every step along the way for bonuses!
                for (let i = 1; i <= amount; i++) {
                    this.triggerEffectsFromIncreasedParameter(parameter);
                    // If the increase triggers a parameter increase, update the object.
                    // Relying on the order of the parameters variable here.
                    const newLevel =
                        i * PARAMETER_STEPS[parameter] + state.common.parameters[parameter];
                    const getBonus = PARAMETER_BONUSES[parameter][newLevel];
                    if (!getBonus) {
                        continue;
                    }
                    const bonus = getBonus(playerIndex);
                    const {payload} = bonus;
                    if (increaseParameter.match(bonus)) {
                        // combine the bonus parameter increase with the rest of the parameter increases.
                        // That way an oxygen can trigger a temperature which triggers an
                        // ocean.
                        increaseParametersWithBonuses[payload.parameter] += payload.amount;
                    } else if (increaseTerraformRating.match(bonus)) {
                        // combine terraform increases into one action/log message.
                        (terraformRatingIncrease as number) += payload.amount as number;
                    } else {
                        items.push(bonus);
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

        if (action.revealTakeAndDiscard) {
            items.push(revealTakeAndDiscard(action.revealTakeAndDiscard, playerIndex));
        }
        if (withPriority) {
            queue.unshift(...items);
        } else {
            queue.push(...items);
        }
    }

    private discardCards(
        {action, parent, playedCard, thisPlayerIndex}: PlayActionParams,
        queue = this.queue
    ) {
        const playerIndex = thisPlayerIndex ?? this.getLoggedInPlayerIndex();
        const numCardsToDiscard = action.removeResource?.[Resource.CARD] ?? 0;

        if (numCardsToDiscard) {
            queue.unshift(
                askUserToDiscardCards(
                    playerIndex,
                    numCardsToDiscard,
                    parent,
                    playedCard,
                    action?.actionType === ActionType.STANDARD_PROJECT
                )
            );
        }
    }

    private playActionCosts(
        {action, parent, playedCard, thisPlayerIndex, withPriority}: PlayActionParams,
        queue = this.queue
    ) {
        const playerIndex = thisPlayerIndex ?? this.getLoggedInPlayerIndex();
        const items: Array<AnyAction> = [];

        for (const production in action.decreaseProduction) {
            items.push(
                this.createDecreaseProductionAction(
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

        if (action.choice && action.choice.length > 0) {
            items.push(askUserToMakeActionChoice(action.choice, parent!, playedCard!, playerIndex));
        }

        for (const resource in action.removeResource) {
            // Must remove card resources (discard) before anything else happens.
            if (resource === Resource.CARD) continue;
            items.push(
                this.createInitialRemoveResourceAction(
                    resource as Resource,
                    action.removeResource[resource],
                    playerIndex,
                    parent,
                    playedCard,
                    action.removeResourceSourceType,
                    action
                )
            );
        }

        if (Object.keys(action.removeResourceOption ?? {}).length > 0) {
            items.push(
                this.createRemoveResourceOptionAction(
                    action.removeResourceOption!,
                    playerIndex,
                    parent,
                    action.removeResourceSourceType
                )
            );
        }
        if (withPriority) {
            queue.unshift(...items);
        } else {
            queue.push(...items);
        }
    }

    private playAction(playActionParams: PlayActionParams) {
        const items: AnyAction[] = [];
        this.discardCards(playActionParams, items);
        this.playActionCosts(playActionParams, items);
        this.playActionBenefits(playActionParams, items);
        if (
            playActionParams.playImmediatelyIfNoUserInputNeeded &&
            !items.some(item => this.shouldPause(item))
        ) {
            this.processQueue(items);
        } else if (playActionParams.withPriority) {
            this.queue.unshift(...items);
        } else {
            this.queue.push(...items);
        }
    }

    private createDecreaseProductionAction(
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        parent?: Card
    ) {
        if (amount === VariableAmount.USER_CHOICE_MIN_ZERO) {
            return askUserToChooseResourceActionDetails({
                actionType: 'decreaseProduction',
                resourceAndAmounts: [{resource, amount}],
                card: parent!,
                playerIndex,
            });
        } else {
            return decreaseProduction(resource, amount, playerIndex);
        }
    }

    private createGainResourceOptionAction(
        options: PropertyCounter<Resource>,
        playerIndex: number,
        parent?: Card,
        playedCard?: Card,
        locationType?: ResourceLocationType
    ) {
        // HACK: all instances of `gainResourceOption` use a number amount, so we don't account for variable amounts here
        const resourceAndAmounts = Object.keys(options).map((resource: Resource) => ({
            resource,
            amount: options[resource] as number,
        }));
        return askUserToChooseResourceActionDetails({
            actionType: 'gainResource',
            resourceAndAmounts,
            card: parent!,
            playedCard,
            locationType,
            playerIndex,
        });
    }

    private createInitialGainResourceAction(
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        parent?: Card,
        playedCard?: Card,
        locationType?: ResourceLocationType
    ) {
        const requiresLocationChoice =
            locationType &&
            USER_CHOICE_LOCATION_TYPES.includes(locationType) &&
            resource !== Resource.CARD;
        if (requiresLocationChoice) {
            return askUserToChooseResourceActionDetails({
                actionType: 'gainResource',
                resourceAndAmounts: [{resource, amount}],
                card: parent!,
                playedCard,
                locationType,
                playerIndex,
            });
        }

        if (isStorableResource(resource)) {
            return gainStorableResource(resource, amount, parent!, playerIndex);
        } else {
            return gainResource(resource, amount, playerIndex);
        }
    }

    private createInitialRemoveResourceAction(
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        parent?: Card,
        playedCard?: Card,
        locationType?: ResourceLocationType,
        action?: Action
    ) {
        const requiresLocationChoice =
            locationType && USER_CHOICE_LOCATION_TYPES.includes(locationType);
        const requiresAmountChoice = amount === VariableAmount.USER_CHOICE;

        if (requiresAmountChoice || requiresLocationChoice) {
            return askUserToChooseResourceActionDetails({
                actionType: 'removeResource',
                resourceAndAmounts: [{resource, amount}],
                card: parent!,
                playedCard,
                locationType,
                playerIndex,
            });
        }

        if (isStorableResource(resource)) {
            // Assumes you're removing from "This card" (parent)
            return removeStorableResource(resource, amount as number, playerIndex, parent!);
        } else {
            // Assumes you're removing from your own resources
            return removeResource(resource, amount as number, playerIndex, playerIndex);
        }
    }

    private createRemoveResourceOptionAction(
        options: PropertyCounter<Resource>,
        playerIndex: number,
        parent?: Card,
        locationType?: ResourceLocationType
    ) {
        // HACK: all instances of `removeResourceOption` use a number amount, so we don't account for variable amounts here
        const resourceAndAmounts = Object.keys(options).map((resource: Resource) => ({
            resource,
            amount: options[resource] as number,
        }));
        return askUserToChooseResourceActionDetails({
            actionType: 'removeResource',
            resourceAndAmounts,
            card: parent!,
            locationType,
            playerIndex,
        });
    }

    private getParameterForTile(tileType: TileType): Parameter | undefined {
        if (tileType === TileType.OCEAN) {
            return Parameter.OCEAN;
        }

        if (tileType === TileType.GREENERY) {
            return Parameter.OXYGEN;
        }

        return undefined;
    }

    private shouldPause(action: {type: string}): boolean {
        return PAUSE_ACTIONS.includes(action.type);
    }
}

export function getActionsFromEffectForPlayer(
    player: PlayerState,
    event: EffectEvent,
    loggedInPlayer: PlayerState,
    additionalCards: Card[] = []
) {
    const list: ActionCardPair[] = [];
    for (const card of getPlayedCards(player).concat(additionalCards)) {
        for (const effect of card.effects) {
            if (effect.trigger && effect.action) {
                const actions = getActionsFromEffect(
                    event,
                    effect.trigger,
                    effect.action,
                    player,
                    loggedInPlayer.index
                );
                list.push(...actions.map(action => [action, card] as ActionCardPair));
            }
        }
    }
    return list;
}

function getActionsFromEffect(
    event: EffectEvent,
    trigger: EffectTrigger,
    effectAction: Action,
    player: PlayerState,
    currentPlayerIndex: number
): Action[] {
    if (!trigger.anyPlayer && player.index !== currentPlayerIndex) return [];

    if (trigger.placedTile) {
        if (trigger.onMars && event.cell?.type === CellType.OFF_MARS) return [];
        // Special case! Capital is a city.
        if (trigger.placedTile === TileType.CITY && event.placedTile === TileType.CAPITAL) {
            return [effectAction];
        }
        if (event.placedTile !== trigger.placedTile) return [];

        return [effectAction];
    }

    if (trigger.steelOrTitaniumPlacementBonus) {
        const bonus = event.cell?.bonus || [];
        if (!bonus.includes(Resource.STEEL) && !bonus.includes(Resource.TITANIUM)) return [];
        return [effectAction];
    }

    if (trigger.nonNegativeVictoryPointsIcon) {
        // Special case (technically has a non-negative VP icon on it)
        if (event.name === 'Vitor') return [effectAction];
        if (event.victoryPoints) {
            // Check if icon is non-negative (or variable)
            if (typeof event.victoryPoints === 'number') {
                return event.victoryPoints >= 0 ? [effectAction] : [];
            }
            return [effectAction];
        }
        return [];
    }

    if (trigger.standardProject) {
        if (!event.standardProject) return [];

        return [effectAction];
    }

    if (trigger.increasedParameter) {
        if (event.increasedParameter !== trigger.increasedParameter) return [];

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

type ActionCardPair = [Action, Card];
