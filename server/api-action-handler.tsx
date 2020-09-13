import {GameActionHandler} from 'client-server-shared/game-action-handler-interface';
import {Card} from 'models/card';
import {PropertyCounter} from 'constants/property-counter';
import {Resource, ResourceLocationType, ResourceAndAmount} from 'constants/resource';
import {Action, ParameterCounter} from 'constants/action';
import {StandardProjectAction} from 'constants/standard-project';
import {Milestone, Award, Tile, Cell, Parameter, t, TileType, CellType} from 'constants/board';
import {ResourceActionOption} from 'components/ask-user-to-confirm-resource-action-details';
import {GameState, RootState, reducer, PlayerState} from 'reducer';
import {
    payToPlayCard,
    addParameterRequirementAdjustments,
    applyDiscounts,
    applyExchangeRateChanges,
    addForcedActionToPlayer,
    completeAction,
    removeResource,
    askUserToChooseResourceActionDetails,
    askUserToMakeActionChoice,
    askUserToPlaceTile,
    revealAndDiscardTopCards,
    askUserToLookAtCards,
    increaseProduction,
    askUserToDuplicateProduction,
    increaseParameter,
    gainResource,
    increaseTerraformRating,
    setPlantDiscount,
    moveCardFromHandToPlayArea,
} from 'actions';
import {CardType} from 'constants/card-types';
import {
    createGainResourceOptionAction,
    createRemoveResourceOptionAction,
    createInitialGainResourceAction,
    createInitialRemoveResourceAction,
    filterOceanPlacementsOverMax,
    shouldPause,
    createDecreaseProductionAction,
    ActionCardPair,
    EffectEvent,
} from 'context/app-context';
import {ActionGuard} from 'client-server-shared/action-guard';
import {EffectTrigger} from 'constants/effect-trigger';

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
        this.actionGuard = new ActionGuard(game, username);
    }

    private loggedInPlayerIndex: number;
    private getLoggedInPlayerIndex(): number {
        return this.loggedInPlayerIndex;
    }
    private getLoggedInPlayer(): PlayerState {
        return this.state.players[this.loggedInPlayerIndex];
    }

    private get queue() {
        return this.game.queue;
    }

    private get state() {
        return this.game.state;
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

        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card affects itself.
        this.triggerEffectsFromPlayedCard(card);
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
        action,
        parent,
        payment,
        choiceIndex,
    }: {
        action: Action;
        parent: Card;
        payment?: PropertyCounter<Resource>;
        choiceIndex?: number;
    }): Promise<void> {}

    async playStandardProjectAsync({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {}

    async claimMilestoneAsync({
        milestone,
        payment,
    }: {
        milestone: Milestone;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {}

    async fundAwardAsync({
        award,
        payment,
    }: {
        award: Award;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {}

    async skipActionAsync(): Promise<void> {}

    async completePlaceTileAsync({tile, cell}: {tile: Tile; cell: Cell}): Promise<void> {}

    async completeChooseResourceActionDetailsAsync({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }): Promise<void> {}

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
        state: RootState;
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

        if (action.increaseParameter) {
            // Ensure oxygen is checked before temperature.
            const parameters: Parameter[] = [
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
                    const newLevel = amount + state.common.parameters[parameter];
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
                                items.push(increaseTerraformRating(1, playerIndex));
                            }
                            break;
                    }
                }
            }
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