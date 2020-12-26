import {
    amountAndResource,
    ResourceActionType
} from 'components/ask-user-to-confirm-resource-action-details';
import {getTextForAward} from 'components/board/awards';
import {getTextForMilestone} from 'components/board/milestones';
import {getTextForStandardProject} from 'components/board/standard-projects';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';
import produce from 'immer';
import {shuffle} from 'initial-state';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {aAnOrThe, getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {
    ADD_FORCED_ACTION_TO_PLAYER,
    ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS,
    ANNOUNCE_READY_TO_START_ROUND,
    APPLY_DISCOUNTS,
    APPLY_EXCHANGE_RATE_CHANGES,
    ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
    ASK_USER_TO_DISCARD_CARDS,
    ASK_USER_TO_DUPLICATE_PRODUCTION,
    ASK_USER_TO_LOOK_AT_CARDS,
    ASK_USER_TO_MAKE_ACTION_CHOICE,
    ASK_USER_TO_PLACE_TILE,
    CLAIM_MILESTONE,
    COMPLETE_ACTION,
    DECREASE_PRODUCTION,
    DISCARD_CARDS,
    DISCARD_REVEALED_CARDS,
    DRAW_CARDS,
    FUND_AWARD,
    GAIN_RESOURCE,
    GAIN_STORABLE_RESOURCE,
    INCREASE_PARAMETER,
    INCREASE_PRODUCTION,
    INCREASE_TERRAFORM_RATING,
    MAKE_ACTION_CHOICE,
    MARK_CARD_ACTION_AS_PLAYED,
    MOVE_CARD_FROM_HAND_TO_PLAY_AREA,
    PAY_FOR_CARDS,
    PAY_TO_PLAY_CARD,
    PAY_TO_PLAY_CARD_ACTION,
    PAY_TO_PLAY_STANDARD_PROJECT,
    PLACE_TILE,
    REMOVE_FORCED_ACTION_FROM_PLAYER,
    REMOVE_RESOURCE,
    REMOVE_STORABLE_RESOURCE,
    REVEAL_AND_DISCARD_TOP_CARDS,
    SET_CARDS,
    SET_CORPORATION,
    SET_GAME,
    SET_IS_SYNCING,
    SET_PLANT_DISCOUNT,
    SKIP_ACTION,
    SKIP_CHOICE,
    STEAL_RESOURCE,
    STEAL_STORABLE_RESOURCE
} from './actions';
import {Action, Amount} from './constants/action';
import {
    Award,
    Board,
    Cell,
    getParameterName,
    Milestone,
    Parameter,
    TilePlacement,
    TileType
} from './constants/board';
import {CONVERSIONS} from './constants/conversion';
import {Discounts} from './constants/discounts';
import {GameStage, MAX_PARAMETERS, PARAMETER_STEPS} from './constants/game';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {NumericPropertyCounter} from './constants/property-counter';
import {
    getResourceName,
    isStorableResource,
    Resource,
    ResourceAndAmount,
    ResourceLocationType
} from './constants/resource';
import {StandardProjectType} from './constants/standard-project';
import {Card} from './models/card';
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

const cardsPlural = num => (num === 1 ? 'card' : 'cards');
const stepsPlural = num => (num === 1 ? 'step' : 'steps');

function handleEnterActiveRound(state: GameState) {
    if (
        state.common.gameStage !== GameStage.ACTIVE_ROUND &&
        state.players.every(player => player.action === 1)
    ) {
        // Everyone's ready!
        for (const player of state.players) {
            player.possibleCards = [];
        }
        state.common.gameStage = GameStage.ACTIVE_ROUND;
        state.log.push('Turn 1');
    }
}

type PlayerId = number;

export type CommonState = {
    // List of indices of playing players.
    playerIndexOrderForGeneration: number[];
    deck: Card[];
    discardPile: Card[];
    revealedCards: Card[];
    gameStage: GameStage;
    generation: number;
    claimedMilestones: {claimedByPlayerIndex: number; milestone: Milestone}[];
    fundedAwards: {fundedByPlayerIndex: number; award: Award}[];
    turn: number;
    firstPlayerIndex: number;
    currentPlayerIndex: number;
    parameters: {
        [Parameter.OCEAN]: number;
        [Parameter.OXYGEN]: number;
        [Parameter.TEMPERATURE]: number;
        [Parameter.VENUS]: number;
    };
    // Used for Flooding.
    mostRecentTilePlacementCell?: Cell;
    board: Board;
};

export type GameState = {
    // if true, the user is waiting for a response from the server.
    syncing?: boolean;
    pendingVariableAmount?: number;
    players: Array<PlayerState>;
    common: CommonState;
    log: string[];
    numChanges: number;
};

export type PlayerState = {
    index: number;
    // For UNMI
    terraformedThisGeneration?: boolean;
    username: string;
    action: number; // 1 or 2.
    terraformRating: number;
    pendingTilePlacement?: TilePlacement;
    pendingResourceSource?: string | number; // either card name or player index
    pendingResourceActionDetails?: {
        actionType: ResourceActionType;
        resourceAndAmounts: Array<ResourceAndAmount>;
        card: Card;
        playedCard?: Card; // The card that was played and triggered the decision.
        locationType?: ResourceLocationType;
    };
    pendingDuplicateProduction?: {
        tag: Tag;
        card: Card;
    };
    // e.g. Sell patents
    pendingDiscard?: {
        amount: Amount;
        card?: Card;
    };
    // e.g. Insulation
    pendingProductionDecrease?: Resource;
    previousCardsInHand?: number;

    // In an action that makes you look at cards, specifies how many you can take or buy.
    numCardsToTake: number | null;
    // Is the player considering buying the cards they're looking at?
    buyCards?: boolean | null;
    forcedActions: Array<Action>;
    corporation: Card;
    possibleCards: Card[];
    possibleCorporations: Card[];
    cards: Card[];
    playedCards: Card[];
    resources: Resources;
    productions: Resources;
    exchangeRates: {
        [Resource.STEEL]: number;
        [Resource.TITANIUM]: number;
        [Resource.HEAT]: number;
    };
    discounts: Discounts;
    plantDiscount?: number;
    pendingChoice?: PendingChoice;

    parameterRequirementAdjustments: NumericPropertyCounter<Parameter>;
    temporaryParameterRequirementAdjustments: NumericPropertyCounter<Parameter>;
};

type PendingChoice = {
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
    if (newPlaceInTurnOrder < oldPlaceInTurnOrder || players.length === 1) {
        draft.common.turn++;
        draft.log.push(`Turn ${draft.common.turn}`);
    }
}

// Add Card Name here.
const bonusName = 'Restricted Area';

export function getNumOceans(state: GameState): number {
    return state.common.board.flat().filter(cell => cell.tile?.type === TileType.OCEAN).length;
}

export const reducer = (state: GameState | null = null, action) => {
    if (action.type === SET_GAME) {
        // A client-side action.
        // Sets the game state returned from the server.
        const newState = action.payload.gameState;
        if (newState === null) {
            return null;
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
    const {payload} = action;
    return produce(state, draft => {
        // increment the state changes tally if on server.
        if (payload?.type !== SET_IS_SYNCING) {
            draft.numChanges = (state.numChanges ?? 0) + 1;
        }

        const player = draft.players[payload?.playerIndex];
        const corporationName = player?.corporation.name;
        const {common} = draft;
        function handleParameterIncrease(parameter: Parameter, amount: number) {
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

        const mostRecentlyPlayedCard = player?.playedCards[player.playedCards.length - 1];

        function handleDrawCards(numCards: number) {
            const cardsFromDeck = draft.common.deck.splice(0, numCards);
            if (cardsFromDeck.length < numCards) {
                draft.common.deck = shuffle(draft.common.discardPile);
                cardsFromDeck.push(...draft.common.deck.splice(0, numCards - cardsFromDeck.length));
                draft.common.discardPile = [];
            }

            return cardsFromDeck;
        }

        const handleGainResource = (resource: Resource, amount: Amount) => {
            const numberAmount = convertAmountToNumber(
                amount,
                state,
                player,
                mostRecentlyPlayedCard
            );

            if (resource === Resource.CARD) {
                // Sometimes we list cards as a resource.
                // handle as a draw action.
                player.cards.push(...handleDrawCards(numberAmount));
                draft.log.push(
                    `${corporationName} drew ${numberAmount} ${cardsPlural(numberAmount)}`
                );
                return;
            }
            if (isStorableResource(resource)) {
                return;
            }
            player.resources[resource] += numberAmount;
            draft.log.push(
                `${corporationName} gained ${amountAndResource(numberAmount, resource)}`
            );
        };

        switch (action.type) {
            case SET_CORPORATION:
                player.corporation = payload.corporation;
                break;
            case PAY_FOR_CARDS:
                const numCards = action.payload.cards.length;
                player.resources[Resource.MEGACREDIT] -= numCards * 3;
                if (player.resources[Resource.MEGACREDIT] < 0) {
                    throw new Error('Money went negative!');
                }
                player.buyCards = null;
                draft.log.push(`${corporationName} bought ${numCards} ${cardsPlural(numCards)}`);
                break;
            case REVEAL_AND_DISCARD_TOP_CARDS:
                // Step 1. Reveal the cards to the player so they can see them.
                const numCardsToReveal = convertAmountToNumber(payload.amount, state, player);
                draft.common.revealedCards = handleDrawCards(numCardsToReveal);
                draft.log.push('Revealed ', draft.common.revealedCards.map(c => c.name).join(', '));
                break;
            case DISCARD_REVEALED_CARDS:
                // Step 2. Discard the revealed cards.
                draft.common.discardPile.push(...draft.common.revealedCards);
                draft.log.push(
                    'Discarded ',
                    draft.common.revealedCards.map(c => c.name).join(', ')
                );
                draft.common.revealedCards = [];
                break;
            case ASK_USER_TO_DISCARD_CARDS:
                player.pendingDiscard = {
                    amount: payload.amount,
                    card: payload.card,
                };
                player.possibleCards = player.cards;
                break;
            case ASK_USER_TO_LOOK_AT_CARDS:
                player.possibleCards = handleDrawCards(payload.amount);
                player.numCardsToTake = payload.numCardsToTake || null;
                player.buyCards = payload.buyCards;
                break;
            case SET_CARDS:
                player.cards = action.payload.cards;
                player.numCardsToTake = null;
                break;
            case DISCARD_CARDS:
                draft.pendingVariableAmount = payload.cards.length;
                draft.log.push(
                    `${corporationName} discarded ${payload.cards.length} ${cardsPlural(
                        payload.cards.length
                    )}`
                );
                player.pendingDiscard = undefined;
                draft.common.discardPile.push(...payload.cards);
                player.cards = player.cards.filter(
                    playerCard => !payload.cards.map(card => card.name).includes(playerCard.name)
                );
                player.possibleCards = [];
                break;
            case DRAW_CARDS:
                draft.log.push(
                    `${corporationName} drew ${payload.numCards} ${cardsPlural(payload.numCards)}`
                );

                player.cards.push(...handleDrawCards(payload.numCards));
                break;
            case ADD_FORCED_ACTION_TO_PLAYER: {
                const {forcedAction} = payload;
                player.forcedActions.push(forcedAction);
                break;
            }
            case REMOVE_FORCED_ACTION_FROM_PLAYER: {
                player.forcedActions = player.forcedActions.slice(1);
                break;
            }

            case DECREASE_PRODUCTION: {
                draft.pendingVariableAmount = payload.amount;
                player.pendingResourceActionDetails = undefined;
                player.pendingDuplicateProduction = undefined;
                let targetPlayer = draft.players[payload.targetPlayerIndex];

                const decrease = convertAmountToNumber(
                    payload.amount,
                    state,
                    player,
                    mostRecentlyPlayedCard
                );

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
                break;
            }

            case SKIP_CHOICE:
                player.pendingResourceActionDetails = undefined;
                player.pendingDuplicateProduction = undefined;
                break;

            case INCREASE_PRODUCTION: {
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
                }
                break;
            }
            case REMOVE_RESOURCE: {
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
                        `${sourcePlayer.corporation.name} lost ${amountAndResource(
                            quantity,
                            resource
                        )}`
                    );
                }
                break;
            }
            case REMOVE_STORABLE_RESOURCE: {
                player.pendingResourceActionDetails = undefined;

                const {card, resource, amount} = payload;

                const targetCard = draft.players
                    .flatMap(player => player.playedCards)
                    .find(playedCard => playedCard.name === card.name);

                if (!targetCard) {
                    throw new Error(`Target card ${card.name} not found in played cards`);
                }
                if (targetCard.storedResourceType !== resource) {
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
                draft.log.push(
                    `${corporationName} lost ${amountAndResource(payload.amount, resource)} from ${
                        targetCard.name
                    }`
                );
                break;
            }
            case STEAL_RESOURCE: {
                player.pendingResourceActionDetails = undefined;

                const {resource, amount, victimPlayerIndex} = payload;
                const victimPlayer = draft.players[victimPlayerIndex];

                if (amount > victimPlayer.resources[resource]) {
                    throw new Error('Trying to take too many resources');
                }
                victimPlayer.resources[resource] -= amount;
                player.resources[resource] += amount;
                draft.log.push(
                    `${corporationName} stole ${amountAndResource(payload.amount, resource)} from ${
                        victimPlayer.corporation.name
                    }`
                );
                break;
            }
            case STEAL_STORABLE_RESOURCE: {
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
                    resource !== draftSourceCard.storedResourceType ||
                    draftSourceCard.storedResourceType !== draftTargetCard.storedResourceType
                ) {
                    throw new Error("Resource type doesn't match");
                }

                draftSourceCard.storedResourceAmount -= amount;
                draftTargetCard.storedResourceAmount =
                    (draftTargetCard.storedResourceAmount || 0) + amount;
                draft.log.push(
                    `${corporationName} moved ${amountAndResource(payload.amount, resource)} from ${
                        draftSourceCard.name
                    } onto ${draftTargetCard.name}`
                );
                break;
            }
            case GAIN_RESOURCE:
                player.pendingResourceActionDetails = undefined;
                handleGainResource(payload.resource, payload.amount);
                break;
            case GAIN_STORABLE_RESOURCE: {
                player.pendingResourceActionDetails = undefined;
                const {card, amount} = payload;
                const draftCard = player.playedCards.find(c => c.name === card.name);
                if (!draftCard) {
                    throw new Error('Card should exist to gain storable resources to');
                }
                const quantity = convertAmountToNumber(amount, state, player);
                draftCard.storedResourceAmount = (draftCard.storedResourceAmount || 0) + quantity;
                draft.log.push(
                    `${corporationName} added ${amountAndResource(
                        quantity,
                        draftCard.storedResourceType!
                    )} to ${draftCard.name}`
                );
                break;
            }
            case PAY_TO_PLAY_CARD: {
                const cardCost = getDiscountedCardCost(payload.card, player);
                if (payload.payment) {
                    for (const resource in payload.payment) {
                        player.resources[resource] -= payload.payment[resource];
                    }
                } else {
                    player.resources[Resource.MEGACREDIT] -= cardCost;
                }
                player.discounts.nextCardThisGeneration = 0;
                let logMessage = `${corporationName} paid ${cardCost} to play ${payload.card.name}`;
                let details: string[] = [];
                for (const resource in payload.payment) {
                    if (payload.payment[resource]) {
                        details.push(
                            amountAndResource(payload.payment[resource], resource as Resource)
                        );
                    }
                }

                if (details.length > 0) {
                    logMessage += ` (with ${details.join(', ')})`;
                }
                draft.log.push(logMessage);
                break;
            }
            case PAY_TO_PLAY_CARD_ACTION: {
                // discounts don't apply to card actions (standard projects are handled
                // in a separate reducer action PAY_TO_PLAY_STANDARD_PROJECT)
                const actionCost = payload.action.cost;
                if (payload.payment) {
                    for (const resource in payload.payment) {
                        player.resources[resource] -= payload.payment[resource];
                    }
                } else {
                    player.resources[Resource.MEGACREDIT] -= actionCost;
                }
                player.discounts.nextCardThisGeneration = 0;
                let logMessage = `${corporationName} paid ${actionCost} to play ${payload.parentCard.name}'s action`;
                let details: string[] = [];
                for (const resource in payload.payment) {
                    if (payload.payment[resource]) {
                        details.push(
                            amountAndResource(payload.payment[resource], resource as Resource)
                        );
                    }
                }

                if (details.length > 0) {
                    logMessage += ` (with ${details.join(', ')})`;
                }
                draft.log.push(logMessage);
                break;
            }
            case PAY_TO_PLAY_STANDARD_PROJECT: {
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

                break;
            }
            case CLAIM_MILESTONE: {
                const {payment, milestone} = payload;
                for (const resource in payment || {}) {
                    player.resources[resource] -= payment[resource];
                }
                draft.common.claimedMilestones.push({
                    claimedByPlayerIndex: player.index,
                    milestone: milestone,
                });
                draft.log.push(
                    `${corporationName} claimed ${getTextForMilestone(payload.milestone)} milestone`
                );
                break;
            }
            case FUND_AWARD: {
                const {payment, award} = payload;
                for (const resource in payment || {}) {
                    player.resources[resource] -= payment[resource];
                }
                draft.common.fundedAwards.push({
                    fundedByPlayerIndex: player.index,
                    award: award,
                });
                draft.log.push(`${corporationName} funded ${getTextForAward(payload.award)} award`);
                break;
            }
            case MOVE_CARD_FROM_HAND_TO_PLAY_AREA:
                player.cards = player.cards.filter(c => c.name !== payload.card.name);
                player.playedCards.push(payload.card);
                if (payload.card.type === CardType.CORPORATION) {
                    player.possibleCorporations = [];
                    draft.log.push(`${player.username} chose ${payload.card.name}`);
                }
                player.temporaryParameterRequirementAdjustments = zeroParameterRequirementAdjustments();
                break;
            case ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS:
                for (const parameter in payload.parameterRequirementAdjustments) {
                    player.parameterRequirementAdjustments[parameter] +=
                        payload.parameterRequirementAdjustments[parameter];
                }
                for (const parameter in payload.temporaryParameterRequirementAdjustments) {
                    player.temporaryParameterRequirementAdjustments[parameter] =
                        payload.temporaryParameterRequirementAdjustments[parameter];
                }
                break;
            case ASK_USER_TO_PLACE_TILE:
                const {type} = payload.tilePlacement;
                if (type === TileType.OCEAN) {
                    // Check that 9 oceans haven't already been placed.
                    if (getNumOceans(state) === MAX_PARAMETERS[Parameter.OCEAN]) {
                        break;
                    }
                }
                player.pendingTilePlacement = payload.tilePlacement;
                break;
            case ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS: {
                const {actionType, resourceAndAmounts, card, playedCard, locationType} = payload;
                player.pendingResourceActionDetails = {
                    actionType,
                    resourceAndAmounts,
                    card,
                    playedCard,
                    locationType,
                };

                break;
            }
            case ASK_USER_TO_DUPLICATE_PRODUCTION: {
                const {tag, card} = payload;
                player.pendingDuplicateProduction = {
                    tag,
                    card,
                };
                break;
            }
            case ASK_USER_TO_MAKE_ACTION_CHOICE:
                const {choice, card, playedCard} = payload;
                player.pendingChoice = {choice, card, playedCard};
                break;
            case MAKE_ACTION_CHOICE:
                player.pendingChoice = undefined;
                break;
            case PLACE_TILE:
                player.pendingTilePlacement = undefined;
                if (payload.tile?.type !== TileType.OCEAN) {
                    payload.tile.ownerPlayerIndex = player.index;
                }
                const matchingCell = draft.common.board.flat().find(cell => {
                    if (cell.specialName) {
                        return cell.specialName === payload.cell.specialName;
                    }
                    const coords = cell.coords || [];
                    return (
                        coords[0] === payload.cell.coords[0] && coords[1] === payload.cell.coords[1]
                    );
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
                    handleGainResource(b.resource, b.amount);
                }
                const megacreditIncreaseFromOceans =
                    getAdjacentCellsForCell(draft, payload.cell).filter(cell => {
                        return cell.tile?.type === TileType.OCEAN;
                    }).length * 2;
                player.resources[Resource.MEGACREDIT] += megacreditIncreaseFromOceans;
                break;
            case INCREASE_PARAMETER: {
                const {parameter, amount} = payload;
                handleParameterIncrease(parameter, amount);
                break;
            }
            case INCREASE_TERRAFORM_RATING:
                const {amount} = payload;
                const quantity = convertAmountToNumber(
                    amount,
                    state,
                    player,
                    mostRecentlyPlayedCard
                );
                const newRating = player.terraformRating + quantity;
                draft.log.push(
                    `${corporationName} increased their terraform rating by ${quantity} to ${newRating}`
                );
                player.terraformRating = newRating;
                break;
            case APPLY_DISCOUNTS: {
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
                break;
            }
            case SET_PLANT_DISCOUNT:
                player.plantDiscount = action.payload.plantDiscount;
                break;
            case APPLY_EXCHANGE_RATE_CHANGES: {
                const {exchangeRates: exchangeRateDeltas} = payload;

                for (const resource in exchangeRateDeltas) {
                    player.exchangeRates[resource] += exchangeRateDeltas[resource];
                }
                break;
            }
            case MARK_CARD_ACTION_AS_PLAYED: {
                const playedCard = player.playedCards.find(
                    card => card.name === payload.card.name
                )!;
                playedCard.lastRoundUsedAction = draft.common.generation;
                // We skip logging if the action has a cost b/c in that case we already have logged
                // e.g. "Corp X paid 2 to play Card Y's action" inside PAY_TO_PLAY_CARD_ACTION
                if (payload.shouldLog) {
                    draft.log.push(`${corporationName} played ${playedCard.name}'s action.`);
                }
                break;
            }
            case ANNOUNCE_READY_TO_START_ROUND: {
                player.action = 1;
                player.buyCards = false;
                handleEnterActiveRound(draft);
                break;
            }
            case SKIP_ACTION: {
                const previous = player.action;
                player.action = 1;
                // Did the player just skip on their first action?
                // Or is this greenery phase?
                // If so, they're out for the rest of the round.
                if (previous === 1 || common.gameStage === GameStage.GREENERY_PLACEMENT) {
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
                            for (const player of playersWhoCanPlaceGreenery) {
                                player.action = 1;
                            }
                            if (playersWhoCanPlaceGreenery.length > 0) {
                                draft.log.push('Greenery Placement');
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
                            common.gameStage = GameStage.BUY_OR_DISCARD;

                            for (const player of draft.players) {
                                player.possibleCards.push(...handleDrawCards(4));
                                const bonus = draft.common.deck.find(
                                    card => card.name === bonusName
                                );
                                player.buyCards = true;
                                if (bonus) {
                                    player.possibleCards.push(bonus);
                                    draft.common.deck = draft.common.deck.filter(
                                        card => card !== bonus
                                    );
                                }
                            }
                        }
                    } else {
                        handleChangeCurrentPlayer(state, draft);
                    }
                } else {
                    draft.log.push(`${corporationName} skipped their 2nd action`);
                    handleChangeCurrentPlayer(state, draft);
                }
                break;
            }

            case COMPLETE_ACTION:
                player.pendingResourceActionDetails = undefined;
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
                break;
            case SET_IS_SYNCING:
                draft.syncing = true;
                break;
            default:
                return draft;
        }
    });
};

export const useTypedSelector: TypedUseSelectorHook<GameState> = useSelector;
