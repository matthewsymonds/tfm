import {quantityAndResource} from 'components/ask-user-to-confirm-resource-action-details';
import {getTextForAward} from 'components/board/board-actions/awards-new';
import {getTextForMilestone} from 'components/board/board-actions/milestones-new';
import {getTextForStandardProject} from 'components/board/board-actions/standard-projects-new';
import {CardType, Deck} from 'constants/card-types';
import {CARD_SELECTION_CRITERIA_SELECTORS} from 'constants/reveal-take-and-discard';
import produce from 'immer';
import {shuffle} from 'initial-state';
import {Card} from 'models/card';
import {shallowEqual, TypedUseSelectorHook, useSelector} from 'react-redux';
import {AnyAction} from 'redux';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {getCard} from 'selectors/get-card';
import {getConditionalPaymentWithResourceInfo} from 'selectors/get-conditional-payment-with-resource-info';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
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
    claimMilestone,
    completeAction,
    completeIncreaseLowestProduction,
    decreaseProduction,
    discardCards,
    discardPreludes,
    discardRevealedCards,
    draftCard,
    fundAward,
    gainResource,
    gainResourceWhenIncreaseProduction,
    gainStorableResource,
    increaseParameter,
    increaseProduction,
    increaseTerraformRating,
    makeActionChoice,
    markCardActionAsPlayed,
    moveCardFromHandToPlayArea,
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
    setGame,
    setIsNotSyncing,
    setIsSyncing,
    setPlantDiscount,
    setPreludes,
    skipAction,
    skipChoice,
    stealResource,
    stealStorableResource,
    useBlueCardActionAlreadyUsedThisGeneration,
} from './actions';
import {Action, Amount} from './constants/action';
import {Cell, getParameterName, Parameter, TileType} from './constants/board';
import {CONVERSIONS} from './constants/conversion';
import {GameStage, MAX_PARAMETERS, PARAMETER_STEPS} from './constants/game';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {getResourceName, isStorableResource, Resource} from './constants/resource';
import {StandardProjectType} from './constants/standard-project';
import {getAdjacentCellsForCell} from './selectors/board';
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

function handleEnterActiveRound(state: GameState) {
    if (
        state.common.gameStage !== GameStage.ACTIVE_ROUND &&
        state.players.every(player => player.action === 1)
    ) {
        // Everyone's ready!
        for (const player of state.players) {
            player.pendingCardSelection = undefined;
        }
        state.common.gameStage = GameStage.ACTIVE_ROUND;
        state.log.push(`Generation ${state.common.generation}, turn 1`);
    }
}

export type GameOptions = {
    isDraftingEnabled: boolean;
    decks: Deck[];
};

export type PendingChoice = {
    choice: Action[];
    card: Card;
    playedCard?: Card;
};

function getTilePlacementBonus(cell: Cell): Array<{resource: Resource; amount: number}> {
    const bonuses = cell.bonus || [];
    const uniqueBonuses = new Set(bonuses);

    return [...uniqueBonuses].map(bonus => {
        return {
            resource: bonus,
            amount: bonuses.filter(b => b === bonus).length,
        };
    });
}

