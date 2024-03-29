import {
    addActionToPlay,
    addCards,
    addForcedActionToPlayer,
    addGameActionToLog,
    addParameterRequirementAdjustments,
    announceReadyToStartRound,
    applyDiscounts,
    applyExchangeRateChanges,
    askUserToChooseNextAction,
    askUserToChoosePrelude,
    askUserToChooseResourceActionDetails,
    askUserToDiscardCards,
    askUserToDuplicateProduction,
    askUserToExchangeNeutralNonLeaderDelegate,
    askUserToFundAward,
    askUserToGainStandardResources,
    askUserToIncreaseAndDecreaseColonyTileTracks,
    askUserToIncreaseLowestProduction,
    askUserToLookAtCards,
    askUserToMakeActionChoice,
    askUserToPlaceColony,
    askUserToPlaceDelegatesInOneParty,
    askUserToPlaceTile,
    askUserToPlayCardFromHand,
    askUserToPutAdditionalColonyTileIntoPlay,
    askUserToRemoveNonLeaderDelegate,
    askUserToRemoveTile,
    askUserToTradeForFree,
    askUserToUseBlueCardActionAlreadyUsedThisGeneration,
    claimMilestone as claimMilestoneAction,
    clearPendingActionChoice,
    completeAction,
    completeChooseNextAction,
    completeGainStandardResources,
    completeIncreaseLowestProduction,
    completeTradeForFree,
    completeUserToPutAdditionalColonyTileIntoPlay,
    decreaseParameter,
    decreaseProduction,
    decreaseTerraformRating,
    discardCards,
    discardPreludes,
    draftCard,
    exchangeChairman,
    exchangeNeutralNonLeaderDelegate,
    fundAward as fundAwardAction,
    gainResource,
    gainResourceWhenIncreaseProduction,
    gainStorableResource,
    gainTradeFleet,
    increaseAndDecreaseColonyTileTracks,
    increaseBaseInfluence,
    increaseColonyTileTrackRange,
    increaseParameter,
    increaseProduction,
    increaseStoredResourceAmount,
    increaseTerraformRating,
    makeActionChoice,
    makeLogItem,
    makePartyRuling,
    makePayment,
    markCardActionAsPlayed,
    moveCardFromHandToPlayArea,
    moveColonyTileTrack,
    moveFleet,
    NEGATIVE_ACTIONS,
    noopAction,
    passGeneration,
    PAUSE_ACTIONS,
    payForCards,
    payToPlayCard,
    payToPlayCardAction,
    payToPlayStandardProject,
    placeColony,
    placeDelegatesInOneParty,
    placeTile,
    removeForcedActionFromPlayer,
    removeNonLeaderDelegate,
    removeResource,
    removeStorableResource,
    removeTile,
    revealAndDiscardTopCards,
    revealTakeAndDiscard,
    setCorporation,
    setGame,
    setNotes,
    setOceanAdjacencybonus,
    setPlantDiscount,
    setPreludes,
    skipAction,
    skipChoice,
    useBlueCardActionAlreadyUsedThisGeneration,
    wrapUpTurmoil,
} from 'actions';
import {ActionGuard} from 'client-server-shared/action-guard';
import {WrappedGameModel} from 'client-server-shared/wrapped-game-model';
import {
    canPlayActionNext,
    getPlayerIndex,
    userCannotChooseAction,
} from 'components/ask-user-to-choose-next-action';
import {getOptionsForDuplicateProduction} from 'components/ask-user-to-confirm-duplicate-production';
import {
    canSkipResourceActionDetails,
    getAction,
    getPlayerOptionWrappers,
    ResourceActionOption,
    ResourceActionType,
} from 'components/ask-user-to-confirm-resource-action-details';
import {getLowestProductions} from 'components/ask-user-to-increase-lowest-production';
import {
    Action,
    ActionType,
    ActionWithoutSteps,
    Amount,
    ParameterCounter,
    Payment,
} from 'constants/action';
import {
    Cell,
    CellType,
    getTilePlacementBonus,
    Parameter,
    TilePlacement,
    TileType,
} from 'constants/board';
import {CardType} from 'constants/card-types';
import {getColony} from 'constants/colonies';
import {Conversion} from 'constants/conversion';
import {EffectTrigger} from 'constants/effect-trigger';
import {
    GameStage,
    MAX_PARAMETERS,
    MinimumProductions,
    PARAMETER_STEPS,
} from 'constants/game';
import {getGlobalEvent} from 'constants/global-events';
import {PARAMETER_BONUSES} from 'constants/parameter-bonuses';
import {getPartyConfig} from 'constants/party';
import {
    NumericPropertyCounter,
    PropertyCounter,
} from 'constants/property-counter';
import {
    isStorableResource,
    ResourceAndAmount,
    ResourceLocationType,
    STANDARD_RESOURCES,
    USER_CHOICE_LOCATION_TYPES,
} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {
    getStandardProjects,
    StandardProjectType,
} from 'constants/standard-project';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {GameAction, GameActionType} from 'GameActionState';
import {Card} from 'models/card';
import {GameState, getNumOceans, PlayerState, reducer} from 'reducer';
import {AnyAction} from 'redux';
import {getAdjacentCellsForCell} from 'selectors/board';
import {canPlaceColony} from 'selectors/can-build-colony';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {getSupplementalQuantity} from 'selectors/does-player-have-required-resource-to-remove';
import {getCard} from 'selectors/get-card';
import {getEligibleTradeIncomes} from 'selectors/get-eligible-trade-incomes';
import {
    getIsPlayerMakingDecision,
    getIsPlayerMakingDecisionExceptForNextActionChoice,
} from 'selectors/get-is-player-making-decision';
import {getLobbyingAction} from 'selectors/get-lobbying-action';
import {getPlayedCards} from 'selectors/get-played-cards';
import {isActionPhase} from 'selectors/is-action-phase';
import {getForcedActionsForPlayer} from 'selectors/player';
import {getValidTradePayment} from 'selectors/valid-trade-payment';
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
    placedColony?: boolean;
    increasedTerraformRating?: boolean;
}

export type SupplementalResources = {name: string; quantity: number};

