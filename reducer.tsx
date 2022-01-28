import {quantityAndResource} from 'components/ask-user-to-confirm-resource-action-details';
import {getAward} from 'constants/awards';
import {CardType, Deck} from 'constants/card-types';
import {
    COLONIES,
    getColony,
    getSerializedColony,
    STARTING_STEP,
    STARTING_STEP_STORABLE_RESOURCE_COLONY,
} from 'constants/colonies';
import {getGlobalEvent} from 'constants/global-events';
import {PARTY_CONFIGS} from 'constants/party';
import {CARD_SELECTION_CRITERIA_SELECTORS} from 'constants/reveal-take-and-discard';
import {delegate, Delegate, Turmoil} from 'constants/turmoil';
import {VariableAmount} from 'constants/variable-amount';
import {GameActionType} from 'GameActionState';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {shuffle} from 'initial-state';
import {Card} from 'models/card';
import {shallowEqual, TypedUseSelectorHook, useSelector} from 'react-redux';
import {AnyAction} from 'redux';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {
    getAmountForResource,
    getSupplementalQuantity,
} from 'selectors/does-player-have-required-resource-to-remove';
import {getCard} from 'selectors/get-card';
import {getConditionalPaymentWithResourceInfo} from 'selectors/get-conditional-payment-with-resource-info';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getIsPlayerMakingDecisionExceptForNextActionChoice} from 'selectors/get-is-player-making-decision';
import {isVariableAmount} from 'selectors/is-variable-amount';
import {
    SerializedCard,
    SerializedCommonState,
    SerializedPlayerState,
    SerializedState,
} from 'state-serialization';
import {
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
    claimMilestone,
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
    fundAward,
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
    noopAction,
    passGeneration,
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
    setIsMakingPlayRequest,
    setIsNotMakingPlayRequest,
    setIsNotSyncing,
    setIsSyncing,
    setOceanAdjacencybonus,
    setPlantDiscount,
    setPreludes,
    skipAction,
    skipChoice,
    stealResource,
    stealStorableResource,
    useBlueCardActionAlreadyUsedThisGeneration,
    wrapUpTurmoil,
} from './actions';
import {Action, Amount} from './constants/action';
import {getParameterName, Parameter, TileType} from './constants/board';
import {GameStage, MAX_PARAMETERS, MIN_PARAMETERS, PARAMETER_STEPS} from './constants/game';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {getResourceName, isStorableResource} from './constants/resource';
import {Resource} from './constants/resource-enum';
import {StandardProjectType} from './constants/standard-project';
import {getDiscountedCardCost} from './selectors/get-discounted-card-cost';

export type Resources = {
    [Resource.MEGACREDIT]: number;
    [Resource.STEEL]: number;
    [Resource.TITANIUM]: number;
    [Resource.PLANT]: number;
    [Resource.ENERGY]: number;
    [Resource.HEAT]: number;
};

export type GameState = SerializedState;
export type PlayerState = SerializedPlayerState;
export type CommonState = SerializedCommonState;

const cardsPlural = num => (num === 1 ? 'card' : 'cards');
const stepsPlural = num => (num === 1 ? 'step' : 'steps');

function handleEnterActiveRound(draft: WritableDraft<SerializedState>) {
    if (
        draft.common.gameStage !== GameStage.ACTIVE_ROUND &&
        draft.players.every(player => player.action === 1)
    ) {
        // Everyone's ready!
        for (const player of draft.players) {
            player.pendingCardSelection = undefined;
        }
        draft.common.gameStage = GameStage.ACTIVE_ROUND;
        draft.log.push({
            actionType: GameActionType.GAME_UPDATE,
            text: `📜 Generation ${draft.common.generation}, turn 1`,
        });
    }
}

export type GameOptions = {
    isDraftingEnabled: boolean;
    decks: Deck[];
    soloCorporationName?: string;
    boardNames: string[];
};

export type PendingChoice = {
    choice: Action[];
    card: Card;
    playedCard?: Card;
};

function handleProduction(draft: GameState) {
    draft.log.push({
        actionType: GameActionType.GAME_UPDATE,
        text: '♼ Production',
    });
    for (const player of draft.players) {
        player.resources[Resource.MEGACREDIT] += player.terraformRating;
        player.resources[Resource.HEAT] += player.resources[Resource.ENERGY];
        player.resources[Resource.ENERGY] = 0;
        for (const production in player.productions) {
            player.resources[production] += player.productions[production];
        }

        draft.log.push({
            actionType: GameActionType.PLAYER_RESOURCE_UPDATE,
            playerIndex: player.index,
            resource: player.resources,
        });
    }
    for (const colony of draft.common.colonies ?? []) {
        if (colony.step >= 0) {
            const originalColonyStep = colony.step;
            colony.step += 1;
            colony.step = Math.min(colony.step, getColony(colony).tradeIncome.length - 1);
            if (colony.step > originalColonyStep) {
                draft.log.push(`${colony.name}'s tile track increased to ${colony.step + 1}`);
            }
        }
    }
}

function isGameEndTriggered(draft: GameState) {
    for (const parameter in draft.common.parameters) {
        if (parameter === Parameter.VENUS) continue;

        if (MAX_PARAMETERS[parameter] > draft.common.parameters[parameter]) {
            return false;
        }
    }

    return true;
}

function handleChangeCurrentPlayer(state: GameState, draft: GameState) {
    const {
        players,
        common: {currentPlayerIndex: oldPlayerIndex, playerIndexOrderForGeneration: turnOrder},
    } = state;

    const oldPlaceInTurnOrder = turnOrder.indexOf(oldPlayerIndex);
    let newPlaceInTurnOrder = (oldPlaceInTurnOrder + 1) % turnOrder.length;

    // keep iterating through turnOrder until you find someone who hasn't passed
    // exit the loop if we did a full cycle
    while (
        players.find(p => p.index === turnOrder[newPlaceInTurnOrder])?.action === 0 &&
        newPlaceInTurnOrder !== oldPlaceInTurnOrder
    ) {
        newPlaceInTurnOrder = (newPlaceInTurnOrder + 1) % turnOrder.length;
    }

    draft.common.currentPlayerIndex = turnOrder[newPlaceInTurnOrder];
    if (
        newPlaceInTurnOrder < oldPlaceInTurnOrder ||
        (players.length === 1 && draft.common.gameStage !== GameStage.GREENERY_PLACEMENT)
    ) {
        draft.common.turn++;
        draft.log.push({
            actionType: GameActionType.GAME_UPDATE,
            text: `📜 Generation ${draft.common.generation}, turn ${draft.common.turn}`,
        });
    }
}

// Add Card Name here.
const bonusNames: string[] = ['Trade Envoys'];

export function getNumOceans(state: GameState): number {
    return state.common.board.flat().filter(cell => cell.tile?.type === TileType.OCEAN).length;
}

function getPlayer(thisDraft: GameState, payload: {playerIndex: number}): PlayerState {
    return thisDraft.players[payload.playerIndex]!;
}

export function getMostRecentlyPlayedCard(player: PlayerState) {
    return player.playedCards[player.playedCards.length - 1];
}

function setSyncingTrueIfClient(draft: GameState) {
    if (typeof window !== 'undefined') {
        draft.syncing = true;
    }
}

function handleParameterIncrease(
    draft: GameState,
    player: PlayerState,
    parameter: Parameter,
    amount: number,
    corporationName: string,
    noTerraformIncrease: boolean
) {
    const scale = PARAMETER_STEPS[parameter];
    const increase = amount * scale;
    const startingAmount = draft.common.parameters[parameter];
    const newAmount = Math.min(MAX_PARAMETERS[parameter], startingAmount + increase);
    const change = newAmount - startingAmount;
    const steps = change / scale;
    draft.common.parameters[parameter] = newAmount;
    if (!noTerraformIncrease) {
        player.terraformRating += steps;
        if (steps) {
            player.terraformedThisGeneration = true;
        }
    }
    if (change && parameter !== Parameter.OCEAN) {
        draft.log.push(
            `${corporationName} increased ${getParameterName(parameter)} ${steps} ${stepsPlural(
                steps
            )}`
        );
    }
}