function handleProduction(draft: GameState) {
    for (const player of draft.players) {
        player.resources[Resource.MEGACREDIT] += player.terraformRating;
        player.resources[Resource.HEAT] += player.resources[Resource.ENERGY];
        player.resources[Resource.ENERGY] = 0;
        for (const production in player.productions) {
            player.resources[production] += player.productions[production];
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
        draft.log.push(`Generation ${draft.common.generation}, turn ${draft.common.turn}`);
    }
}

// Add Card Name here.
const bonusNames: string[] = [];

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
    corporationName: string
) {
    const scale = PARAMETER_STEPS[parameter];
    const increase = amount * scale;
    const startingAmount = draft.common.parameters[parameter];
    const newAmount = Math.min(MAX_PARAMETERS[parameter], startingAmount + increase);
    const change = newAmount - startingAmount;
    const userTerraformRatingChange = change / scale;
    draft.common.parameters[parameter] = newAmount;
    player.terraformRating += userTerraformRatingChange;
    if (userTerraformRatingChange) {
        player.terraformedThisGeneration = true;
    }
    if (change && parameter !== Parameter.OCEAN) {
        draft.log.push(
            `${corporationName} increased ${getParameterName(
                parameter
            )} ${userTerraformRatingChange} ${stepsPlural(userTerraformRatingChange)}`
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
    resource: Resource,
    amount: Amount,
    corporationName: string
) => {
    mostRecentlyPlayedCard = getMostRecentlyPlayedCard(player);

    const quantity = convertAmountToNumber(amount, draft, player, mostRecentlyPlayedCard);

    if (resource === Resource.CARD) {
        // Sometimes we list cards as a resource.
        // handle as a draw action.
        player.cards.push(...handleDrawCards(draft, quantity));
        draft.log.push(`${corporationName} drew ${quantity} ${cardsPlural(quantity)}`);
        return;
    }
    if (isStorableResource(resource)) {
        return;
    }
    player.resources[resource] += quantity;
    draft.log.push(`${corporationName} gained ${quantityAndResource(quantity, resource)}`);
};

export const reducer = (state: GameState | null = null, action: AnyAction) => {
    if (setGame.match(action)) {
        // A client-side action.
        // Sets the game state returned from the server.
        const newState = action.payload.gameState;
        if (newState === null) {
            return state;
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
        // increment the state changes tally if on server.
        if (setIsSyncing.match(action)) {
            draft.syncing = true;
        }

        if (setIsNotSyncing.match(action)) {
            draft.syncing = false;
        }

        let player: PlayerState;

        const corporationName =
            draft.players[action.payload?.playerIndex ?? -1]?.corporation?.name ?? '';

        const {common} = draft;

        if (setCorporation.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);

            player.corporation = payload.corporation;
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
                player.resources[Resource.MEGACREDIT] -= numCards * 3;
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
                        return !(selection.draftPicks ?? []).map(d => d.name).includes(card.name);
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

        if (discardRevealedCards.match(action)) {
            // Step 2. Discard the revealed cards.
            draft.common.discardPile.push(...draft.common.revealedCards);
            draft.log.push(`Discarded ${draft.common.revealedCards.map(c => c.name).join(', ')}`);
            draft.common.revealedCards = [];
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
                draft.log.push(
                    `${corporationName} discarded ${payload.cards.length} ${cardsPlural(
                        payload.cards.length
                    )}`
                );
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

            const sourcePlayer = draft.players[sourcePlayerIndex];
            if (amount > sourcePlayer.resources[resource]) {
                throw new Error('Trying to take too many resources');
            }
            draft.pendingVariableAmount = amount;

            const quantity = convertAmountToNumber(amount, state, player);

            sourcePlayer.resources[resource] -= quantity;
            if (amount) {
                draft.log.push(
                    `${sourcePlayer.corporation.name} lost ${quantityAndResource(
                        quantity,
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
            handleGainResource(player, draft, payload.resource, payload.amount, corporationName);
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
            let logMessage = `${corporationName} paid ${cardCost} to play ${payload.card.name}`;

            player.discounts.nextCardThisGeneration = 0;

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
            if (cost) {
                draft.log.push(
                    `${corporationName} paid ${cost} for a standard project ${getTextForStandardProject(
                        payload.standardProjectAction.type
                    )!.toLowerCase()}`
                );
            } else {
                draft.log.push(
                    `${corporationName} played standard project ${getTextForStandardProject(
                        payload.standardProjectAction.type
                    )!.toLowerCase()}`
                );
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
            draft.log.push(
                `${corporationName} claimed ${getTextForMilestone(payload.milestone)} milestone`
            );
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
            draft.log.push(`${corporationName} funded ${getTextForAward(payload.award)} award`);
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
                draft.log.push(`${player.username} chose ${payload.card.name}`);
            }
            if (card.type === CardType.PRELUDE) {
                player.preludes = player.preludes.filter(c => c.name !== payload.card.name);
                draft.log.push(`${corporationName} played Prelude ${card.name}`);
            }
            if (player.pendingPlayCardFromHand) {
                player.pendingPlayCardFromHand = undefined;
            }
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

        if (askUserToChooseResourceActionDetails.match(action) && action.payload) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {actionType, resourceAndAmounts, locationType} = payload;
            const card = player.playedCards.find(
                playerCard => playerCard.name === payload.card.name
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

        if (askUserToDuplicateProduction.match(action) && action.payload) {
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
            const {choice, playedCard} = payload;
            const card = player.playedCards.find(
                playedCard => playedCard.name === payload.card.name
            )!;
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

            const tilePlacementBonus = getTilePlacementBonus(payload.cell);
            for (const b of tilePlacementBonus) {
                handleGainResource(player, draft, b.resource, b.amount, corporationName);
            }
            const megacreditIncreaseFromOceans =
                getAdjacentCellsForCell(draft, payload.cell).filter(cell => {
                    return cell.tile?.type === TileType.OCEAN;
                }).length * 2;
            if (megacreditIncreaseFromOceans) {
                player.resources[Resource.MEGACREDIT] += megacreditIncreaseFromOceans;
                draft.log.push(
                    `${corporationName} gained ${megacreditIncreaseFromOceans} megacredits from ocean adjacency`
                );
            }
        }
        if (increaseParameter.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            const {parameter, amount} = payload;
            handleParameterIncrease(draft, player, parameter, amount, corporationName);
        }

        if (increaseTerraformRating.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            mostRecentlyPlayedCard = getMostRecentlyPlayedCard(player);

            const {amount} = payload;
            const quantity = convertAmountToNumber(amount, state, player, mostRecentlyPlayedCard);
            const newRating = player.terraformRating + quantity;
            draft.log.push(
                `${corporationName} increased their terraform rating by ${quantity} to ${newRating}`
            );
            player.terraformRating = newRating;
            if (quantity) {
                player.terraformedThisGeneration = true;
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
            // We skip logging if the action has a cost b/c in that case we already have logged
            // e.g. "Corp X paid 2 to play Card Y's action" inside PAY_TO_PLAY_CARD_ACTION
            if (payload.shouldLog) {
                draft.log.push(`${corporationName} played ${playedCard.name}'s action`);
            }
        }

        if (announceReadyToStartRound.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.action = 1;
            player.pendingCardSelection = undefined;
            handleEnterActiveRound(draft);
        }

        if (skipAction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
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
            // Did the player just skip on their first action?
            // Or is this greenery phase?
            // If so, they're out for the rest of the round.
            if (
                !isPrelude &&
                (previous === 1 || common.gameStage === GameStage.GREENERY_PLACEMENT)
            ) {
                draft.log.push(`${corporationName} passed`);

                player.action = 0;
                player.previousCardsInHand = player.cards.length;
                player.terraformedThisGeneration = false;
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
                        const playersWhoCanPlaceGreenery = draft.players.filter(
                            player =>
                                player.resources[Resource.PLANT] >=
                                convertAmountToNumber(
                                    CONVERSIONS[Resource.PLANT].removeResource[Resource.PLANT],
                                    state,
                                    player
                                )
                        );
                        for (player of playersWhoCanPlaceGreenery) {
                            player.action = 1;
                        }
                        if (playersWhoCanPlaceGreenery.length > 0) {
                            draft.log.push('Greenery Placement');
                            const [{index}] = playersWhoCanPlaceGreenery;
                            common.currentPlayerIndex = index;
                            common.gameStage = GameStage.GREENERY_PLACEMENT;
                        } else {
                            common.gameStage = GameStage.END_OF_GAME;
                        }
                    } else {
                        // shift the turn order by 1
                        const oldTurnOrder = state.common.playerIndexOrderForGeneration;
                        draft.common.playerIndexOrderForGeneration = [
                            ...oldTurnOrder.slice(1),
                            oldTurnOrder[0],
                        ];
                        common.firstPlayerIndex =
                            (common.firstPlayerIndex + 1) % draft.players.length;
                        common.currentPlayerIndex = common.firstPlayerIndex;
                        common.turn = 1;
                        common.generation++;
                        draft.log.push(`Generation ${common.generation}`);
                        common.gameStage = draft.options?.isDraftingEnabled
                            ? GameStage.DRAFTING
                            : GameStage.BUY_OR_DISCARD;

                        for (player of draft.players) {
                            player.pendingCardSelection = {
                                possibleCards: handleDrawCards(draft, 4),
                                isBuyingCards: draft.options?.isDraftingEnabled ? false : true,
                                draftPicks: draft.options?.isDraftingEnabled ? [] : undefined,
                            };
                            setSyncingTrueIfClient(draft);

                            if (process.env.NODE_ENV === 'development') {
                                const bonuses = draft.common.deck.filter(card =>
                                    bonusNames.includes(card.name)
                                );
                                // (hack for debugging)
                                player.pendingCardSelection.possibleCards.push(...bonuses);
                            }
                            draft.common.deck = draft.common.deck.filter(
                                card => !bonusNames.includes(card.name)
                            );
                        }
                    }
                } else {
                    handleChangeCurrentPlayer(state, draft);
                }
            } else {
                draft.log.push(`${corporationName} skipped their 2nd action`);
                handleChangeCurrentPlayer(state, draft);
            }
        }

        if (completeIncreaseLowestProduction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingIncreaseLowestProduction = undefined;
        }

        if (completeAction.match(action)) {
            const {payload} = action;
            player = getPlayer(draft, payload);
            player.pendingResourceActionDetails = undefined;
            draft.pendingVariableAmount = undefined;
            player.action = (player.action % 2) + 1;

            // Did the player just complete their second action?
            // And is it not greenery placement?
            // their turn is over.
            if (player.action === 1 && draft.common.gameStage !== GameStage.GREENERY_PLACEMENT) {
                // It's the next player's turn
                handleChangeCurrentPlayer(state, draft);
            }
        }
    });
};

const equalityFn = shallowEqual;

export const useTypedSelector: TypedUseSelectorHook<GameState> = selector =>
    useSelector(selector, equalityFn);