export type PlayActionParams = {
    action: ActionWithoutSteps;
    state: GameState;
    parent?: Card; // origin of action
    playedCard?: Card; // card that triggered action
    thisPlayerIndex?: number;
    withPriority?: boolean;
    supplementalResources?: SupplementalResources;
    groupEffects?: boolean;
    reverseOrder?: boolean;
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

    private get queue(): AnyAction[] {
        return this.game.queue;
    }

    private set queue(queue: AnyAction[]) {
        this.game.queue = queue;
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

        const forcedActions = getForcedActionsForPlayer(
            state,
            currentPlayerIndex
        );

        for (const forcedAction of forcedActions) {
            this.playAction({
                state,
                action: forcedAction,
                thisPlayerIndex: currentPlayerIndex,
            });
            this.queue.push(completeAction(currentPlayerIndex));
            this.queue.push(
                removeForcedActionFromPlayer(currentPlayerIndex, forcedAction)
            );
        }
        if (forcedActions.length > 0) {
            this.processQueue();
        }
    }

    handleTurmoilIfNeeded(originalState: GameState) {
        if (
            !this.state.timeForTurmoil ||
            !this.state.common.turmoil ||
            originalState.timeForTurmoil
        ) {
            return;
        }

        // Pristar
        for (const player of this.state.players) {
            if (!player.terraformedThisGeneration) {
                for (const playedCard of player.playedCards) {
                    const fullCard = getCard(playedCard);
                    if (fullCard.gainResourcesIfNotTerraformedThisGeneration) {
                        for (const resource in fullCard.gainResourcesIfNotTerraformedThisGeneration) {
                            this.queue.push(
                                this.createInitialGainResourceAction(
                                    resource as Resource,
                                    fullCard
                                        .gainResourcesIfNotTerraformedThisGeneration[
                                        resource
                                    ],
                                    player.index,
                                    fullCard,
                                    fullCard,
                                    fullCard.gainResourceTargetType
                                )
                            );
                        }
                    }
                }
            }
        }

        this.queue.push(
            makeLogItem({
                actionType: GameActionType.GAME_UPDATE,
                text: `⚔️ Turmoil`,
            })
        );

        // Decrease everyone's terraform rating one step.
        for (const player of this.state.players) {
            this.queue.push(decreaseTerraformRating(1, player.index));
        }

        const {turmoil} = this.state.common;

        // Is there a current global event? If so, play the action.
        if (turmoil.currentGlobalEvent) {
            const globalEvent = getGlobalEvent(turmoil.currentGlobalEvent.name);
            if (globalEvent) {
                this.queue.push(
                    makeLogItem({
                        actionType: GameActionType.GAME_UPDATE,
                        text: `⚔️ Global Event: ${globalEvent.bottom.name}`,
                    })
                );
                const {action, firstPlayerAction} = globalEvent;
                if (firstPlayerAction) {
                    this.playAction({
                        action: firstPlayerAction,
                        thisPlayerIndex: this.state.common.firstPlayerIndex,
                        state: this.state,
                    });
                }
                for (const playerIndex of this.state.common
                    .playerIndexOrderForGeneration) {
                    this.playAction({
                        action,
                        thisPlayerIndex: playerIndex,
                        state: this.state,
                    });
                }
            }
        }

        this.queue.push(makePartyRuling());
        const rulingParty = getPartyConfig(turmoil.dominantParty);
        if (rulingParty) {
            for (const playerIndex of this.state.common
                .playerIndexOrderForGeneration) {
                this.playAction({
                    action: rulingParty.partyBonus,
                    thisPlayerIndex: playerIndex,
                    state: this.state,
                });
            }
        }
        this.queue.push(wrapUpTurmoil());
        this.processQueue();
    }

    playCard({
        serializedCard,
        payment,
        conditionalPayments,
        supplementalResources,
    }: {
        serializedCard: SerializedCard;
        payment: Payment;
        conditionalPayments?: number[];
        supplementalResources?: SupplementalResources;
    }) {
        const card = getCard(serializedCard);
        const playerIndex = this.getLoggedInPlayerIndex();
        const loggedInPlayer = this.getLoggedInPlayer();

        const [canPlay, reason] = this.actionGuard.canPlayCard(
            card,
            loggedInPlayer,
            payment,
            conditionalPayments,
            supplementalResources
        );

        if (!canPlay) {
            throw new Error(reason);
        }
        this.addGameActionToLog({
            actionType: GameActionType.CARD,
            playerIndex,
            card: {name: card.name},
            payment,
        });

        this.queue.unshift(moveCardFromHandToPlayArea(card, playerIndex));

        // 1. Pay for the card.
        //    - This should account for discounts
        //    - This should account for non-MC payment, which is prompted by the UI
        //      and included in `payment`
        //    - If no `payment` is defined, the reducer will defer to paying with MC.
        //      As of Nov 2021, `payment` should always be defined.
        if (typeof card.cost !== 'undefined') {
            this.queue.push(
                payToPlayCard(card, playerIndex, payment, conditionalPayments)
            );
        }

        // 2. Apply effects that will affect future turns:
        //     - parameter requirement adjustments (next turn or permanent)
        //     - discounts (card discounts, standard project discounts, etc)
        //     - exchange rates (e.g. advanced alloys)
        this.queue.push(
            addParameterRequirementAdjustments(
                card.parameterRequirementAdjustments ?? {},
                card.temporaryParameterRequirementAdjustments ?? {},
                playerIndex
            )
        );
        this.queue.push(applyDiscounts(card.discounts, playerIndex));

        this.processQueue();

        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card effects itself.
        // Must also happen after payment.
        this.triggerEffectsFromPlayedCard(card);

        if (card.playCard) {
            this.queue.push(
                askUserToPlayCardFromHand(card.playCard, playerIndex)
            );
        }
        if (Object.keys(card.exchangeRates).length > 0) {
            this.queue.push(
                applyExchangeRateChanges(
                    card.name,
                    card.exchangeRates,
                    playerIndex
                )
            );
        }

        // 3. Play the action
        //     - action steps
        //     - action choices (done with priority)
        //     - gaining/losing/stealing resources & production
        //     - tile pacements
        //     - discarding/drawing cards
        this.playActionSteps(card);

        const playActionParams = {
            action: card,
            state: this.state,
            parent: card,
            supplementalResources,
        };
        // Get the resources/production/cards first.
        // Trigger effects after.
        this.playActionBenefits({...playActionParams, withPriority: true});
        this.discardCards(playActionParams);
        // Finally, pay the costs.
        this.playActionCosts(playActionParams);

        if (card.forcedAction) {
            this.queue.push(
                addForcedActionToPlayer(playerIndex, card.forcedAction)
            );
        }

        const isEphemeralPrelude =
            card.type === CardType.PRELUDE && loggedInPlayer.choosePrelude;

        if (isEphemeralPrelude) {
            this.queue.push(setPreludes([], playerIndex));
        }

        // Don't call `completeAction` for corporations, because we use `player.action` as a proxy
        // for players being ready to start round 1, and don't want to increment it.
        if (
            card.type !== CardType.CORPORATION &&
            !card.playCard &&
            !isEphemeralPrelude
        ) {
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
        this.triggerEffects({
            increasedTerraformRating: true,
        });
    }

    private triggerEffectsFromIncreasedTerraformRating() {
        this.triggerEffects({
            increasedTerraformRating: true,
        });
    }

    private triggerEffectsFromTilePlacement(placedTile: TileType, cell: Cell) {
        this.triggerEffects({
            placedTile,
            cell,
        });
    }

    private triggerEffectsFromPlacedColony() {
        this.triggerEffects({
            placedColony: true,
        });
    }

    private triggerEffects(event: EffectEvent, playedCard?: Card) {
        const {state} = this;
        const player = this.getLoggedInPlayer();
        // track the card that triggered the action so we can "add resources to this card"
        // e.g. Ecological Zone

        for (const thisPlayer of state.players) {
            const actionCardPairs = getActionsFromEffectForPlayer(
                thisPlayer,
                event,
                player
            );
            for (const [action, card] of actionCardPairs) {
                this.playAction({
                    action,
                    state,
                    parent: card,
                    playedCard,
                    thisPlayerIndex: thisPlayer.index,
                    withPriority: !!event.placedTile,
                });
                this.playActionSteps(action);
            }
        }

        this.triggerRulingPartyPolicyIfNeeded(event, playedCard);
    }

    triggerRulingPartyPolicyIfNeeded(event: EffectEvent, playedCard?: Card) {
        const {state} = this;
        const {turmoil} = state.common;
        if (!turmoil) return;

        if (!isActionPhase(state)) {
            return;
        }

        const party = getPartyConfig(turmoil.rulingParty);

        const {effect} = party;
        if (!effect) return;

        const player = this.getLoggedInPlayer();

        const actions = getActionsFromEffect(
            event,
            effect.trigger,
            effect.action,
            player,
            player.index
        );
        for (const action of actions) {
            this.playAction({
                action,
                playedCard,
                state,
                thisPlayerIndex: player.index,
                withPriority: !!event.placedTile,
            });
            this.playActionSteps(action);
        }
    }

    private shouldMakeUserChooseNextAction(items: AnyAction[]): boolean {
        items = items.filter(Boolean);
        if (items.length < 2) {
            return false;
        }

        const player = this.getLoggedInPlayer();

        const actions: Action[][] = items
            .map<Action[]>(item => {
                if (!addActionToPlay.match(item)) {
                    return [];
                }

                const {action} = item.payload;

                return [action, ...(action?.steps ?? [])];
            })
            .filter(actions =>
                actions.some(
                    action =>
                        action?.gainResource?.[Resource.CARD] ||
                        action?.removeResource?.[Resource.CARD]
                )
            );

        const choiceItems = items.filter(
            item =>
                this.shouldPause(item) ||
                (gainResource.match(item) &&
                    item.payload.resource === Resource.CARD)
        );

        if (choiceItems.length + actions.length > 1) {
            return true;
        }

        if (
            player.corporation.name === 'Helion' &&
            player.resources[Resource.HEAT] > 0
        ) {
            for (const item of items) {
                if (
                    removeResource.match(item) &&
                    item.payload.resource === Resource.MEGACREDIT
                ) {
                    // We need the player to be able to pay with heat...
                    return true;
                }
            }
        }

        if (hasUnpaidResources(items, this.state, player, this.actionGuard)) {
            return true;
        }

        return false;
    }

    setStateCheckpoint = false;

    private processQueue(
        items = this.queue,
        processingExistingItems = false,
        overrideShouldMakeNextChoice = false
    ) {
        const currentPlayerIndex = this.state.common.currentPlayerIndex;
        const shouldMakeNextChoice =
            !overrideShouldMakeNextChoice &&
            !this.state.timeForTurmoil &&
            this.shouldMakeUserChooseNextAction(items);
        if (shouldMakeNextChoice) {
            if (processingExistingItems) {
                return;
            }
            this.dispatch(askUserToChooseNextAction(items, currentPlayerIndex));
            // Don't double count the queue items next time around...
            this.queue = [];
        } else {
            const newItems: AnyAction[] = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item) continue;
                if (addActionToPlay.match(item)) {
                    const {action, reverseOrder, playerIndex} = item.payload;
                    this.handlePlayActionFromAddActionToPlay(
                        action,
                        reverseOrder,
                        playerIndex,
                        newItems
                    );
                } else {
                    newItems.push(item);
                }
            }
            items = newItems;
            let thisPlayerIndex = currentPlayerIndex;
            let item;
            while (items.length > 0) {
                item = items.shift();

                if (!item) {
                    continue;
                }
                thisPlayerIndex = getPlayerIndex(item);
                this.dispatch(item);
                if (
                    thisPlayerIndex !== undefined &&
                    thisPlayerIndex !== this.loggedInPlayerIndex
                ) {
                    this.setStateCheckpoint = true;
                }
                if (
                    gainResource.match(item) &&
                    item.payload.resource === Resource.CARD
                ) {
                    this.setStateCheckpoint = true;
                }
                if (this.shouldPause(item)) {
                    break;
                }
            }
            if (!processingExistingItems) {
                this.queue = items;
            }
            const currentPlayer = this.state.players[currentPlayerIndex];
            const existingItems = [
                ...(currentPlayer.pendingNextActionChoice ?? []),
            ];
            if (
                existingItems.filter(Boolean).length > 0 &&
                !processingExistingItems &&
                !this.shouldPause(item)
            ) {
                this.processQueue(existingItems, true);
            } else if (processingExistingItems) {
                this.dispatch(clearPendingActionChoice(currentPlayer.index));
                this.queue = items;
            }
        }
    }

    private dispatch(action: AnyAction) {
        const newState = reducer(this.game.state, action);
        if (newState) {
            this.game.state = newState;
        }
    }

    private addGameActionToLog(gameAction: GameAction) {
        this.dispatch(addGameActionToLog(gameAction));
    }

    playCardAction({
        serializedCard,
        payment,
        supplementalResources,
        choiceIndex,
    }: {
        serializedCard: {name: string};
        payment?: Payment;
        supplementalResources?: SupplementalResources;
        choiceIndex?: number;
    }) {
        const player = this.getLoggedInPlayer();
        const {playedCards} = player;
        const playedCard = playedCards.find(
            card => card.name === serializedCard.name
        );
        if (!playedCard) {
            throw new Error('Cannot find played card');
        }
        const parent = getCard(playedCard);
        let action = parent.action;
        let isChoiceAction = false;
        const {pendingActionReplay} = player;

        const {lastRoundUsedAction} = parent;

        if (
            lastRoundUsedAction === this.state.common.generation &&
            !pendingActionReplay
        ) {
            throw new Error('Already used action this round');
        }

        if (
            lastRoundUsedAction !== this.state.common.generation &&
            pendingActionReplay
        ) {
            throw new Error(
                'Can only replay an action you have already played'
            );
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
                payment,
                supplementalResources
            );
        } else {
            [canPlay, reason] = this.actionGuard.canPlayCardAction(
                action,
                parent,
                player,
                state,
                payment,
                supplementalResources
            );
        }

        if (!canPlay) {
            throw new Error(reason);
        }

        this.addGameActionToLog({
            actionType: GameActionType.CARD_ACTION,
            playerIndex: player.index,
            card: {name: parent.name},
            payment,
            choiceIndex,
        });

        if (action.cost) {
            this.queue.push(
                payToPlayCardAction(action, player.index, parent, payment)
            );
        }

        // If you use regolith eaters to remove 2 microbes to raise oxygen 1 step,
        // And that triggers an ocean, we want the ocean placement to come up before the action increments.
        // withPriority "unshifts" instead of pushing the items, so they go first.
        const withPriority = isChoiceAction;

        if (!isChoiceAction) {
            this.queue.push(
                markCardActionAsPlayed(
                    parent,
                    this.loggedInPlayerIndex,
                    !action.cost
                )
            );
        }

        this.playAction({
            action,
            state,
            parent,
            withPriority,
            supplementalResources,
        });

        if (isChoiceAction) {
            this.queue.unshift(makeActionChoice(this.loggedInPlayerIndex));
        } else if (!action.useBlueCardActionAlreadyUsedThisGeneration) {
            this.queue.push(completeAction(this.loggedInPlayerIndex));
        }

        if (pendingActionReplay) {
            // Resolve the ask user to use blue card action call.
            this.queue.unshift(
                useBlueCardActionAlreadyUsedThisGeneration(
                    this.loggedInPlayerIndex
                )
            );
        }

        this.processQueue();
    }

    playStandardProject({
        standardProjectActionType,
        payment,
    }: {
        standardProjectActionType: StandardProjectType;
        payment: NumericPropertyCounter<Resource>;
    }) {
        const standardProjectAction = getStandardProjects(this.state).find(
            action => action.type === standardProjectActionType
        );
        if (!standardProjectAction) {
            throw new Error('Standard project not available');
        }
        const [canPlay, reason] = this.actionGuard.canPlayStandardProject(
            standardProjectAction
        );

        if (!canPlay) {
            throw new Error(reason);
        }

        const playerIndex = this.getLoggedInPlayerIndex();

        this.addGameActionToLog({
            actionType: GameActionType.STANDARD_PROJECT,
            playerIndex,
            standardProject: standardProjectActionType,
            payment,
        });

        this.queue.push(
            payToPlayStandardProject(
                standardProjectAction,
                payment,
                playerIndex
            )
        );

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
        payment?: NumericPropertyCounter<Resource>;
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
        const possibleCards = pendingCardSelection
            ? pendingCardSelection.possibleCards
            : cards;
        const canConfirmCardSelection =
            this.actionGuard.canConfirmCardSelection(
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
                possibleCards.some(
                    possibleCard => possibleCard.name === selectedCard.name
                )
            )
        ) {
            throw new Error('Trying to select invalid card');
        }
        if (pendingDiscard) {
            this.queue.unshift(
                discardCards(selectedCards, loggedInPlayerIndex)
            );
            this.processQueue();
            return;
        }
        const gameStage = this.getGameStage();
        switch (gameStage) {
            case GameStage.CORPORATION_SELECTION: {
                if (
                    !this.actionGuard.canPlayCorporation(getCard(corporation))
                ) {
                    throw new Error('Cannot play corporation');
                }
                this.dispatch(setCorporation(corporation, loggedInPlayerIndex));
                this.playCard({serializedCard: corporation, payment: {}});
                this.queue.push(
                    payForCards(selectedCards, loggedInPlayerIndex, payment)
                );
                this.queue.push(addCards(selectedCards, loggedInPlayerIndex));
                this.queue.push(
                    setPreludes(selectedPreludes, loggedInPlayerIndex)
                );
                this.queue.push(
                    discardCards(
                        possibleCards.filter(
                            card =>
                                !selectedCards.some(
                                    selectedCard =>
                                        selectedCard.name === card.name
                                )
                        ),
                        loggedInPlayerIndex
                    )
                );
                this.queue.push(announceReadyToStartRound(loggedInPlayerIndex));
                break;
            }
            case GameStage.DRAFTING: {
                this.queue.push(
                    draftCard(selectedCards[0], loggedInPlayerIndex)
                );
                break;
            }
            case GameStage.BUY_OR_DISCARD: {
                this.queue.push(
                    payForCards(selectedCards, loggedInPlayerIndex, payment)
                );
                this.queue.push(addCards(selectedCards, loggedInPlayerIndex));
                this.queue.push(
                    discardCards(
                        possibleCards.filter(
                            card =>
                                !selectedCards.some(
                                    selectedCard =>
                                        selectedCard.name === card.name
                                )
                        ),
                        loggedInPlayerIndex
                    )
                );
                this.queue.push(announceReadyToStartRound(loggedInPlayerIndex));
                break;
            }
            case GameStage.ACTIVE_ROUND: {
                if (isBuyingCards) {
                    this.dispatch(
                        payForCards(selectedCards, loggedInPlayerIndex, payment)
                    );
                }
                this.dispatch(addCards(selectedCards, loggedInPlayerIndex));
                this.dispatch(
                    discardCards(
                        possibleCards.filter(
                            card =>
                                !selectedCards.some(
                                    selectedCard =>
                                        selectedCard.name === card.name
                                )
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

        const [canPlay, reason] = this.actionGuard.canPlayActionInSpiteOfUI(
            action,
            state
        );

        if (!canPlay) {
            throw new Error(reason);
        }

        this.playAction({action, state, withPriority: true});
        this.processQueue();
    }

    skipChooseDuplicateProduction() {
        const [canSkipChooseDuplicateProduction, reason] =
            this.actionGuard.canSkipChooseDuplicateProduction();
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
        milestone: string;
        payment: NumericPropertyCounter<Resource>;
    }) {
        const [canPlay, reason] = this.actionGuard.canClaimMilestone(milestone);

        if (!canPlay) {
            throw new Error(reason);
        }

        const playerIndex = this.getLoggedInPlayerIndex();

        this.addGameActionToLog({
            actionType: GameActionType.MILESTONE,
            playerIndex,
            milestone,
            payment,
        });

        this.queue.push(claimMilestoneAction(milestone, payment, playerIndex));
        this.queue.push(completeAction(playerIndex));
        this.processQueue();
    }

    fundAward({
        award,
        payment,
    }: {
        award: string;
        payment: NumericPropertyCounter<Resource>;
    }) {
        const [canPlay, reason] = this.actionGuard.canFundAward(award);

        if (!canPlay) {
            throw new Error(reason);
        }

        const player = this.getLoggedInPlayer();
        this.addGameActionToLog({
            actionType: GameActionType.AWARD,
            playerIndex: player.index,
            award,
            payment,
        });
        if (player.fundAward) {
            this.queue.unshift(fundAwardAction(award, payment, player.index));
        } else {
            this.queue.push(fundAwardAction(award, payment, player.index));
            this.queue.push(completeAction(player.index));
        }

        this.processQueue();
    }

    doConversion({conversion}: {conversion: Conversion}) {
        const player = this.getLoggedInPlayer();

        const [canPlay, reason] = this.actionGuard.canDoConversion(conversion);
        if (!canPlay) {
            throw new Error(reason);
        }

        this.addGameActionToLog({
            actionType: GameActionType.CONVERSION,
            playerIndex: player.index,
            conversionName: conversion.name,
        });
        this.playAction({action: conversion, state: this.state});
        const gameStage = this.state.common.gameStage;
        if (gameStage === GameStage.ACTIVE_ROUND) {
            this.queue.push(
                completeAction(
                    this.getLoggedInPlayerIndex(),
                    conversion.shouldIncrementActionCounter
                )
            );
        }
        this.processQueue();
    }

    skipAction() {
        const [canSkip, reason] = this.actionGuard.canSkipAction();

        if (!canSkip) {
            throw new Error(reason);
        }

        this.addGameActionToLog({
            actionType: GameActionType.SKIP,
            playerIndex: this.loggedInPlayerIndex,
        });

        this.queue.unshift(skipAction(this.loggedInPlayerIndex));
        const player = this.getLoggedInPlayer();
        const preludes = player.preludes ?? [];
        const playablePreludes = preludes.filter(prelude => {
            const card = getCard(prelude);
            return this.actionGuard.canSkipPrelude(card, player);
        });
        if (
            playablePreludes.length === preludes.length &&
            preludes.length > 0
        ) {
            this.queue.push(discardPreludes(this.loggedInPlayerIndex));
        }
        this.processQueue();
    }

    passGeneration() {
        const [canPassGeneration, reason] =
            this.actionGuard.canPassGeneration();

        if (!canPassGeneration) {
            throw new Error(reason);
        }

        this.addGameActionToLog({
            actionType: GameActionType.PASS,
            playerIndex: this.loggedInPlayerIndex,
        });

        this.queue.unshift(passGeneration(this.loggedInPlayerIndex));
        this.processQueue();
    }

    completePlaceTile({cell}: {cell: Cell}) {
        const [canCompletePlaceTile, reason] =
            this.actionGuard.canCompletePlaceTile(cell);

        if (!canCompletePlaceTile) {
            throw new Error(reason);
        }

        const loggedInPlayer = this.getLoggedInPlayer();
        const {pendingTilePlacement} = loggedInPlayer;
        if (!pendingTilePlacement) throw new Error('no pending tile placement');
        const matchingCell = this.actionGuard.getMatchingCell(
            cell,
            pendingTilePlacement
        );
        if (!matchingCell) throw new Error('Cannot place on specified cell');
        this.queue.unshift(
            ...this.makeTilePlacementActions(pendingTilePlacement, matchingCell)
        );
        this.processQueue();
    }

    private makeTilePlacementActions(
        pendingTilePlacement: TilePlacement,
        cell: Cell
    ) {
        const items: AnyAction[] = [];
        const type = pendingTilePlacement.type!;
        this.triggerEffectsFromTilePlacement(type, cell);
        const loggedInPlayer = this.getLoggedInPlayer();
        const {state} = this;

        const tilePlacementBonus = getTilePlacementBonus(
            cell,
            pendingTilePlacement
        );
        for (const bonus of tilePlacementBonus) {
            items.unshift(
                this.createInitialGainResourceAction(
                    bonus.resource,
                    bonus.amount,
                    loggedInPlayer.index
                )
            );
        }
        const action = cell.action;
        if (action && !pendingTilePlacement.noBonuses) {
            this.playAction(
                {
                    action,
                    state,
                },
                items
            );
        }
        const megacreditIncreaseFromOceans =
            getAdjacentCellsForCell(this.state, cell).filter(cell => {
                return cell.tile?.type === TileType.OCEAN;
            }).length * (loggedInPlayer.oceanAdjacencyBonus ?? 2);
        if (megacreditIncreaseFromOceans && !pendingTilePlacement.noBonuses) {
            items.unshift(
                this.createInitialGainResourceAction(
                    Resource.MEGACREDIT,
                    megacreditIncreaseFromOceans,
                    loggedInPlayer.index
                )
            );
        }

        const parameterForTile = this.getParameterForTile(type);
        if (parameterForTile) {
            const maxParameter = MAX_PARAMETERS[parameterForTile];
            const scheduledParameterIncreases = this.queue.filter(
                action =>
                    increaseParameter.match(action) &&
                    action.payload.parameter === parameterForTile
            );
            const totalPendingIncrease = scheduledParameterIncreases.reduce(
                (total, action) =>
                    total +
                    action.payload.amount * PARAMETER_STEPS[parameterForTile],
                0
            );
            const pendingNewAmount =
                state.common.parameters[parameterForTile] +
                totalPendingIncrease;

            if (pendingNewAmount < maxParameter) {
                this.playAction({
                    state,
                    action: {
                        increaseParameter: {
                            [parameterForTile as Parameter]: 1,
                        },
                        noParameterBonuses: pendingTilePlacement.noBonuses,
                    },
                    withPriority: true,
                });
            }
        }

        this.dispatch(placeTile({type}, cell, loggedInPlayer.index));
        return items;
    }

    completeRemoveTile({cell}: {cell: Cell}) {
        const [canCompleteRemoveTile, reason] =
            this.actionGuard.canCompleteRemoveTile(cell);
        if (!canCompleteRemoveTile) {
            throw new Error(reason);
        }
        this.dispatch(removeTile(cell, this.loggedInPlayerIndex));
        this.processQueue();
    }

    completePutAdditionalColonyTileIntoPlay({colony}: {colony: string}) {
        const [canCompletePutAdditionalColonyTileIntoPlay, reason] =
            this.actionGuard.canCompletePutAdditionalColonyTileIntoPlay(colony);
        if (!canCompletePutAdditionalColonyTileIntoPlay) {
            throw new Error(reason);
        }

        const loggedInPlayer = this.getLoggedInPlayer();

        this.queue.unshift(
            completeUserToPutAdditionalColonyTileIntoPlay(
                colony,
                loggedInPlayer.index
            )
        );
        this.processQueue();
    }

    completeChooseResourceActionDetails({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }) {
        const [canCompleteChooseResourceActionDetails, reason] =
            this.actionGuard.canCompleteChooseResourceActionDetails(
                option,
                variableAmount
            );
        if (!canCompleteChooseResourceActionDetails) {
            throw new Error(reason);
        }

        const action = getAction(
            option,
            this.getLoggedInPlayer(),
            variableAmount
        );

        this.dispatch(action);

        this.processQueue();
    }

    skipChooseResourceActionDetails() {
        const [canSkipChooseResourceActionDetails, reason] =
            this.actionGuard.canSkipChooseResourceActionDetails();
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
            increaseProduction(
                production,
                player.pendingIncreaseLowestProduction,
                player.index
            ),
            completeIncreaseLowestProduction(player.index)
        );
        this.processQueue();
    }

    gainStandardResources({
        resources,
    }: {
        resources: NumericPropertyCounter<Resource>;
    }) {
        const player = this.getLoggedInPlayer();
        if (!player.pendingGainStandardResources) {
            throw new Error('Cannot gain standard resources right now');
        }

        const quantity = convertAmountToNumber(
            player.pendingGainStandardResources,
            this.state,
            player
        );

        let totalResources = 0;
        for (const resource of STANDARD_RESOURCES) {
            totalResources += resources?.[resource] ?? 0;
        }

        if (totalResources !== quantity) {
            throw new Error(
                'Not asking for the right number of standard resources'
            );
        }

        for (const resource of STANDARD_RESOURCES) {
            const quantity = resources?.[resource];
            if (quantity) {
                this.queue.unshift(
                    gainResource(resource, quantity, player.index)
                );
            }
        }

        this.queue.unshift(completeGainStandardResources(player.index));
        this.processQueue();
    }

    trade({
        payment,
        colony,
        tradeIncome,
        numHeat,
    }: {
        payment: Resource;
        colony: string;
        tradeIncome: number;
        numHeat: number;
    }) {
        const [canTrade, reason] = this.actionGuard.canTradeWithPayment(
            payment,
            colony,
            numHeat
        );

        if (!canTrade) {
            throw new Error(reason);
        }

        const player = this.getLoggedInPlayer();

        const validPayments = getValidTradePayment(player);
        const validPayment = validPayments.find(
            validPayment => validPayment.resource === payment
        );
        if (!validPayment) throw new Error('valid payment not found');

        this.addGameActionToLog({
            actionType: GameActionType.TRADE,
            playerIndex: player.index,
            colonyName: colony,
            payment: {
                [payment]:
                    payment === Resource.MEGACREDIT
                        ? validPayment.quantity - numHeat
                        : validPayment.quantity,
                ...(numHeat > 0 ? {[Resource.HEAT]: numHeat} : {}),
            },
        });

        // First. Pay for trade
        let paymentQuantity = validPayment.quantity;

        if (numHeat && validPayment.resource === Resource.MEGACREDIT) {
            this.dispatch(
                removeResource(
                    Resource.HEAT,
                    numHeat,
                    player.index,
                    player.index
                )
            );
            paymentQuantity -= numHeat;
        }

        this.dispatch(
            removeResource(
                validPayment.resource,
                paymentQuantity,
                player.index,
                player.index
            )
        );

        this.handleTrade(colony, tradeIncome);
    }

    tradeForFree({colony, tradeIncome}: {colony: string; tradeIncome: number}) {
        const [canTradeForFree, reason] =
            this.actionGuard.canTradeForFree(colony);

        if (!canTradeForFree) {
            throw new Error(reason);
        }

        this.handleTrade(colony, tradeIncome, /* withPriority = */ true);
    }

    lobby({party, payment}: {party: string; payment: Payment}) {
        const [canLobby, reason] = this.actionGuard.canLobby(payment);
        if (!canLobby) {
            throw new Error(reason);
        }

        const player = this.getLoggedInPlayer();
        const {placeDelegatesInOneParty: numDelegates} = getLobbyingAction(
            this.state,
            player
        );
        this.queue.push(makePayment(payment, player.index));
        this.queue.push(
            placeDelegatesInOneParty(numDelegates, party, true, player.index)
        );
        this.queue.push(completeAction(player.index));
        this.processQueue();
    }

    setNotes({notes}: {notes: string}) {
        const player = this.getLoggedInPlayer();
        this.dispatch(setNotes(notes, player.index));
    }

    completePlaceDelegateInOneParty({party}: {party: string}) {
        const player = this.getLoggedInPlayer();
        if (!player.placeDelegatesInOneParty) {
            throw new Error('Cannot place delegates right now');
        }
        const {turmoil} = this.state.common;
        if (!turmoil) {
            throw new Error('Turmoil disabled');
        }

        if (!turmoil.delegations[party]) {
            throw new Error('party delegation does not exist');
        }

        this.queue.unshift(
            placeDelegatesInOneParty(
                player.placeDelegatesInOneParty,
                party,
                false,
                player.index
            )
        );
        this.processQueue();
    }

    completeExchangeNeutralNonLeaderDelegate({party}: {party: string}) {
        const player = this.getLoggedInPlayer();
        if (!player.exchangeNeutralNonLeaderDelegate) {
            throw new Error('Cannot remove non leader delegate right now');
        }
        const {turmoil} = this.state.common;
        if (!turmoil) {
            throw new Error('Turmoil disabled');
        }

        const [, ...delegation] = turmoil.delegations[party] ?? [];
        if (!delegation.some(delegate => delegate.playerIndex == undefined)) {
            throw new Error('No neutral non leader delegate to exchange');
        }

        this.queue.unshift(
            exchangeNeutralNonLeaderDelegate(party, player.index)
        );
        this.processQueue();
    }

    completeRemoveNonLeaderDelegate({
        party,
        index,
    }: {
        party: string;
        index: number;
    }) {
        const player = this.getLoggedInPlayer();
        if (!player.removeNonLeaderDelegate) {
            throw new Error('Cannot remove non leader delegate right now');
        }
        const {turmoil} = this.state.common;
        if (!turmoil) {
            throw new Error('Turmoil disabled');
        }

        const delegate = turmoil.delegations[party][index];
        if (!delegate) {
            throw new Error('invalid delegate selection');
        }

        this.queue.unshift(removeNonLeaderDelegate(party, player.index, index));
        this.processQueue();
    }

    doRulingPolicyAction({payment}: {payment: Payment}) {
        if (!this.actionGuard.canDoRulingPolicyAction(payment)) {
            throw new Error('Cannot do ruling policy');
        }

        const {turmoil} = this.state.common;
        if (!turmoil) {
            throw new Error('turmoil disabled');
        }

        const party = getPartyConfig(turmoil.rulingParty);

        if (party) {
            const {action} = party;
            if (action) {
                this.queue.push(makePayment(payment, this.loggedInPlayerIndex));
                this.playAction({
                    action,
                    thisPlayerIndex: this.loggedInPlayerIndex,
                    state: this.state,
                });
            }
        }
        this.queue.push(completeAction(this.loggedInPlayerIndex));
        this.processQueue();
    }

    private handleTrade(
        colony: string,
        tradeIncome: number,
        withPriority: boolean = false
    ) {
        const player = this.getLoggedInPlayer();

        const matchingColony = this.game.state.common.colonies?.find(
            colonyState => colonyState.name === colony
        );

        if (!matchingColony) throw new Error('colony not found');
        // Check tradeIncome is in range for player
        const eligibleTradeIncomes = getEligibleTradeIncomes(
            matchingColony,
            player
        );

        if (!eligibleTradeIncomes.includes(tradeIncome)) {
            throw new Error(
                'Trying to claim trade income that the player is not eligible for'
            );
        }

        // Just run it in both cases, doesn't matter
        const fullColony = getColony(matchingColony);

        const tradeIncomeAction = fullColony.tradeIncome[tradeIncome];
        const items: AnyAction[] = [];
        // Then receive trade income.
        this.dispatch(completeTradeForFree(player.index));
        this.dispatch(moveFleet(colony, player.index));

        this.playActionBenefits(
            {
                action: tradeIncomeAction,
                state: this.game.state,
            },
            items
        );

        this.dispatch(
            moveColonyTileTrack(colony, matchingColony.colonies.length)
        );

        for (const playerIndex of matchingColony.colonies) {
            this.playAction({
                action: fullColony.colonyBonus,
                state: this.state,
                thisPlayerIndex: playerIndex,
                groupEffects: !!fullColony.colonyBonus.removeResource,
                reverseOrder: true,
            });
        }
        if (withPriority) {
            this.queue.unshift(...items);
        } else {
            this.queue.push(...items);
            this.queue.push(completeAction(player.index));
        }

        this.processQueue();
    }

    completePlaceColony({colony}: {colony: string}) {
        const player = this.getLoggedInPlayer();
        const colonyObject = this.state.common.colonies?.find(
            colonyObject => colonyObject.name === colony
        );
        if (!colonyObject) {
            throw new Error('Colony does not exist');
        }
        const [canBuild, reason] = canPlaceColony(
            colonyObject,
            player.index,
            player.placeColony
        );
        if (!canBuild) {
            throw new Error(reason);
        }
        const fullColony = getColony(colonyObject);
        const {colonyPlacementBonus} = fullColony;
        this.playAction({
            action: colonyPlacementBonus,
            state: this.state,
            // We want this benefit to come before other things that happen (like placing a city tile)
            withPriority: true,
        });
        this.dispatch(placeColony(colony, player.index));
        this.triggerEffectsFromPlacedColony();
        this.processQueue();
    }

    completeIncreaseAndDecreaseColonyTileTracks({
        increase,
        decrease,
    }: {
        increase: string;
        decrease: string;
    }) {
        const player = this.getLoggedInPlayer();

        const [canPlay, reason] =
            this.actionGuard.canCompleteIncreaseAndDecreaseColonyTileTracks(
                increase,
                decrease
            );

        if (!canPlay) {
            throw new Error(reason);
        }

        this.queue.unshift(
            increaseAndDecreaseColonyTileTracks(
                increase,
                decrease,
                player.index
            )
        );
        this.processQueue();
    }

    completeChooseNextAction({
        actionIndex,
        payment,
    }: {
        actionIndex: number;
        payment?: Payment;
    }) {
        const player = this.getLoggedInPlayer();
        const actions = player.pendingNextActionChoice;
        if (!actions) {
            throw new Error('not choosing next action');
        }
        const {state} = this;
        if (state.common.gameStage !== GameStage.ACTIVE_ROUND) {
            throw new Error('Cannot choose next action outside active round');
        }
        if (player.index !== state.common.currentPlayerIndex) {
            throw new Error('Not your turn');
        }
        if (
            getIsPlayerMakingDecisionExceptForNextActionChoice(
                this.state,
                player
            )
        ) {
            throw new Error(
                'Cannot choose next action while making other decision'
            );
        }
        let action = actions[actionIndex];
        if (!action) {
            throw new Error('Out of bounds');
        }
        if (userCannotChooseAction(action)) {
            throw new Error('User cannot choose action');
        }
        const usedActions = actions.filter(Boolean);
        const hasUnpaidActions = hasUnpaidResources(
            usedActions,
            state,
            player,
            this.actionGuard
        );
        if (
            !canPlayActionNext(
                action,
                this.state,
                player.index,
                hasUnpaidActions,
                this.actionGuard
            )
        ) {
            throw new Error('Cannot play this action next');
        }
        this.dispatch(completeChooseNextAction(actionIndex, player.index));
        if (addActionToPlay.match(action)) {
            this.handlePlayActionFromAddActionToPlay(
                action.payload.action,
                action.payload.reverseOrder ?? false,
                action.payload.playerIndex
            );
        } else if (
            removeResource.match(action) &&
            player.corporation.name === 'Helion' &&
            action.payload.resource === Resource.MEGACREDIT &&
            action.payload.playerIndex === this.loggedInPlayerIndex &&
            payment
        ) {
            if (
                // Can I pay with the offered resources?
                !this.actionGuard.canAffordActionCost(
                    {cost: action.payload.amount},
                    player,
                    payment
                ) ||
                // Can I pay with the player's resources? Need to check so player isnt trying to take resources they dont have
                !this.actionGuard.canAffordActionCost(
                    {cost: action.payload.amount},
                    player
                )
            ) {
                throw new Error('Payment not acceptable');
            }

            for (const resource in payment) {
                this.queue.push(
                    removeResource(
                        resource as Resource,
                        payment[resource],
                        action.payload.playerIndex,
                        action.payload.playerIndex
                    )
                );
            }
        } else {
            this.queue.push(action);
        }
        this.processQueue(this.queue, false, true);
    }

    startOver(checkpoint: GameState, queueCheckpoint: AnyAction[]) {
        const playerIndex = this.getLoggedInPlayerIndex();

        const {currentPlayerIndex, controllingPlayerIndex} = this.state.common;

        if (playerIndex !== (controllingPlayerIndex ?? currentPlayerIndex)) {
            throw new Error('Cannot start over as not current player');
        }
        if (this.state.common.gameStage !== GameStage.ACTIVE_ROUND) {
            throw new Error(
                'Starting over not currently supported outside active round'
            );
        }
        const player = this.getLoggedInPlayer();
        const items = player.pendingNextActionChoice ?? [];
        if (!hasUnpaidResources(items, this.state, player, this.actionGuard)) {
            throw new Error(
                'Start over not implemented outside debt scenario yet.'
            );
        }
        this.dispatch(setGame(checkpoint));
        this.queue = queueCheckpoint;
    }

    private playActionBenefits(
        {
            action,
            state,
            parent,
            playedCard,
            thisPlayerIndex,
            withPriority,
        }: PlayActionParams,
        queue = this.queue
    ) {
        const playerIndex = thisPlayerIndex ?? this.getLoggedInPlayerIndex();
        const player = state.players[playerIndex];
        const items: Array<AnyAction> = [];
        // Must happen first (search for life "gains resource" based on discarded card)
        if (action.revealAndDiscardTopCards) {
            items.push(
                revealAndDiscardTopCards(
                    action.revealAndDiscardTopCards,
                    playerIndex
                )
            );
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
        if (action.gainStandardResources) {
            const quantity = convertAmountToNumber(
                action.gainStandardResources,
                this.state,
                player
            );
            if (quantity) {
                items.push(
                    askUserToGainStandardResources(quantity, playerIndex)
                );
            }
        }
        const numOceansPlacedSoFar = getNumOceans(state);
        let oceansInQueue = 0;
        for (const tilePlacement of action?.tilePlacements ?? []) {
            const isOcean = tilePlacement.type === TileType.OCEAN;
            if (
                isOcean &&
                numOceansPlacedSoFar + oceansInQueue >=
                    MAX_PARAMETERS[Parameter.OCEAN]
            ) {
            } else {
                const pendingTilePlacement = {
                    ...tilePlacement,
                    noBonuses:
                        action.noParameterBonuses ||
                        tilePlacement.type === TileType.LAND_CLAIM,
                };
                const cells = this.state.common.board
                    .flat()
                    .filter(
                        cell =>
                            this.actionGuard.canCompletePlaceTile(
                                cell,
                                tilePlacement
                            )[0]
                    );
                if (cells.length === 1) {
                    items.push(
                        ...this.makeTilePlacementActions(
                            pendingTilePlacement,
                            cells[0]
                        )
                    );
                } else if (cells.length > 1) {
                    items.push(
                        askUserToPlaceTile(pendingTilePlacement, playerIndex)
                    );
                }
                if (isOcean) {
                    oceansInQueue += 1;
                }
            }
        }

        if (action.removeTile) {
            if (playerIndex === state.common.firstPlayerIndex) {
                const cells = state.common.board
                    .flat()
                    .filter(cell => cell?.tile?.type === action.removeTile);
                if (cells.length === 1) {
                    items.push(removeTile(cells[0], playerIndex));
                } else if (cells.length > 1) {
                    items.push(
                        askUserToRemoveTile(action.removeTile, playerIndex)
                    );
                }
            }
        }

        if (action.useBlueCardActionAlreadyUsedThisGeneration) {
            items.push(
                askUserToUseBlueCardActionAlreadyUsedThisGeneration(playerIndex)
            );
        }

        if (action.gainAllColonyBonuses) {
            const colonyTiles = this.state.common?.colonies ?? [];
            for (const colonyTile of colonyTiles) {
                const fullColony = getColony(colonyTile);
                const params = {
                    action: fullColony.colonyBonus,
                    state: this.state,
                    thisPlayerIndex: playerIndex,
                    groupEffects: !!fullColony.colonyBonus.removeResource,
                    reverseOrder: true,
                };
                for (const colony of colonyTile.colonies) {
                    if (colony === playerIndex) {
                        this.playAction(params);
                    }
                }
            }
        }

        if (action.putAdditionalColonyTileIntoPlay) {
            items.push(askUserToPutAdditionalColonyTileIntoPlay(playerIndex));
        }

        if (action.tradeForFree) {
            items.push(askUserToTradeForFree(playerIndex));
        }

        if (action.choosePrelude) {
            items.push(
                askUserToChoosePrelude(action.choosePrelude, playerIndex)
            );
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
            const player = this.state.players[playerIndex];
            const actionType = 'stealResource';
            const wrappers = getPlayerOptionWrappers(this.state, player, {
                actionType,
                resourceAndAmounts: stealResourceResourceAndAmounts,
                card: parent!,
            });
            const options = wrappers.flatMap(wrapper => wrapper.options);
            const canSkip = canSkipResourceActionDetails(actionType);
            if (options.length === 1 && !options[0].isVariable && !canSkip) {
                items.push(getAction(options[0], player, 0));
            } else if (options.length === 0) {
                if (
                    stealResourceResourceAndAmounts.some(resourceAndAmount =>
                        isStorableResource(resourceAndAmount.resource)
                    )
                ) {
                    throw new Error('Required to steal storable resource');
                } else {
                    // Should only reach here if attempting to steal
                    // a standard resource and there's none available.
                    // All of these cards have theft as the *effect*
                    // rather than the cost.
                    // Note: this is messy.
                    items.push(noopAction());
                }
            } else {
                items.push(
                    askUserToChooseResourceActionDetails({
                        actionType,
                        resourceAndAmounts: stealResourceResourceAndAmounts,
                        card: parent!,
                        playerIndex,
                    })
                );
            }
        }

        if (action.lookAtCards) {
            items.push(
                askUserToLookAtCards(
                    playerIndex,
                    action.lookAtCards.numCards,
                    action.lookAtCards.numCardsToTake,
                    action.lookAtCards.buyCards,
                    action.text
                )
            );
        }

        if (action.gainResourceWhenIncreaseProduction) {
            items.push(gainResourceWhenIncreaseProduction(playerIndex));
        }

        if (action.increaseStoredResourceAmount) {
            items.push(
                increaseStoredResourceAmount(
                    action.increaseStoredResourceAmount,
                    playerIndex
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
        if (action.increaseLowestProduction) {
            const lowestProductions = getLowestProductions(player);
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
                    askUserToIncreaseLowestProduction(
                        action.increaseLowestProduction,
                        playerIndex
                    )
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
            const player = this.state.players[playerIndex];
            const actionType = 'increaseProduction';
            const wrappers = getPlayerOptionWrappers(this.state, player, {
                actionType,
                resourceAndAmounts,
                card: parent!,
            });
            const options = wrappers.flatMap(wrapper => wrapper.options);
            const canSkip = canSkipResourceActionDetails(actionType);
            if (options.length === 1 && !options[0].isVariable && !canSkip) {
                items.push(getAction(options[0], player, 0));
            } else if (options.length === 0) {
                throw new Error('Found zero increase production targets?');
            } else if (resourceAndAmounts.length > 0) {
                items.push(
                    askUserToChooseResourceActionDetails({
                        actionType,
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
                increaseParametersWithBonuses[parameter] =
                    action.increaseParameter[parameter] ?? 0;
            }

            for (const parameter of parameters) {
                // Start referring to the copied increaseParameter exclusively.
                let amount = increaseParametersWithBonuses[parameter];

                if (!amount) {
                    continue;
                }

                const maxParameter = MAX_PARAMETERS[parameter];
                const scheduledParameterIncreases = this.queue.filter(
                    action =>
                        increaseParameter.match(action) &&
                        action.payload.parameter === parameter
                );
                let totalPendingIncrease = scheduledParameterIncreases.reduce(
                    (total, action) =>
                        total +
                        action.payload.amount * PARAMETER_STEPS[parameter],
                    0
                );
                const pendingNewAmount =
                    state.common.parameters[parameter] + totalPendingIncrease;

                amount =
                    Math.min(
                        amount * PARAMETER_STEPS[parameter],
                        maxParameter - pendingNewAmount
                    ) / PARAMETER_STEPS[parameter];
                if (!amount) {
                    continue;
                }

                items.push(
                    increaseParameter(
                        parameter as Parameter,
                        amount,
                        playerIndex,
                        !!action.noParameterBonuses
                    )
                );
                // Check every step along the way for bonuses!
                for (let i = 1; i <= amount; i++) {
                    this.triggerEffectsFromIncreasedParameter(parameter);
                    // If the increase triggers a parameter increase, update the object.
                    // Relying on the order of the parameters variable here.
                    const newLevel =
                        i * PARAMETER_STEPS[parameter] +
                        state.common.parameters[parameter];
                    const bonus = PARAMETER_BONUSES[parameter][newLevel];
                    if (
                        !action.noParameterBonuses &&
                        bonus?.increaseParameter
                    ) {
                        for (const parameter in bonus.increaseParameter) {
                            increaseParametersWithBonuses[parameter] +=
                                bonus.increaseParameter[parameter];
                        }
                        // combine the bonus parameter increase with the rest of the parameter increases.
                        // That way an oxygen can trigger a temperature which triggers an
                        // ocean.
                    } else if (
                        !action.noParameterBonuses &&
                        bonus?.increaseTerraformRating
                    ) {
                        // combine terraform increases into one action/log message.
                        (terraformRatingIncrease as number) +=
                            bonus.increaseTerraformRating as number;
                    } else if (bonus) {
                        if (
                            action.noParameterBonuses &&
                            (bonus.gainResource || bonus.increaseProduction)
                        ) {
                            continue;
                        }
                        const playActionParams: PlayActionParams = {
                            action: {
                                ...bonus,
                                noParameterBonuses: action.noParameterBonuses,
                            },
                            state,
                            parent,
                            playedCard,
                            thisPlayerIndex,
                            withPriority,
                        };
                        this.playActionBenefits(playActionParams, items);
                    }
                }
            }
        }

        if (action.decreaseParameter) {
            for (const parameter in action.decreaseParameter) {
                items.push(
                    decreaseParameter(
                        parameter as Parameter,
                        action.decreaseParameter[parameter],
                        playerIndex
                    )
                );
            }
        }

        if (terraformRatingIncrease) {
            // We need to know how many terraforming steps happen to do the reds action.
            const numericTerraformRatingIncrease = convertAmountToNumber(
                terraformRatingIncrease,
                state,
                player,
                playedCard
            );
            items.push(
                increaseTerraformRating(
                    numericTerraformRatingIncrease,
                    playerIndex
                )
            );
            for (let i = 0; i < numericTerraformRatingIncrease; i++) {
                this.triggerEffectsFromIncreasedTerraformRating();
            }
        }

        if (action.decreaseTerraformRating) {
            const decrease = convertAmountToNumber(
                action.decreaseTerraformRating,
                state,
                player,
                playedCard
            );
            items.push(decreaseTerraformRating(decrease, playerIndex));
        }

        // TODO: Move this to `applyDiscounts`, change `plantDiscount` to a new discount type
        if (action.plantDiscount) {
            items.push(setPlantDiscount(action.plantDiscount, playerIndex));
        }

        if (action.oceanAdjacencyBonus) {
            items.push(
                setOceanAdjacencybonus(action.oceanAdjacencyBonus, playerIndex)
            );
        }

        if (action.revealTakeAndDiscard) {
            items.push(
                revealTakeAndDiscard(action.revealTakeAndDiscard, playerIndex)
            );
        }
        if (action.placeColony) {
            items.push(askUserToPlaceColony(action.placeColony, playerIndex));
        }
        if (action.gainTradeFleet) {
            items.push(gainTradeFleet(playerIndex));
        }
        if (action.increaseColonyTileTrackRange) {
            items.push(
                increaseColonyTileTrackRange(
                    action.increaseColonyTileTrackRange,
                    playerIndex
                )
            );
        }
        if (action.increaseAndDecreaseColonyTileTracks) {
            items.push(
                askUserToIncreaseAndDecreaseColonyTileTracks(
                    action.increaseAndDecreaseColonyTileTracks,
                    playerIndex
                )
            );
        }

        if (action.placeDelegatesInOneParty) {
            const delegatesInReserve =
                state.common.turmoil?.delegateReserve[playerIndex] ?? [];
            if (delegatesInReserve.length > 0) {
                items.push(
                    askUserToPlaceDelegatesInOneParty(
                        action.placeDelegatesInOneParty,
                        playerIndex
                    )
                );
            }
        }
        if (action.increasedInfluence) {
            items.push(
                increaseBaseInfluence(action.increasedInfluence, playerIndex)
            );
        }
        if (action.exchangeNeutralNonLeaderDelegate) {
            // Count neutral non leader delegates.
            // If there's only one, exchange it automatically.
            // If there's more than one, ask user to make choice.
            const {turmoil} = state.common;
            const partiesWithNeutralNonLeaderDelegates: string[] = [];
            if (turmoil) {
                const {delegations} = turmoil;
                for (const delegation in delegations) {
                    const [partyLeader, ...rest] = delegations[delegation];
                    for (const delegate of rest) {
                        if (delegate.playerIndex == undefined) {
                            partiesWithNeutralNonLeaderDelegates.push(
                                delegation
                            );
                            break;
                        }
                    }
                }
                if (partiesWithNeutralNonLeaderDelegates.length === 1) {
                    const [party] = partiesWithNeutralNonLeaderDelegates;
                    items.push(
                        exchangeNeutralNonLeaderDelegate(party, playerIndex)
                    );
                } else {
                    items.push(
                        askUserToExchangeNeutralNonLeaderDelegate(playerIndex)
                    );
                }
            }
        }
        if (action.removeNonLeaderDelegate) {
            // Count non leader delegates, unique by player index per party
            // If there's only one, exchange it automatically.
            // If there's more than one, ask user to make choice.
            const {turmoil} = state.common;
            if (turmoil) {
                const nonLeaderDelegatePlayerIndicesByParty: Map<
                    string,
                    Set<number | undefined>
                > = new Map(
                    Object.keys(turmoil.delegations).map(partyName => [
                        partyName,
                        new Set(),
                    ])
                );
                const {delegations} = turmoil;
                for (const [partyName, delegation] of Object.entries(
                    delegations
                )) {
                    const [partyLeader, ...rest] = delegation;
                    for (const delegate of rest) {
                        const playerIndexSet =
                            nonLeaderDelegatePlayerIndicesByParty.get(
                                partyName
                            );

                        if (playerIndexSet) {
                            playerIndexSet.add(delegate.playerIndex);
                        }
                    }
                }

                const allNonLeaderDelegates = Array.from(
                    nonLeaderDelegatePlayerIndicesByParty.entries()
                ).flatMap(([partyName, nonLeaderPlayerIndices]) => {
                    return Array.from(nonLeaderPlayerIndices).map(
                        playerIndex => ({
                            playerIndex,
                            partyName,
                        })
                    );
                });

                if (allNonLeaderDelegates.length === 1) {
                    const {partyName} = allNonLeaderDelegates[0];
                    // Has to be delegate 1 (leader is delegate 0)
                    items.push(
                        removeNonLeaderDelegate(partyName, playerIndex, 1)
                    );
                } else {
                    items.push(askUserToRemoveNonLeaderDelegate(playerIndex));
                }
            }
        }
        if (action.exchangeChairman) {
            items.push(exchangeChairman(playerIndex));
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
        const player = this.state.players[playerIndex];
        let numCardsToDiscard = action.removeResource?.[Resource.CARD] ?? 0;

        if (typeof numCardsToDiscard === 'number') {
            if (player.cards.length < numCardsToDiscard) {
                numCardsToDiscard = player.cards.length;
            }
        }

        if (numCardsToDiscard) {
            queue.push(
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
        {
            action,
            parent,
            playedCard,
            thisPlayerIndex,
            withPriority,
            supplementalResources,
        }: PlayActionParams,
        queue = this.queue
    ) {
        const playerIndex = thisPlayerIndex ?? this.getLoggedInPlayerIndex();
        const items: Array<AnyAction> = [];

        for (const production in action.decreaseProductionIfPossible) {
            const player = this.state.players[playerIndex];
            const maxAmountToDecrease = player.productions[production];
            const desiredAmountToDecrease =
                action.decreaseProductionIfPossible[production];
            const actualAmountToDecrease = Math.min(
                maxAmountToDecrease,
                desiredAmountToDecrease
            );
            items.push(
                this.createDecreaseProductionIfPossibleAction(
                    production as Resource,
                    actualAmountToDecrease,
                    playerIndex,
                    parent,
                    playedCard
                )
            );
        }

        for (const production in action.decreaseProduction) {
            items.push(
                this.createDecreaseProductionAction(
                    production as Resource,
                    action.decreaseProduction[production],
                    playerIndex,
                    parent,
                    playedCard
                )
            );
        }

        for (const production in action.decreaseAnyProduction) {
            const player = this.state.players[playerIndex];
            const resourceAndAmounts = [
                {
                    resource: production as Resource,
                    amount: action.decreaseAnyProduction[production],
                },
            ];
            const locationType = ResourceLocationType.ANY_PLAYER;
            const actionType = 'decreaseProduction';
            const wrappers = getPlayerOptionWrappers(this.state, player, {
                actionType,
                locationType,
                resourceAndAmounts,
                card: parent!,
            });
            const options = wrappers.flatMap(wrapper => wrapper.options);
            const canSkip = canSkipResourceActionDetails(actionType);
            if (options.length === 1 && !options[0].isVariable && !canSkip) {
                items.push(getAction(options[0], player, 0));
            } else if (options.length === 0) {
                throw new Error('No valid decrease production options');
            } else {
                items.push(
                    askUserToChooseResourceActionDetails({
                        actionType,
                        card: parent!,
                        playerIndex,
                        locationType,
                        resourceAndAmounts,
                    })
                );
            }
        }

        if (action.choice && action.choice.length > 0) {
            items.push(
                askUserToMakeActionChoice(
                    action.choice,
                    parent!,
                    playedCard,
                    playerIndex
                )
            );
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
                    supplementalResources
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

    private playAction(playActionParams: PlayActionParams, queue = this.queue) {
        if (playActionParams.groupEffects) {
            this.queue.push(
                addActionToPlay(
                    playActionParams.action,
                    playActionParams.reverseOrder ?? false,
                    playActionParams.thisPlayerIndex ?? this.loggedInPlayerIndex
                )
            );
            return;
        }
        let items: AnyAction[] = [];
        this.discardCards(playActionParams, items);
        this.playActionCosts(playActionParams, items);
        this.playActionBenefits(playActionParams, items);
        if (playActionParams.reverseOrder) {
            items = items.reverse();
        }
        if (playActionParams.withPriority) {
            queue.unshift(...items);
        } else {
            queue.push(...items);
        }
    }

    private handlePlayActionFromAddActionToPlay(
        action: Action,
        reverseOrder: boolean,
        thisPlayerIndex: number,
        items: AnyAction[] = this.queue
    ) {
        const steps = action?.steps ?? [];
        const {state} = this;
        for (const step of steps) {
            let itemsLength = items.length;
            this.playAction(
                {
                    action: step,
                    thisPlayerIndex,
                    state,
                    reverseOrder,
                },
                items
            );
            // break out of multi step action if previous step is no-op.
            if (itemsLength === items.length) {
                break;
            }
        }
        this.playAction(
            {
                action,
                thisPlayerIndex,
                state,
                reverseOrder,
            },
            items
        );
    }

    private createDecreaseProductionIfPossibleAction(
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        parent?: Card,
        playedCard?: Card
    ) {
        const resourceAndAmounts = [{resource, amount}];
        const actionType: ResourceActionType = 'decreaseProductionIfPossible';
        const player = this.state.players[playerIndex];

        const wrappers = getPlayerOptionWrappers(this.state, player, {
            actionType,
            resourceAndAmounts,
            card: parent!,
        });

        // copied from createDecreaseProductionAction. in practice, i think
        // we'll always have one option here, because the only card that uses this
        // is Corporate Alliance.
        const options = wrappers.flatMap(wrapper => wrapper.options);
        const canSkip = canSkipResourceActionDetails(actionType);
        if (options.length === 1 && !options[0].isVariable && !canSkip) {
            return getAction(options[0], player, 0);
        } else if (options.length === 0) {
            throw new Error('No valid decrease production target');
        } else {
            return askUserToChooseResourceActionDetails({
                actionType,
                resourceAndAmounts,
                card: parent!,
                playedCard,
                playerIndex,
            });
        }
    }

    private createDecreaseProductionAction(
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        parent?: Card,
        playedCard?: Card
    ) {
        const resourceAndAmounts = [{resource, amount}];
        const actionType = 'decreaseProduction';
        const player = this.state.players[playerIndex];

        if (amount === VariableAmount.USER_CHOICE_MIN_ZERO) {
            return askUserToChooseResourceActionDetails({
                actionType,
                resourceAndAmounts,
                card: parent!,
                playerIndex,
            });
        }

        const wrappers = getPlayerOptionWrappers(this.state, player, {
            actionType,
            resourceAndAmounts,
            card: parent!,
        });

        const options = wrappers.flatMap(wrapper => wrapper.options);
        const canSkip = canSkipResourceActionDetails(actionType);
        if (options.length === 1 && !options[0].isVariable && !canSkip) {
            return getAction(options[0], player, 0);
        } else if (options.length === 0) {
            throw new Error('No valid decrease production target');
        } else {
            return askUserToChooseResourceActionDetails({
                actionType,
                resourceAndAmounts,
                card: parent!,
                playedCard,
                playerIndex,
            });
        }
    }

    private createGainResourceOptionAction(
        resourceOptions: PropertyCounter<Resource>,
        playerIndex: number,
        parent?: Card,
        playedCard?: Card,
        locationType?: ResourceLocationType
    ) {
        // HACK: all instances of `gainResourceOption` use a number amount, so we don't account for variable amounts here
        const resourceAndAmounts = Object.keys(resourceOptions).map(
            (resource: Resource) => ({
                resource,
                amount: resourceOptions[resource] as number,
            })
        );
        const actionType = 'gainResource';
        const player = this.state.players[playerIndex];
        const wrappers = getPlayerOptionWrappers(this.state, player, {
            actionType,
            resourceAndAmounts,
            card: parent!,
            locationType,
        });
        const options = wrappers.flatMap(wrapper => wrapper.options);
        const canSkip = canSkipResourceActionDetails(actionType);
        if (options.length === 1 && !options[0].isVariable && !canSkip) {
            return getAction(options[0], player, 0);
        } else if (options.length === 0) {
            return noopAction();
        }
        return askUserToChooseResourceActionDetails({
            actionType,
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
        const player = this.state.players[playerIndex];
        const requiresLocationChoice =
            locationType &&
            USER_CHOICE_LOCATION_TYPES.includes(locationType) &&
            resource !== Resource.CARD;
        if (requiresLocationChoice) {
            const actionType = 'gainResource';
            const resourceAndAmounts = [{resource, amount}];
            const wrappers = getPlayerOptionWrappers(this.state, player, {
                actionType,
                resourceAndAmounts,
                card: parent!,
                locationType,
            });
            const options = wrappers.flatMap(wrapper => wrapper.options);
            const canSkip = canSkipResourceActionDetails(actionType);
            if (options.length === 1 && !options[0].isVariable && !canSkip) {
                return getAction(options[0], player, 0);
            } else if (options.length === 0) {
                // You shouldn't be able to *skip* gaining a resource,
                // But you might not be able to (ie gain microbes).
                // In the case there's no target, we just no-op.
                return noopAction();
            }
            return askUserToChooseResourceActionDetails({
                actionType,
                resourceAndAmounts,
                card: parent!,
                playedCard,
                locationType,
                playerIndex,
            });
        }

        if (isStorableResource(resource)) {
            return gainStorableResource(resource, amount, parent!, playerIndex);
        } else {
            return gainResource(resource, amount, playerIndex, parent?.name);
        }
    }

    private createInitialRemoveResourceAction(
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        parent?: Card,
        playedCard?: Card,
        locationType?: ResourceLocationType,
        supplementalResources?: SupplementalResources
    ) {
        const player = this.state.players[playerIndex];
        const requiresLocationChoice =
            locationType && USER_CHOICE_LOCATION_TYPES.includes(locationType);
        const requiresAmountChoice = amount === VariableAmount.USER_CHOICE;

        const actionType = 'removeResource';
        const resourceAndAmounts = [{resource, amount}];
        if (
            locationType ===
            ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE
        ) {
            // We can't precalculate this one. The user must place the tile first.
            return askUserToChooseResourceActionDetails({
                actionType,
                resourceAndAmounts,
                card: parent!,
                playedCard,
                locationType,
                playerIndex,
            });
        }

        if (requiresAmountChoice || requiresLocationChoice) {
            const wrappers = getPlayerOptionWrappers(this.state, player, {
                actionType,
                resourceAndAmounts,
                card: parent!,
                locationType,
            });
            const options = wrappers.flatMap(wrapper => wrapper.options);

            const canSkip = canSkipResourceActionDetails(
                actionType,
                locationType
            );
            if (options.length === 1 && !options[0].isVariable && !canSkip) {
                return getAction(options[0], player, 0);
            } else if (options.length === 0) {
                if (canSkip) {
                    return noopAction();
                } else {
                    throw new Error('No valid remove resource target.');
                }
            }
            return askUserToChooseResourceActionDetails({
                actionType,
                resourceAndAmounts,
                card: parent!,
                playedCard,
                locationType,
                playerIndex,
            });
        }

        if (isStorableResource(resource)) {
            // Assumes you're removing from "This card" (parent)
            return removeStorableResource(
                resource,
                amount as number,
                playerIndex,
                parent!
            );
        } else {
            // Assumes you're removing from your own resources
            return removeResource(
                resource,
                amount as number,
                playerIndex,
                playerIndex,
                supplementalResources
            );
        }
    }

    private createRemoveResourceOptionAction(
        resourceOptions: PropertyCounter<Resource>,
        playerIndex: number,
        parent?: Card,
        locationType?: ResourceLocationType
    ) {
        // HACK: all instances of `removeResourceOption` use a number amount, so we don't account for variable amounts here
        const resourceAndAmounts = Object.keys(resourceOptions).map(
            (resource: Resource) => ({
                resource,
                amount: resourceOptions[resource] as number,
            })
        );
        const actionType = 'removeResource';
        const player = this.state.players[playerIndex];
        const wrappers = getPlayerOptionWrappers(this.state, player, {
            actionType,
            resourceAndAmounts,
            card: parent!,
            locationType,
        });
        const options = wrappers.flatMap(wrapper => wrapper.options);
        const canSkip = canSkipResourceActionDetails(actionType, locationType);
        if (options.length === 1 && !options[0].isVariable && !canSkip) {
            return getAction(options[0], player, 0);
        } else if (options.length === 0) {
            if (canSkip) {
                return noopAction();
            } else {
                throw new Error('No valid remove resource');
            }
        }
        return askUserToChooseResourceActionDetails({
            actionType,
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
        if (!action) return false;
        return PAUSE_ACTIONS.includes(action.type);
    }

    private playActionSteps(action: Action) {
        const steps = action?.steps ?? [];
        if (steps.length > 0) {
            this.queue.push(
                addActionToPlay(
                    {steps},
                    /* reverseOrder = */ false,
                    this.loggedInPlayerIndex
                )
            );
        }
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
        for (const effect of card.effects ?? []) {
            if (effect.trigger && effect.action) {
                const actions = getActionsFromEffect(
                    event,
                    effect.trigger,
                    effect.action,
                    player,
                    loggedInPlayer.index
                );
                list.push(
                    ...actions.map(action => [action, card] as ActionCardPair)
                );
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
        if (trigger.placedTile === TileType.ANY_TILE && event.placedTile) {
            return [effectAction];
        }
        if (
            trigger.placedTile === TileType.CITY &&
            event.placedTile === TileType.CAPITAL
        ) {
            return [effectAction];
        }
        if (event.placedTile !== trigger.placedTile) return [];

        return [effectAction];
    }

    if (trigger.steelOrTitaniumPlacementBonus) {
        const bonus = event.cell?.bonus || [];
        if (
            !bonus.includes(Resource.STEEL) &&
            !bonus.includes(Resource.TITANIUM)
        )
            return [];
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

    if (trigger.placedColony) {
        if (event.placedColony) {
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

    if (trigger.increasedTerraformRating) {
        if (!event.increasedTerraformRating) return [];
        return [effectAction];
    }

    if (trigger.cost) {
        if ((event.cost || 0) < trigger.cost) return [];
        if (trigger.cardsOnly && !event.name) return [];
        return [effectAction];
    }

    const eventTags = event.tags || [];

    if (trigger.cardTags) {
        for (const tag of trigger.cardTags || []) {
            if (!eventTags.includes(tag)) return [];
        }
        return [effectAction];
    }

    if (trigger.newTag) {
        // confusing (the EffectEvent of playing the card vs the card being type Event)
        if (eventTags && !eventTags.includes(Tag.EVENT)) {
            const tagsSeenSoFar = player.playedCards
                .slice(0, -1)
                .map(card => getCard(card))
                .map(card => card.tags)
                .filter(Boolean)
                .filter(tags => !tags.includes(Tag.EVENT))
                .flat();

            const newTags = eventTags.filter(
                tag => !tagsSeenSoFar.includes(tag)
            );

            return Array(newTags.length).fill(effectAction);
        }
        return [];
    }

    const triggerTags = trigger.tags || [];
    const numTagsTriggered = eventTags.filter(tag =>
        triggerTags.includes(tag)
    ).length;
    return Array(numTagsTriggered).fill(effectAction);
}

export function isNegativeAction(action: {type: string}): boolean {
    return NEGATIVE_ACTIONS.includes(action.type);
}

export function getTotalResourcesOwed(
    items: AnyAction[],
    state: GameState,
    player: PlayerState,
    actionGuard: ActionGuard
): Payment {
    const totalResourceOwed: Payment = {};

    const removeResourceCells = state.common.board
        .flat()
        .filter(cell => cell?.action?.removeResource);

    const reachableNegativeCells = removeResourceCells.filter(cell =>
        items.some(item => {
            const tilePlacement = askUserToPlaceTile.match(item);
            return (
                tilePlacement &&
                actionGuard.canCompletePlaceTile(
                    cell,
                    item.payload.tilePlacement
                )[0]
            );
        })
    );

    const removeResourceActionsFromCells = reachableNegativeCells.map(
        cell => cell.action!
    );

    for (const action of removeResourceActionsFromCells) {
        for (const resource in action.removeResource) {
            totalResourceOwed[resource] += action.removeResource[resource];
        }
    }

    for (const action of items) {
        if (removeResource.match(action)) {
            const {resource, amount} = action.payload;
            totalResourceOwed[resource] ||= 0;
            totalResourceOwed[resource]! += amount;
            if (action.payload.supplementalResources) {
                totalResourceOwed[resource]! -= getSupplementalQuantity(
                    player,
                    action.payload.supplementalResources
                );
            }
        } else if (addActionToPlay.match(action)) {
            const actions = [
                action.payload.action,
                ...(action.payload.action?.steps ?? []),
            ];
            for (const action of actions) {
                const resources = action?.removeResource ?? {};
                for (const resource in resources) {
                    totalResourceOwed[resource] ||= 0;
                    totalResourceOwed[resource]! += convertAmountToNumber(
                        resources[resource],
                        state,
                        player
                    );
                }
            }
        }
    }
    return totalResourceOwed;
}

export function getTotalProductionDecreased(
    items: AnyAction[],
    state: GameState
) {
    const totalProductionDecreased: Payment = {};
    for (const action of items) {
        if (decreaseProduction.match(action)) {
            const {amount, resource, targetPlayerIndex} = action.payload;
            const targetPlayer = state.players[targetPlayerIndex];
            const targetPlayerAmountAvailable =
                targetPlayer.productions[resource];
            const requiredDecrease = convertAmountToNumber(
                amount,
                state,
                targetPlayer
            );
            if (
                targetPlayerAmountAvailable - requiredDecrease <
                MinimumProductions[resource]
            ) {
                totalProductionDecreased[resource] ||= 0;
                totalProductionDecreased[resource]! += requiredDecrease;
            }
        }
    }
    return totalProductionDecreased;
}

export function hasUnpaidResources(
    items: AnyAction[],
    state: GameState,
    player: PlayerState,
    actionGuard: ActionGuard
) {
    items = items.filter(Boolean);
    const totalResourceOwed = getTotalResourcesOwed(
        items,
        state,
        player,
        actionGuard
    );
    const totalProductionDecreased = getTotalProductionDecreased(items, state);

    for (const resource in totalResourceOwed) {
        const amount = totalResourceOwed[resource];
        if (resource === Resource.CARD) {
            if (player.cards.length < amount) {
                return true;
            }
        } else if (player.resources[resource] < amount) {
            // Sum of negative resource effects exceeds this player's resources.
            return true;
        }
    }
    for (const resource in totalProductionDecreased) {
        if (
            player.productions[resource] - totalProductionDecreased[resource] <
            MinimumProductions[resource]
        ) {
            // sum of negative production effects would reduce production beneath minimum.
            return true;
        }
    }

    return false;
}

export type ActionCardPair = [Action, Card];