function handleTerraformRatingIncrease(
    player: PlayerState,
    amount: number,
    draft: WritableDraft<GameState>
) {
    const newRating = player.terraformRating + amount;
    draft.log.push(
        `${player.corporation.name} increased their terraform rating by ${amount} to ${newRating}`
    );
    player.terraformRating = newRating;
}

function handleParameterDecrease(
    draft: GameState,
    parameter: Parameter,
    amount: number,
    corporationName: string
) {
    const scale = PARAMETER_STEPS[parameter];
    const decrease = amount * scale;
    const startingAmount = draft.common.parameters[parameter];
    if (startingAmount === MAX_PARAMETERS[parameter]) {
        draft.log.push(
            `${corporationName} did not decrease ${getParameterName(
                parameter
            )} because it has reached its maximum value`
        );
    }
    const newAmount = Math.max(MIN_PARAMETERS[parameter], startingAmount - decrease);
    const change = startingAmount - newAmount;
    const steps = change / scale;
    draft.common.parameters[parameter] = newAmount;
    if (change && parameter !== Parameter.OCEAN) {
        draft.log.push(
            `${corporationName} decreased ${getParameterName(parameter)} ${steps} ${stepsPlural(
                steps
            )}`
        );
    }
}

let mostRecentlyPlayedCard: SerializedCard;

function handleDrawCards(draft: GameState, numCards: number) {
    const cards = draft.common.deck.splice(0, numCards);
    const numCardsShort = numCards - cards.length;
    if (numCardsShort) {
        // Make new deck out of discard pile.
        draft.common.deck = shuffle(draft.common.discardPile);
        draft.common.discardPile = [];

        // Draw more cards from new deck.
        cards.push(...draft.common.deck.splice(0, numCardsShort));
    }

    setSyncingTrueIfClient(draft);

    return cards.map(card => ({name: card.name}));
}

const handleGainResource = (
    player: PlayerState,
    draft: GameState,
    resource: Resource | undefined,
    amount: Amount,
    corporationName: string,
    parentName?: string
) => {
    if (isStorableResource(resource)) {
        return;
    }

    if (resource === Resource.BASED_ON_PRODUCTION_DECREASE) {
        resource = player.mostRecentProductionDecrease;
    }

    if (!resource) {
        throw new Error('resource not specified');
    }

    mostRecentlyPlayedCard = getMostRecentlyPlayedCard(player);

    const parentCard = parentName && player.playedCards.find(card => card.name === parentName);

    const cardToConsider = parentCard || mostRecentlyPlayedCard;

    const quantity = convertAmountToNumber(amount, draft, player, cardToConsider);

    if (resource === Resource.CARD && quantity) {
        // Sometimes we list cards as a resource.
        // handle as a draw action.
        player.cards.push(...handleDrawCards(draft, quantity));
        draft.log.push(`${corporationName} drew ${quantity} ${cardsPlural(quantity)}`);
        return;
    }
    player.resources[resource] += quantity;
    if (quantity) {
        draft.log.push(`${corporationName} gained ${quantityAndResource(quantity, resource)}`);
    }
};

export const reducer = (state: GameState | null = null, action: AnyAction) => {
    if (noopAction.match(action)) {
        return state;
    }
    if (setGame.match(action)) {
        // A client-side action.
        // Sets the game state returned from the server.
        const newState = action.payload.gameState;
        if (newState == null) {
            return null;
        }
        if (newState.name !== state?.name) {
            return newState;
        }
        // Exceptionally (hacky):
        // Corporation selection happens client-side, then is finalized on server.
        // To avoid de-syncs, prefer client-side corporation selection to server value.
        if (newState.common.gameStage === GameStage.CORPORATION_SELECTION && state) {
            for (let i = 0; i < state.players.length; i++) {
                newState.players[i].corporation = state.players[i].corporation;
            }
        }
        return newState;
    }
    if (!state) return null;

    return produce(state, draft => {
        draft.timestamp = Date.now();

        if (setIsSyncing.match(action)) {
            draft.syncing = true;
            return;
        }

        if (setIsNotSyncing.match(action)) {
            draft.syncing = false;
            return;
        }

        if (setIsMakingPlayRequest.match(action)) {
            draft.isMakingPlayRequest = true;
            return;
        }

        if (setIsNotMakingPlayRequest.match(action)) {
            draft.isMakingPlayRequest = false;
            return;
        }

        let player: PlayerState;

        const corporationName =
            draft.players[action.payload?.playerIndex ?? -1]?.corporation?.name ?? '';

        const {common} = draft;

        if (setCorporation.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.corporation = payload.corporation;
            const fullCard = getCard(payload.corporation);
            if (fullCard.cardCost) {
                player.cardCost = fullCard.cardCost;
            } else {
                player.cardCost = 3;
            }
            return;
        }

        draft.actionCount = (draft.actionCount ?? 0) + 1;

        if (addGameActionToLog.match(action)) {
            draft.log.push(action.payload.gameAction);
        }

        if (payForCards.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {cards, payment} = payload;
            const numCards = cards.length;
            if (payment) {
                for (const [resource, amount] of Object.entries(payment)) {
                    player.resources[resource] -= amount as number;
                }
            } else {
                player.resources[Resource.MEGACREDIT] -= numCards * (player.cardCost ?? 3);
            }
            if (player.resources[Resource.MEGACREDIT] < 0) {
                throw new Error('Money went negative!');
            }
            player.pendingCardSelection = undefined;
            draft.log.push(`${corporationName} bought ${numCards} ${cardsPlural(numCards)}`);
        }

        if (draftCard.match(action)) {
            const {payload} = action;
            const draftedCard = payload.card;
            player = getPlayer(draft, payload);

            const {pendingCardSelection} = player;
            if (!pendingCardSelection || !Array.isArray(pendingCardSelection?.draftPicks)) {
                throw new Error('Drafting state is borked');
            }
            if (
                pendingCardSelection.draftPicks.length + pendingCardSelection.possibleCards.length >
                4
            ) {
                // user has already drafted a card, return early. this shouldn't be possible but
                // previously could happen if user spam-clicked the draft button ?
                return;
            }
            if (!pendingCardSelection.possibleCards.map(c => c.name).includes(draftedCard.name)) {
                throw new Error('Card not in possible list of cards to draft');
            }
            pendingCardSelection.draftPicks.push(draftedCard);

            // check to see if this was the last person of the group to pick a card
            //   - if so, cycle everyone's leftover cards left or right
            //   - otherwise, hold off on cycling (we don't want to overwrite possibleCards for someone still picking)
            const numDraftedSoFar = pendingCardSelection.draftPicks.length;
            const hasEveryonePickedCard = draft.players.every(
                player => player.pendingCardSelection?.draftPicks?.length === numDraftedSoFar
            );
            if (hasEveryonePickedCard) {
                // Cycle cards
                // 1. r
                draft.players.forEach(player => {
                    const selection = player.pendingCardSelection;
                    if (!selection) {
                        throw new Error('Drafting state is borked for another player');
                    }
                    selection.possibleCards = selection.possibleCards.filter(card => {
                        return !(selection.draftPicks ?? []).map(d => d?.name).includes(card?.name);
                    });
                });
                const remainingPossibleCards = draft.players.map(
                    p => p.pendingCardSelection?.possibleCards ?? []
                );
                // e.g. [A,B,C]
                if (common.generation % 2) {
                    // (A passes to B, B passes to C, C passes to A)
                    remainingPossibleCards.unshift(remainingPossibleCards.pop()!);
                } else {
                    // (A passes to C, B passes to A, C passes to B)
                    remainingPossibleCards.push(remainingPossibleCards.shift()!);
                }
                for (let i = 0; i < draft.players.length; i++) {
                    draft.players[i].pendingCardSelection = {
                        ...draft.players[i].pendingCardSelection,
                        possibleCards: remainingPossibleCards[i],
                    };
                }
                // if we're done drafting, move to buy/discard
                // we can automate the final round of drafting because its just picking from 1 card
                if (numDraftedSoFar >= 3) {
                    draft.players.forEach(
                        player =>
                            (player.pendingCardSelection = {
                                ...player.pendingCardSelection,
                                possibleCards: [
                                    ...(player.pendingCardSelection?.possibleCards ?? []),
                                    ...(player.pendingCardSelection?.draftPicks ?? []),
                                ],
                                draftPicks: undefined,
                                isBuyingCards: true,
                            })
                    );
                    draft.common.gameStage = GameStage.BUY_OR_DISCARD;
                    setSyncingTrueIfClient(draft);
                }
            }
        }

        if (revealAndDiscardTopCards.match(action)) {
            const {payload} = action;

            // Step 1. Reveal the cards to the players so they can see them.
            const numCardsToReveal = payload.amount;
            draft.common.revealedCards = handleDrawCards(draft, numCardsToReveal);
            if (
                draft.common.revealedCards.every(card => !!card && !!card.name) &&
                draft.common.revealedCards.length > 0
            ) {
                draft.log.push(
                    `Revealed ${draft.common.revealedCards.map(c => c.name).join(', ')}`
                );
            }
        }

        if (revealTakeAndDiscard.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            for (const criterion in payload.revealTakeAndDiscard) {
                const amount = convertAmountToNumber(
                    payload.revealTakeAndDiscard[criterion],
                    state,
                    player
                );
                const matchingCards: SerializedCard[] = [];
                const notMatchingCards: SerializedCard[] = [];
                const revealedCards: SerializedCard[] = [];

                const selector = CARD_SELECTION_CRITERIA_SELECTORS[criterion];

                let card: SerializedCard | undefined;

                while (draft.common.deck.length > 0 && matchingCards.length < amount) {
                    card = draft.common.deck.shift();
                    if (card) {
                        revealedCards.push(card);
                        if (selector(card)) {
                            matchingCards.push(card);
                        } else {
                            notMatchingCards.push(card);
                        }
                    }
                }

                draft.log.push(`Revealed ${revealedCards.map(c => c.name).join(', ')}`);
                draft.log.push(
                    `${corporationName} took ${matchingCards
                        .map(c => c.name)
                        .join(', ')} into hand and discarded the rest.`
                );
                player.cards.push(...matchingCards);
                draft.common.discardPile.push(...notMatchingCards);
            }
        }

        if (askUserToDiscardCards.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingDiscard = {
                amount: payload.amount,
                card: payload.card,
                playedCard: payload.playedCard,
                isFromSellPatents: !!payload.isFromSellPatents,
            };
        }

        if (askUserToLookAtCards.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.pendingCardSelection = {
                possibleCards: handleDrawCards(draft, payload.amount),
                numCardsToTake: payload.numCardsToTake ?? null,
                isBuyingCards: payload.buyCards ?? false,
            };
            setSyncingTrueIfClient(draft);
        }

        if (addCards.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.cards.push(...payload.cards);
            player.pendingCardSelection = undefined;
        }

        if (setPreludes.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.preludes = payload.preludes.map(card => ({name: card.name}));
            player.possiblePreludes = [];
        }

        if (askUserToChoosePrelude.match(action)) {
            // In this situation, the player gets to play 1 prelude out of payload.amount preludes.
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.preludes = draft.common.preludes.splice(0, payload.amount);
            player.choosePrelude = true;
        }

        if (discardPreludes.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            // Preludes you can't play don't go into discard pile, they just disappear.
            player.preludes = [];
        }

        if (askUserToFundAward.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.fundAward = true;
        }

        if (discardCards.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            let pendingDiscardAmount = player.pendingDiscard?.amount;
            if (pendingDiscardAmount && isVariableAmount(pendingDiscardAmount)) {
                draft.pendingVariableAmount = payload.cards.length;
            }
            if (payload.cards.length) {
                if (draft.common.gameStage !== GameStage.BUY_OR_DISCARD) {
                    // discard is implied during buy_or_discard, so we omit this log item
                    draft.log.push(
                        `${corporationName} discarded ${payload.cards.length} ${cardsPlural(
                            payload.cards.length
                        )}`
                    );
                }
            }
            player.pendingDiscard = undefined;
            draft.common.discardPile.push(...payload.cards);
            player.cards = player.cards.filter(
                playerCard => !payload.cards.map(card => card.name).includes(playerCard.name)
            );
        }

        if (addForcedActionToPlayer.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {forcedAction} = payload;
            player.forcedActions.push(forcedAction);
        }

        if (removeForcedActionFromPlayer.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.forcedActions = player.forcedActions.slice(1);
        }

        if (decreaseProduction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            mostRecentlyPlayedCard = getMostRecentlyPlayedCard(player);
            const decrease = convertAmountToNumber(
                payload.amount,
                state,
                player,
                mostRecentlyPlayedCard
            );
            draft.pendingVariableAmount = decrease;
            player.pendingResourceActionDetails = undefined;
            player.pendingDuplicateProduction = undefined;
            let targetPlayer = draft.players[payload.targetPlayerIndex];

            targetPlayer.productions[payload.resource] -= decrease;
            targetPlayer.mostRecentProductionDecrease = payload.resource;
            if (targetPlayer === player) {
                draft.log.push(
                    `${corporationName} decreased their ${getResourceName(
                        payload.resource
                    )} production ${decrease} ${stepsPlural(decrease)}`
                );
            } else {
                draft.log.push(
                    `${corporationName} decreased the ${getResourceName(
                        payload.resource
                    )} production of ${targetPlayer.corporation.name} ${decrease} ${stepsPlural(
                        decrease
                    )}`
                );
            }
        }

        if (skipChoice.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingResourceActionDetails = undefined;
            player.pendingDuplicateProduction = undefined;
        }

        if (increaseProduction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            mostRecentlyPlayedCard = getMostRecentlyPlayedCard(player);

            player.pendingResourceActionDetails = undefined;
            player.pendingDuplicateProduction = undefined;
            const increase = convertAmountToNumber(
                payload.amount,
                state,
                player,
                mostRecentlyPlayedCard
            );
            player.productions[payload.resource] += increase;
            if (player.mostRecentProductionDecrease) {
                player.mostRecentProductionDecrease = undefined;
            }
            const card = mostRecentlyPlayedCard;
            if (increase && (card.name === 'Mining Rights' || card.name === 'Mining Area')) {
                // Record the production increase for the purpose of robotic workforce.
                card.increaseProductionResult = payload.resource;
            }
            if (increase) {
                draft.log.push(
                    `${corporationName} increased their ${getResourceName(
                        payload.resource
                    )} production ${increase} ${stepsPlural(increase)}`
                );
                if (player.gainResourceWhenIncreaseProduction) {
                    handleGainResource(
                        player,
                        draft,
                        payload.resource,
                        increase * player.gainResourceWhenIncreaseProduction,
                        corporationName
                    );
                }
            }
        }

        if (askUserToIncreaseLowestProduction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingIncreaseLowestProduction = payload.amount;
        }

        if (askUserToGainStandardResources.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            if (payload.quantity) {
                player.pendingGainStandardResources = payload.quantity;
            }
        }

        if (gainResourceWhenIncreaseProduction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.gainResourceWhenIncreaseProduction =
                player.gainResourceWhenIncreaseProduction || 0;
            player.gainResourceWhenIncreaseProduction += 1;
        }

        if (removeResource.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingResourceActionDetails = undefined;
            const {resource, amount, sourcePlayerIndex} = payload;
            const quantity = convertAmountToNumber(amount, draft, player);

            const sourcePlayer = draft.players[sourcePlayerIndex];
            const totalAvailable = getAmountForResource(
                resource,
                sourcePlayer,
                payload.supplementalResources
            );
            if (quantity > totalAvailable && sourcePlayerIndex !== player.index) {
                throw new Error('Trying to take too many resources');
            }
            draft.pendingVariableAmount = quantity;
            let supplementalQuantity = 0;
            if (
                resource === Resource.HEAT &&
                payload.supplementalResources &&
                player.index === sourcePlayerIndex
            ) {
                const {name} = payload.supplementalResources;
                const matchingCard = player.playedCards.find(card => card.name === name);
                if (matchingCard) {
                    supplementalQuantity = getSupplementalQuantity(
                        player,
                        payload.supplementalResources
                    );
                    const fullCard = getCard(matchingCard);
                    if (fullCard.useStoredResourceAsHeat) {
                        const amountToRemove =
                            supplementalQuantity / fullCard.useStoredResourceAsHeat;
                        matchingCard.storedResourceAmount! -= amountToRemove;
                        if (amountToRemove) {
                            draft.log.push(
                                `${sourcePlayer.corporation.name} lost ${quantityAndResource(
                                    amountToRemove,
                                    fullCard.storedResourceType!
                                )} from ${fullCard.name}`
                            );
                        }
                    }
                }
            }
            const adjustedAmount = quantity - supplementalQuantity;
            if (adjustedAmount > 0) {
                sourcePlayer.resources[resource] -= adjustedAmount;
                draft.log.push(
                    `${sourcePlayer.corporation.name} lost ${quantityAndResource(
                        adjustedAmount,
                        resource
                    )}`
                );
            }
        }

        if (removeStorableResource.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.pendingResourceActionDetails = undefined;

            const {resource, amount} = payload;

            const targetCard = draft.players
                .flatMap(player => player.playedCards)
                .find(playedCard => playedCard.name === payload.card.name);

            if (!targetCard) {
                throw new Error(`Target card ${payload.card.name} not found in played cards`);
            }
            const card = getCard(targetCard);
            if (card.storedResourceType !== resource) {
                throw new Error('Card does not store that type of resource');
            }
            if (
                targetCard.storedResourceAmount === undefined ||
                targetCard.storedResourceAmount < amount
            ) {
                throw new Error('Card does not contain enough of that resource to remove');
            }
            draft.pendingVariableAmount = amount;
            targetCard.storedResourceAmount -= amount;
            // If you do it to yourself, say "removed" instead of "lost"
            const verb = corporationName === player.corporation.name ? 'removed' : 'lost';
            draft.log.push(
                `${corporationName} ${verb} ${quantityAndResource(payload.amount, resource)} from ${
                    targetCard.name
                }`
            );
        }

        if (stealResource.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.pendingResourceActionDetails = undefined;

            const {resource, amount, victimPlayerIndex} = payload;
            const victimPlayer = draft.players[victimPlayerIndex];

            if (amount > victimPlayer.resources[resource]) {
                throw new Error('Trying to take too many resources');
            }
            const quantity = convertAmountToNumber(amount, state, player);
            victimPlayer.resources[resource] -= quantity;
            player.resources[resource] += quantity;
            draft.log.push(
                `${corporationName} stole ${quantityAndResource(quantity, resource)} from ${
                    victimPlayer.corporation.name
                }`
            );
        }

        if (stealStorableResource.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingResourceActionDetails = undefined;

            const {resource, amount, sourceCard, targetCard} = payload;

            const draftSourceCard = draft.players
                .flatMap(p => p.playedCards)
                .find(c => c.name === sourceCard.name);
            const draftTargetCard = draft.players
                .flatMap(p => p.playedCards)
                .find(c => c.name === targetCard.name);
            if (!draftSourceCard || !draftTargetCard) {
                throw new Error('Could not find target or source card for stealing');
            } else if (!draftSourceCard.storedResourceAmount) {
                throw new Error('Target card does not contain any resources');
            } else if (amount > draftSourceCard.storedResourceAmount) {
                throw new Error('Trying to take too many resources');
            } else if (
                resource !== getCard(draftSourceCard).storedResourceType ||
                getCard(draftSourceCard).storedResourceType !==
                    getCard(draftTargetCard).storedResourceType
            ) {
                throw new Error("Resource type doesn't match");
            }
            const quantity = convertAmountToNumber(amount, state, player);

            draftSourceCard.storedResourceAmount -= quantity;
            draftTargetCard.storedResourceAmount =
                (draftTargetCard.storedResourceAmount || 0) + quantity;
            draft.log.push(
                `${corporationName} moved ${quantityAndResource(quantity, resource)} from ${
                    draftSourceCard.name
                } onto ${draftTargetCard.name}`
            );
        }

        if (gainResource.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingResourceActionDetails = undefined;
            handleGainResource(
                player,
                draft,
                payload.resource,
                payload.amount,
                corporationName,
                payload.parentName
            );
            player.mostRecentProductionDecrease = undefined;
        }

        if (gainStorableResource.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingResourceActionDetails = undefined;
            const draftCard = player.playedCards.find(c => c.name === payload.card.name);
            if (!draftCard) {
                throw new Error('Card should exist to gain storable resources to');
            }
            const card = getCard(draftCard);
            if (!card.storedResourceType) {
                throw new Error('Cannot store resources on this card');
            }
            const quantity = convertAmountToNumber(payload.amount, draft, player);
            if (quantity) {
                draftCard.storedResourceAmount = (draftCard.storedResourceAmount || 0) + quantity;
                draft.log.push(
                    `${corporationName} added ${quantityAndResource(
                        quantity,
                        card.storedResourceType
                    )} to ${draftCard.name}`
                );
            }
        }

        if (increaseStoredResourceAmount.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            for (const card of player.playedCards) {
                if (card.storedResourceAmount) {
                    card.storedResourceAmount += convertAmountToNumber(
                        payload.amount,
                        draft,
                        player
                    );
                }
            }
        }

        if (payToPlayCard.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            const cardCost = getDiscountedCardCost(payload.card, player);
            let details: string[] = [];

            // Dirigibles
            if (payload.conditionalPayments) {
                const conditionalPayments = getConditionalPaymentWithResourceInfo(
                    player,
                    getCard(payload.card)
                );
                if (payload.conditionalPayments.length !== conditionalPayments.length) {
                    throw new Error('Misformatted conditional payments array');
                }
                for (let i = 0; i < conditionalPayments.length; i++) {
                    const cardWithResources = player.playedCards.find(
                        card => card.name === conditionalPayments[i].name
                    );
                    if (!cardWithResources) {
                        throw new Error(
                            'Could not find card' +
                                conditionalPayments[i].name +
                                'for conditional payment'
                        );
                    } else {
                        cardWithResources.storedResourceAmount =
                            (cardWithResources.storedResourceAmount ?? 0) -
                            payload.conditionalPayments[i];
                        if (
                            cardWithResources.storedResourceAmount < 0 ||
                            isNaN(cardWithResources.storedResourceAmount)
                        ) {
                            throw new Error(
                                'Got to negative resource amount for ' + cardWithResources.name
                            );
                        }
                    }
                    details.push(
                        quantityAndResource(
                            payload.conditionalPayments[i],
                            conditionalPayments[i].resourceType
                        )
                    );
                }
            }
            if (payload.payment) {
                for (const resource in payload.payment) {
                    player.resources[resource] -= payload.payment[resource];
                    if (player.resources[resource] < 0) {
                        throw new Error('Got negative resources while trying to pay for card');
                    }
                }
            } else {
                player.resources[Resource.MEGACREDIT] -= cardCost;
                if (player.resources[Resource.MEGACREDIT] < 0) {
                    throw new Error('Got negative megacredits while trying to pay for card');
                }
            }

            player.discounts.nextCardThisGeneration = 0;

            // let logMessage = `${corporationName} paid ${cardCost} to play ${payload.card.name}`;
            // for (const resource in payload.payment) {
            //     if (payload.payment[resource]) {
            //         details.push(
            //             quantityAndResource(payload.payment[resource], resource as Resource)
            //         );
            //     }
            // }
            // if (details.length > 0) {
            //     logMessage += ` (with ${details.join(', ')})`;
            // }
            // draft.log.push(logMessage);
        }

        if (payToPlayCardAction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            // discounts don't apply to card actions (standard projects are handled
            // in a separate reducer action PAY_TO_PLAY_STANDARD_PROJECT)
            const actionCost = payload.action.cost;
            if (payload.payment) {
                for (const resource in payload.payment) {
                    player.resources[resource] -= payload.payment[resource];
                    if (player.resources[resource] < 0) {
                        throw new Error(
                            'Went negative for resource ' +
                                resource +
                                ' when attempting to pay for action'
                        );
                    }
                }
            } else {
                player.resources[Resource.MEGACREDIT] -= actionCost ?? 0;
                if (player.resources[Resource.MEGACREDIT] < 0) {
                    throw new Error('Went negative megacredit attempting to pay for action');
                }
            }
            player.discounts.nextCardThisGeneration = 0;
            let logMessage = `${corporationName} paid ${actionCost} to play ${payload.parentCard.name}'s action`;
            if (!actionCost) {
                logMessage = `${corporationName} played ${payload.parentCard.name}'s action`;
            }
            let details: string[] = [];
            for (const resource in payload.payment) {
                if (payload.payment[resource]) {
                    details.push(
                        quantityAndResource(payload.payment[resource], resource as Resource)
                    );
                }
            }

            if (details.length > 0) {
                logMessage += ` (with ${details.join(', ')})`;
            }
            draft.log.push(logMessage);
        }

        if (payToPlayStandardProject.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            const {payment} = payload;
            let cost =
                (payload.standardProjectAction.cost || 0) - player.discounts.standardProjects;
            if (payload.standardProjectAction.type === StandardProjectType.POWER_PLANT) {
                cost -= player.discounts.standardProjectPowerPlant;
            }

            for (const resource in payment) {
                player.resources[resource] -= payment[resource];
            }
        }

        if (makePayment.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {payment} = payload;
            for (const resource in payment) {
                player.resources[resource] -= payment[resource];
                if (player.resources[resource] < 0) {
                    throw new Error('Resource cannot go below zero');
                }
            }
        }

        if (claimMilestone.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {payment, milestone} = payload;
            const resources = payment ?? {[Resource.MEGACREDIT]: 8};
            for (const resource in resources) {
                player.resources[resource] -= resources[resource];
            }
            draft.common.claimedMilestones.push({
                claimedByPlayerIndex: player.index,
                milestone: milestone,
            });
            draft.log.push(`${corporationName} claimed ${payload.milestone} milestone`);
        }

        if (fundAward.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            const {payment, award} = payload;
            for (const resource in payment || {}) {
                player.resources[resource] -= payment[resource];
            }
            draft.common.fundedAwards.push({
                fundedByPlayerIndex: player.index,
                award: award,
            });
            const awardConfig = getAward(award);
            draft.log.push(`${corporationName} funded ${awardConfig.name}`);
            player.fundAward = undefined;
        }

        if (moveCardFromHandToPlayArea.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.cards = player.cards.filter(c => c.name !== payload.card.name);
            player.playedCards.push({name: payload.card.name});
            const card = getCard(payload.card);
            if (card.type === CardType.CORPORATION) {
                player.possibleCorporations = [];
            }
            if (card.type === CardType.PRELUDE) {
                player.preludes = player.preludes.filter(c => c.name !== payload.card.name);
            }
            if (player.pendingPlayCardFromHand) {
                player.pendingPlayCardFromHand = undefined;
            }
            if (card.storedResourceType) {
                for (const colony of draft.common.colonies ?? []) {
                    if (
                        getColony(colony).offlineUntilResource === card.storedResourceType &&
                        colony.step === STARTING_STEP_STORABLE_RESOURCE_COLONY
                    ) {
                        colony.step = STARTING_STEP;
                        draft.log.push(
                            `${colony.name}'s tile track went online at ${colony.step + 1}`
                        );
                    }
                }
            }
            player.temporaryParameterRequirementAdjustments = zeroParameterRequirementAdjustments();
        }

        if (addParameterRequirementAdjustments.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            for (const parameter in payload.parameterRequirementAdjustments) {
                player.parameterRequirementAdjustments[parameter] +=
                    payload.parameterRequirementAdjustments[parameter];
            }
            for (const parameter in payload.temporaryParameterRequirementAdjustments) {
                player.temporaryParameterRequirementAdjustments[parameter] =
                    payload.temporaryParameterRequirementAdjustments[parameter];
            }
        }

        if (askUserToPlaceTile.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            const {type} = payload.tilePlacement;
            // Check that 9 oceans haven't already been placed.
            if (
                type === TileType.OCEAN &&
                getNumOceans(state) === MAX_PARAMETERS[Parameter.OCEAN]
            ) {
            } else {
                player.pendingTilePlacement = payload.tilePlacement;
            }
        }

        if (askUserToRemoveTile.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingTileRemoval = payload.tileType;
        }

        if (askUserToChooseResourceActionDetails.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {actionType, resourceAndAmounts, locationType} = payload;
            const card = player.playedCards.find(
                playerCard => playerCard.name === payload.card?.name
            )!;
            const playedCard = player.playedCards.find(
                playerPlayedCard => playerPlayedCard.name === payload.playedCard?.name
            );
            player.pendingResourceActionDetails = {
                actionType,
                resourceAndAmounts,
                card,
                playedCard,
                locationType,
            };
        }

        if (askUserToDuplicateProduction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {tag, card} = payload;
            player.pendingDuplicateProduction = {
                tag,
                card,
            };
        }

        if (askUserToMakeActionChoice.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {choice} = payload;
            const card = player.playedCards.find(
                playedCard => playedCard.name === payload.card.name
            )!;
            const playedCard = player.playedCards.find(
                playedCard => playedCard.name === payload?.playedCard?.name
            );
            player.pendingChoice = {choice, card, playedCard};
        }

        if (askUserToUseBlueCardActionAlreadyUsedThisGeneration.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingActionReplay = true;
        }

        if (askUserToPlayCardFromHand.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingPlayCardFromHand = payload.playCardParams;
            if (payload.playCardParams.discount) {
                player.discounts.nextCardThisGeneration = payload.playCardParams.discount;
            }
        }

        if (useBlueCardActionAlreadyUsedThisGeneration.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingActionReplay = undefined;
        }

        if (makeActionChoice.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingChoice = undefined;
        }

        if (placeTile.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingTilePlacement = undefined;
            if (payload.tile?.type !== TileType.OCEAN) {
                payload.tile.ownerPlayerIndex = player.index;
            }
            const matchingCell = draft.common.board.flat().find(cell => {
                if (cell.specialName) {
                    return cell.specialName === payload.cell.specialName;
                }
                const coords = cell.coords || [];
                if (!payload.cell.coords) {
                    return false;
                }
                return coords[0] === payload.cell.coords[0] && coords[1] === payload.cell.coords[1];
            });
            matchingCell!.tile = payload.tile;
            if (payload.tile.type === TileType.LAND_CLAIM) {
                draft.log.push(`${corporationName} reserved an area.`);
                return;
            }

            const numOceans = getNumOceans(draft);

            const oceanAddendum =
                payload.tile.type === TileType.OCEAN
                    ? ` (${numOceans} of ${MAX_PARAMETERS.ocean})`
                    : '';
            draft.log.push(
                `${corporationName} placed ${aAnOrThe(
                    payload.tile.type
                )} ${getHumanReadableTileName(payload.tile.type)} tile${oceanAddendum}`
            );
            draft.common.mostRecentTilePlacementCell = matchingCell;
        }
        if (removeTile.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingTileRemoval = undefined;
            const matchingCell = draft.common.board.flat().find(cell => {
                if (cell.specialName) {
                    return cell.specialName === payload.cell.specialName;
                }
                const coords = cell.coords || [];
                if (!payload.cell.coords) {
                    return false;
                }
                return coords[0] === payload.cell.coords[0] && coords[1] === payload.cell.coords[1];
            });
            if (matchingCell?.tile) {
                const {tile} = matchingCell;
                matchingCell.tile = undefined;

                draft.log.push(
                    `${corporationName} removed ${aAnOrThe(tile.type)} ${getHumanReadableTileName(
                        tile.type
                    )} tile`
                );
                if (tile.type === TileType.OCEAN) {
                    draft.common.parameters[Parameter.OCEAN] -= 1;
                }
            }
        }
        if (increaseParameter.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {parameter, amount, noTerraformIncrease} = payload;
            handleParameterIncrease(
                draft,
                player,
                parameter,
                amount,
                corporationName,
                noTerraformIncrease
            );
        }

        if (decreaseParameter.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {parameter, amount} = payload;
            handleParameterDecrease(draft, parameter, amount, corporationName);
        }

        if (increaseTerraformRating.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {amount} = payload;
            if (amount) {
                handleTerraformRatingIncrease(player, payload.amount, draft);

                player.terraformedThisGeneration = true;
            }
        }

        if (decreaseTerraformRating.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            const {amount} = payload;
            const newRating = Math.max(player.terraformRating - amount, 0);
            if (newRating !== player.terraformRating) {
                draft.log.push(
                    `${corporationName} decreased their terraform rating by ${amount} to ${newRating}`
                );
                player.terraformRating = newRating;
            }
        }

        if (applyDiscounts.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {discounts} = payload;

            player.discounts.card += discounts.card;
            for (const tag in discounts.tags) {
                player.discounts.tags[tag] += discounts.tags[tag];
            }
            for (const tag in discounts.cards) {
                player.discounts.cards[tag] += discounts.cards[tag];
            }
            player.discounts.standardProjects += discounts.standardProjects;
            player.discounts.standardProjectPowerPlant += discounts.standardProjectPowerPlant;
            player.discounts.nextCardThisGeneration = discounts.nextCardThisGeneration;
            player.discounts.trade += discounts.trade;
        }

        if (setPlantDiscount.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.plantDiscount = action.payload.plantDiscount;
        }

        if (setOceanAdjacencybonus.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.oceanAdjacencyBonus = action.payload.oceanAdjacencyBonus;
        }

        if (applyExchangeRateChanges.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {exchangeRates: exchangeRateDeltas} = payload;

            for (const resource in exchangeRateDeltas) {
                player.exchangeRates[resource] = player.exchangeRates[resource] ?? 0;
                player.exchangeRates[resource] += exchangeRateDeltas[resource];
            }
        }

        if (markCardActionAsPlayed.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const playedCard = player.playedCards.find(card => card.name === payload.card.name)!;
            playedCard.lastRoundUsedAction = draft.common.generation;
        }

        if (moveFleet.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const colony = draft.common.colonies?.find(colony => colony.name === payload.colony);
            if (colony) {
                colony.lastTrade = {
                    player: player.username,
                    round: draft.common.generation,
                };
                draft.log.push(`${corporationName} traded with ${colony.name}`);
            }
        }

        if (moveColonyTileTrack.match(action)) {
            const {payload} = action;
            const colony = draft.common.colonies?.find(colony => colony.name === payload.colony);
            if (colony) {
                colony.step = payload.location;
                draft.log.push(`${colony.name}'s tile track went to ${colony.step + 1}`);
            }
        }

        if (askUserToPlaceColony.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.placeColony = payload.placeColony;
        }

        if (placeColony.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.placeColony = undefined;
            const colony = draft.common.colonies?.find(colony => colony.name === payload.colony);
            if (colony) {
                colony.colonies.push(player.index);
                draft.log.push(`${corporationName} placed a colony on ${colony.name}`);
                if (colony.colonies.length > colony.step) {
                    colony.step += 1;
                    draft.log.push(`${colony.name}'s tile track increased to ${colony.step + 1}`);
                }
            }
        }

        if (gainTradeFleet.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.fleets = (player.fleets ?? 0) + 1;
        }

        if (askUserToTradeForFree.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.tradeForFree = true;
        }

        if (completeTradeForFree.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.tradeForFree = undefined;
        }

        if (askUserToPutAdditionalColonyTileIntoPlay.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.putAdditionalColonyTileIntoPlay = true;
        }

        if (completeUserToPutAdditionalColonyTileIntoPlay.match(action)) {
            const {payload} = action;
            const newColony = COLONIES.find(colony => colony.name === payload.colony);
            player = getPlayer(draft, payload);
            player.putAdditionalColonyTileIntoPlay = undefined;
            if (newColony) {
                draft.common.colonies = draft.common.colonies || [];
                draft.common.colonies.push(getSerializedColony(newColony));
            }
        }

        if (increaseColonyTileTrackRange.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.colonyTileTrackRange ||= 0;
            player.colonyTileTrackRange += payload.quantity;
        }

        if (askUserToIncreaseAndDecreaseColonyTileTracks.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.increaseAndDecreaseColonyTileTracks = action.payload.quantity;
        }

        if (increaseAndDecreaseColonyTileTracks.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const increment = player.increaseAndDecreaseColonyTileTracks ?? 0;
            const {colonies} = draft.common;

            const increaseColony = colonies?.find(colony => colony.name === payload.increase);
            if (increaseColony) {
                if (increaseColony.step >= 0) {
                    const originalStep = increaseColony.step;
                    increaseColony.step += increment;
                    increaseColony.step = Math.min(
                        increaseColony.step,
                        getColony(increaseColony).tradeIncome.length - 1
                    );
                    const difference = increaseColony.step - originalStep;
                    const stepString = difference === 1 ? 'step' : 'steps';
                    draft.log.push(
                        `${corporationName} increased ${
                            increaseColony.name
                        }'s tile track by ${difference} ${stepString} to ${increaseColony.step + 1}`
                    );
                } else {
                    draft.log.push(
                        `${corporationName} did not increase ${increaseColony.name}'s tile track (colony is not online)`
                    );
                }
            }

            const decreaseColony = colonies?.find(colony => colony.name === payload.decrease);
            if (decreaseColony) {
                if (decreaseColony.step >= 0) {
                    const originalStep = decreaseColony.step;
                    decreaseColony.step -= increment;
                    decreaseColony.step = Math.max(decreaseColony.step, 0);
                    const difference = originalStep - decreaseColony.step;
                    const stepString = difference === 1 ? 'step' : 'steps';
                    draft.log.push(
                        `${corporationName} decreased ${
                            decreaseColony.name
                        }'s tile track by ${difference} ${stepString} to ${decreaseColony.step + 1}`
                    );
                } else {
                    draft.log.push(
                        `${corporationName} did not decrease ${decreaseColony.name}'s tile track (colony is not online)`
                    );
                }
            }

            player.increaseAndDecreaseColonyTileTracks = undefined;
        }

        if (askUserToPlaceDelegatesInOneParty.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.placeDelegatesInOneParty = payload.numDelegates;
        }

        if (placeDelegatesInOneParty.match(action)) {
            const {payload} = action;
            const {turmoil} = draft.common;
            player = getPlayer(draft, payload);
            player.placeDelegatesInOneParty = undefined;
            if (turmoil) {
                const delegation = turmoil.delegations[payload.party];
                if (delegation) {
                    for (let i = 0; i < payload.numDelegates; i++) {
                        let delegate: Delegate | undefined;
                        if (payload.allowLobby && turmoil.lobby[payload.playerIndex]) {
                            delegate = turmoil.lobby[payload.playerIndex];
                            delete turmoil.lobby[payload.playerIndex];
                        } else {
                            delegate = turmoil.delegateReserve[payload.playerIndex].pop();
                        }
                        if (delegate) {
                            delegation.push(delegate);
                        }
                    }
                    draft.log.push(
                        `${corporationName} placed ${payload.numDelegates} delegate${
                            payload.numDelegates === 1 ? '' : 's'
                        } in ${payload.party}`
                    );
                    const [oldLeader] = delegation;
                    determineNewLeader(turmoil, payload.party, draft, oldLeader.playerIndex);
                    determineNewDominantParty(turmoil, draft);
                }
            }
        }

        if (increaseBaseInfluence.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.baseInfluence ||= 0;
            player.baseInfluence += 1;
        }

        if (askUserToExchangeNeutralNonLeaderDelegate.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.exchangeNeutralNonLeaderDelegate = true;
        }
        if (askUserToRemoveNonLeaderDelegate.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.removeNonLeaderDelegate = true;
        }

        if (exchangeNeutralNonLeaderDelegate.match(action)) {
            const {payload} = action;
            const {turmoil} = draft.common;
            player = getPlayer(draft, payload);
            if (turmoil) {
                const delegation = turmoil.delegations[payload.party];
                const [leader, ...rest] = delegation;
                const neutralDelegateIndex = rest.findIndex(
                    delegate => delegate.playerIndex == undefined
                );
                const currentLeaderIndex = delegation[0].playerIndex;
                if (neutralDelegateIndex >= 0) {
                    const delegateInReserve = turmoil.delegateReserve[payload.playerIndex].pop();
                    if (delegateInReserve) {
                        // We'll just let neutral delegates disappear and reappear as needed.
                        delegation[neutralDelegateIndex + 1] = delegateInReserve;
                    }
                }
                draft.log.push(
                    `${corporationName} replaced a neutral delegate in ${payload.party} with one of their own`
                );
                determineNewLeader(turmoil, payload.party, draft, currentLeaderIndex);
                determineNewDominantParty(turmoil, draft);
            }
            player.exchangeNeutralNonLeaderDelegate = undefined;
        }
        if (removeNonLeaderDelegate.match(action)) {
            const {payload} = action;
            const {turmoil} = draft.common;
            player = getPlayer(draft, payload);
            if (turmoil) {
                const delegation = turmoil.delegations[payload.party];
                const [leader] = delegation;
                // remove the delegate
                const [removedDelegate] = delegation.splice(payload.delegateIndex, 1);
                // return it to the playersr supply
                if (removedDelegate.playerIndex != undefined) {
                    draft.common.turmoil?.delegateReserve[removedDelegate.playerIndex].push(
                        removedDelegate
                    );
                    draft.log.push(
                        `${corporationName} removed a ${
                            draft.players[removedDelegate.playerIndex].corporation.name
                        } from ${payload.party}`
                    );
                } else {
                    draft.log.push(
                        `${corporationName} removed a neutral delegate from ${payload.party}`
                    );
                }
                determineNewLeader(turmoil, payload.party, draft, leader.playerIndex);
                determineNewDominantParty(turmoil, draft);
            }
            player.removeNonLeaderDelegate = undefined;
        }

        if (exchangeChairman.match(action)) {
            const {payload} = action;
            const {turmoil} = draft.common;
            if (turmoil) {
                const delegateInReserve = turmoil.delegateReserve[payload.playerIndex].pop();
                if (delegateInReserve) {
                    // We'll just let neutral delegates disappear and reappear as needed.
                    turmoil.chairperson = delegateInReserve;
                    draft.log.push(
                        `${corporationName} replaced the chairman with a delegate of theirs from the reserve`
                    );
                }
            }
        }

        if (makePartyRuling.match(action)) {
            const {turmoil} = draft.common;
            if (turmoil) {
                turmoil.rulingParty = turmoil.dominantParty;
                const [leader, ...rest] = turmoil.delegations[turmoil.dominantParty];
                const currentChairperson = turmoil.chairperson;
                if (currentChairperson.playerIndex != undefined) {
                    turmoil.delegateReserve[currentChairperson.playerIndex].push(
                        currentChairperson
                    );
                }
                turmoil.chairperson = leader;
                for (const delegate of rest) {
                    if (delegate.playerIndex != undefined) {
                        turmoil.delegateReserve[delegate.playerIndex].push(delegate);
                    }
                }
                draft.log.push(`${turmoil.rulingParty} became ruling party`);
                draft.log.push(`${turmoil.dominantParty} was cleared`);
                turmoil.delegations[turmoil.dominantParty] = [];
                determineNewDominantParty(turmoil, draft);
            }
        }

        if (wrapUpTurmoil.match(action)) {
            const {turmoil} = draft.common;
            if (turmoil) {
                if (turmoil.chairperson.playerIndex != undefined) {
                    const player = draft.players[turmoil.chairperson.playerIndex];
                    draft.log.push(`${player.corporation.name}'s delegate became chairperson`);
                    handleTerraformRatingIncrease(player, 1, draft);
                }
                // Restore lobby
                for (const player of draft.players) {
                    if (!turmoil.lobby[player.index]) {
                        const [first, ...rest] = turmoil.delegateReserve[player.index];
                        if (first) {
                            turmoil.lobby[player.index] = first;
                            turmoil.delegateReserve[player.index] = rest;
                        }
                    }
                }

                const {
                    distantGlobalEvent: oldDistantGlobalEvent,
                    comingGlobalEvent: oldComingGlobalEvent,
                    currentGlobalEvent: oldCurrentGlobalEvent,
                } = turmoil;

                if (oldCurrentGlobalEvent) {
                    turmoil.oldGlobalEvents = turmoil.oldGlobalEvents ?? [];
                    turmoil.oldGlobalEvents.push(oldCurrentGlobalEvent);
                }

                turmoil.currentGlobalEvent = oldComingGlobalEvent;
                let fullEvent = getGlobalEvent(turmoil.currentGlobalEvent.name);
                if (fullEvent) {
                    const [leader] = turmoil.delegations[fullEvent.bottom.party];
                    turmoil.delegations[fullEvent.bottom.party].push(delegate());
                    const numDelegates = turmoil.delegations[fullEvent.bottom.party].length;
                    draft.log.push(
                        `${
                            fullEvent.bottom.party
                        } gained a neutral delegate (now has ${numDelegates} delegate${
                            numDelegates === 1 ? '' : 's'
                        })`
                    );
                    determineNewLeader(turmoil, fullEvent.bottom.party, draft, leader?.playerIndex);
                    determineNewDominantParty(turmoil, draft);
                }

                turmoil.comingGlobalEvent = oldDistantGlobalEvent;
                let newDistantGlobalEvent = turmoil.globalEvents.shift();
                if (!newDistantGlobalEvent) {
                    turmoil.globalEvents = turmoil.oldGlobalEvents;
                    shuffle(turmoil.globalEvents);
                    turmoil.oldGlobalEvents = [];
                    newDistantGlobalEvent = turmoil.globalEvents.shift();
                }
                if (newDistantGlobalEvent) {
                    fullEvent = getGlobalEvent(newDistantGlobalEvent.name);
                    if (fullEvent) {
                        const [leader] = turmoil.delegations[fullEvent.top.party];
                        turmoil.delegations[fullEvent.top.party].push(delegate());
                        const numDelegates = turmoil.delegations[fullEvent.top.party].length;
                        draft.log.push(
                            `${
                                fullEvent.top.party
                            } gained a neutral delegate (now has ${numDelegates} delegate${
                                numDelegates === 1 ? '' : 's'
                            })`
                        );
                        turmoil.distantGlobalEvent = newDistantGlobalEvent;
                        determineNewLeader(
                            turmoil,
                            fullEvent.top.party,
                            draft,
                            leader?.playerIndex
                        );
                        determineNewDominantParty(turmoil, draft);
                    }
                }
            }
            draft.timeForTurmoil = false;
            handleSetupNextGeneration(draft);
        }

        if (announceReadyToStartRound.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.action = 1;
            player.pendingCardSelection = undefined;
            player.terraformedThisGeneration = false;
            handleEnterActiveRound(draft);
        }

        if (skipAction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            // "Play a card from hand, reducing its cost by 25MC" but you had no valid cards to play.
            // Since you declined to play a card, you lose the discount for "next card this generation".
            if (player.pendingPlayCardFromHand) {
                if (player.pendingPlayCardFromHand.discount) {
                    player.discounts.nextCardThisGeneration = 0;
                }
                player.pendingPlayCardFromHand = undefined;
                if ((player.preludes?.length ?? 0) === 0) {
                    handleChangeCurrentPlayer(state, draft);
                }
            }
            const previous = player.action;
            const isPrelude = player.preludes?.length ?? 0 > 0;
            if (!isPrelude) {
                player.action = 1;
            }
            if (!isPrelude && previous === 2) {
                handleChangeCurrentPlayer(state, draft);
            }
        }

        if (passGeneration.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.action = 0;
            player.previousCardsInHand = player.cards.length;
            player.temporaryParameterRequirementAdjustments = zeroParameterRequirementAdjustments();

            // Check if all other players have also passed
            const activePlayers = draft.players.filter(p => p.action !== 0);
            if (activePlayers.length === 0) {
                if (common.gameStage === GameStage.GREENERY_PLACEMENT) {
                    common.gameStage = GameStage.END_OF_GAME;
                    return;
                }

                handleProduction(draft);

                if (isGameEndTriggered(draft)) {
                    let playersWhoCanPlaceGreenery: PlayerState[] = [];
                    let indexToConsider = common.firstPlayerIndex;
                    do {
                        const player = draft.players[indexToConsider];
                        if (
                            player.resources[Resource.PLANT] >=
                            convertAmountToNumber(
                                VariableAmount.PLANT_CONVERSION_AMOUNT,
                                state,
                                player
                            )
                        ) {
                            playersWhoCanPlaceGreenery.push(player);
                        }
                        indexToConsider = (indexToConsider + 1) % draft.players.length;
                    } while (indexToConsider !== common.firstPlayerIndex);
                    if (playersWhoCanPlaceGreenery.length > 0) {
                        draft.log.push({
                            actionType: GameActionType.GAME_UPDATE,
                            text: '🌳 Greenery Placement',
                        });
                        for (player of playersWhoCanPlaceGreenery) {
                            player.action = 1;
                        }

                        const [{index}] = playersWhoCanPlaceGreenery;
                        common.currentPlayerIndex = index;
                        common.gameStage = GameStage.GREENERY_PLACEMENT;
                    } else {
                        common.gameStage = GameStage.END_OF_GAME;
                    }
                } else if (draft.common.turmoil) {
                    // Do nothing for now. We'll need to do lots of complex stuff
                    // for turmoil that's not all automatic.
                    draft.timeForTurmoil = true;
                } else {
                    handleSetupNextGeneration(draft);
                }
            } else {
                handleChangeCurrentPlayer(state, draft);
            }
        }

        if (completeIncreaseLowestProduction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingIncreaseLowestProduction = undefined;
        }

        if (completeGainStandardResources.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingGainStandardResources = undefined;
        }

        if (completeAction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.pendingResourceActionDetails = undefined;
            draft.pendingVariableAmount = undefined;
            draft.common.revealedCards = [];

            if (payload.shouldIncrementActionCounter) {
                player.action = (player.action % 2) + 1;

                // Did the player just complete their second action?
                // And is it not greenery placement?
                // their turn is over.
                if (
                    player.action === 1 &&
                    draft.common.gameStage !== GameStage.GREENERY_PLACEMENT
                ) {
                    // It's the next player's turn
                    handleChangeCurrentPlayer(state, draft);
                }
            }
        }

        if (askUserToChooseNextAction.match(action)) {
            player = getPlayer(draft, action.payload);
            player.pendingNextActionChoice ||= [];
            player.pendingNextActionChoice.push(...action.payload.actions);
        }

        if (clearPendingActionChoice.match(action)) {
            player = getPlayer(draft, action.payload);
            player.pendingNextActionChoice = undefined;
        }

        if (completeChooseNextAction.match(action)) {
            player = getPlayer(draft, action.payload);
            const {actionIndex} = action.payload;
            player.pendingNextActionChoice ||= [];
            delete player.pendingNextActionChoice[actionIndex];
            if (player.pendingNextActionChoice.filter(Boolean).length === 0) {
                player.pendingNextActionChoice = undefined;
            }
        }

        if (makeLogItem.match(action)) {
            draft.log.push(action.payload.item);
        }

        const maybePlayerIndex = action.payload?.playerIndex;
        if (typeof maybePlayerIndex === 'number') {
            const player = getPlayer(draft, action.payload);
            if (
                getIsPlayerMakingDecisionExceptForNextActionChoice(draft, player) &&
                draft.common.gameStage === GameStage.ACTIVE_ROUND
            ) {
                draft.common.controllingPlayerIndex = player.index;
            } else if (player.index === draft.common.controllingPlayerIndex) {
                delete draft.common.controllingPlayerIndex;
            }
        }

        draft.logLength = draft.log.length;

        if (typeof window !== 'undefined') {
            // Don't update log on client.
            draft.log = state.log;
        }

        if ('playerIndex' in (action?.payload ?? {})) {
            const player = getPlayer(draft, action.payload);

            if (player.pendingNextActionChoice?.filter(Boolean).length === 0) {
                player.pendingNextActionChoice = undefined;
            }
        }
    });
};

function determineNewLeader(
    turmoil: WritableDraft<Turmoil>,
    party: string,
    draft: WritableDraft<GameState>,
    leaderPlayerIndex: number | undefined
) {
    const NEUTRAL_PARTY = 999;
    const delegateCountByPlayerIndex: {[key: number]: number} = {};
    for (const delegate of turmoil.delegations[party]) {
        const playerIndexOrNeutral = delegate.playerIndex ?? NEUTRAL_PARTY;
        delegateCountByPlayerIndex[playerIndexOrNeutral] ??= 0;
        delegateCountByPlayerIndex[playerIndexOrNeutral]++;
    }

    turmoil.delegations[party].sort((delegate1, delegate2) => {
        return (
            delegateCountByPlayerIndex[delegate2.playerIndex ?? NEUTRAL_PARTY] -
            delegateCountByPlayerIndex[delegate1.playerIndex ?? NEUTRAL_PARTY]
        );
    });
    const [newLeader] = turmoil.delegations[party];
    if (leaderPlayerIndex !== newLeader.playerIndex) {
        if (newLeader.playerIndex == undefined) {
            draft.log.push(`A neutral delegate now leads ${party}`);
        } else {
            const corporationName = draft.players[newLeader.playerIndex].corporation.name;
            draft.log.push(`A delegate from ${corporationName} now leads ${party}`);
        }
    }
}

function determineNewDominantParty(
    turmoil: WritableDraft<Turmoil>,
    draft: WritableDraft<GameState>
) {
    const {dominantParty: currentDominantParty, delegations} = turmoil;
    // Count clockwise to find the new party with the most delegates.
    const startingIndex = PARTY_CONFIGS.findIndex(config => config.name === currentDominantParty);
    let mostDelegates = delegations[currentDominantParty].length;
    let newDominantParty = currentDominantParty;
    // Go clockwise from current dominant party!
    for (let i = startingIndex; i >= 0; i--) {
        const party = PARTY_CONFIGS[i].name;
        const delegates = delegations[party];
        if (delegates.length > mostDelegates) {
            mostDelegates = delegates.length;
            newDominantParty = party;
        }
    }
    for (let i = PARTY_CONFIGS.length - 1; i > startingIndex; i--) {
        const party = PARTY_CONFIGS[i].name;
        const delegates = delegations[party];
        if (delegates.length > mostDelegates) {
            mostDelegates = delegates.length;
            newDominantParty = party;
        }
    }
    turmoil.dominantParty = newDominantParty;
    if (newDominantParty !== currentDominantParty) {
        draft.log.push(`${newDominantParty} became dominant`);
    }
}

function handleSetupNextGeneration(draft: WritableDraft<GameState>) {
    // shift the turn order by 1
    const oldTurnOrder = draft.common.playerIndexOrderForGeneration;
    const {common} = draft;
    common.playerIndexOrderForGeneration = [...oldTurnOrder.slice(1), oldTurnOrder[0]];
    common.firstPlayerIndex = (common.firstPlayerIndex + 1) % draft.players.length;
    common.currentPlayerIndex = common.firstPlayerIndex;
    common.turn = 1;
    common.generation++;
    draft.log.push({
        actionType: GameActionType.GAME_UPDATE,
        text: `📜 Start of Generation ${common.generation}`,
    });
    common.gameStage = draft.options?.isDraftingEnabled
        ? GameStage.DRAFTING
        : GameStage.BUY_OR_DISCARD;

    for (const player of draft.players) {
        player.pendingCardSelection = {
            possibleCards: handleDrawCards(draft, 4),
            isBuyingCards: draft.options?.isDraftingEnabled ? false : true,
            draftPicks: draft.options?.isDraftingEnabled ? [] : undefined,
        };
        setSyncingTrueIfClient(draft);
        if (process.env.NODE_ENV === 'development') {
            const bonuses = [...draft.common.deck, ...draft.common.discardPile].filter(card =>
                bonusNames.includes(card.name)
            );
            // (hack for debugging)
            const deleted = player.pendingCardSelection.possibleCards.splice(
                0,
                bonuses.length,
                ...bonuses
            );
            draft.common.deck = draft.common.deck.filter(card => !bonusNames.includes(card.name));
            draft.common.discardPile = draft.common.discardPile.filter(
                card => !bonusNames.includes(card.name)
            );
            draft.common.discardPile.push(...deleted);
        }
    }
}

const equalityFn = shallowEqual;

export const useTypedSelector: TypedUseSelectorHook<GameState> = selector => {
    return useSelector(selector, equalityFn);
};
