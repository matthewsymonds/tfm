import produce from 'immer';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {
    ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS,
    ANNOUNCE_READY_TO_START_ROUND,
    APPLY_DISCOUNTS,
    ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
    ASK_USER_TO_DISCARD_CARDS,
    ASK_USER_TO_LOOK_AT_CARDS,
    ASK_USER_TO_PLACE_TILE,
    BUY_SELECTED_CARDS,
    CLAIM_MILESTONE,
    COMPLETE_ACTION,
    DECREASE_PRODUCTION,
    DISCARD_CARDS,
    DISCARD_REVEALED_CARDS,
    DRAW_CARDS,
    DRAW_POSSIBLE_CARDS,
    FUND_AWARD,
    GAIN_RESOURCE,
    GAIN_SELECTED_CARDS,
    GAIN_STORABLE_RESOURCE,
    GO_TO_GAME_STAGE,
    INCREASE_PARAMETER,
    INCREASE_PRODUCTION,
    MARK_CARD_ACTION_AS_PLAYED,
    MOVE_CARD_FROM_HAND_TO_PLAY_AREA,
    PAY_FOR_CARDS,
    PAY_TO_PLAY_CARD,
    PAY_TO_PLAY_STANDARD_PROJECT,
    PLACE_TILE,
    REMOVE_RESOURCE,
    REMOVE_STORABLE_RESOURCE,
    REVEAL_AND_DISCARD_TOP_CARDS,
    SET_CARDS,
    SET_CORPORATION,
    SET_GAME,
    SET_SELECTED_CARDS,
    SKIP_ACTION,
    STEAL_RESOURCE,
    STEAL_STORABLE_RESOURCE,
} from './actions';
import {Amount} from './constants/action';
import {
    Award,
    Board,
    Cell,
    Milestone,
    Parameter,
    Tile,
    TilePlacement,
    TileType,
} from './constants/board';
import {CONVERSIONS} from './constants/conversion';
import {Discounts} from './constants/discounts';
import {GameStage, MAX_PARAMETERS, PARAMETER_STEPS} from './constants/game';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {PropertyCounter} from './constants/property-counter';
import {
    isStorableResource,
    Resource,
    ResourceAndAmount,
    ResourceLocationType,
} from './constants/resource';
import {StandardProjectType} from './constants/standard-project';
import {convertAmountToNumber, getDiscountedCardCost} from './context/app-context';
import {Card} from './models/card';
import {getAdjacentCellsForCell} from './selectors/board';

export type Resources = {
    [Resource.MEGACREDIT]: number;
    [Resource.STEEL]: number;
    [Resource.TITANIUM]: number;
    [Resource.PLANT]: number;
    [Resource.ENERGY]: number;
    [Resource.HEAT]: number;
};

type PlayerId = number;

export type CommonState = {
    // List of indices of playing players.
    playingPlayers: number[];
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
    board: Board;
};

export type GameState = {
    queuePaused: boolean;
    pendingVariableAmount?: number;
    players: Array<PlayerState>;
    common: CommonState;
    transaction: {
        isPending: boolean;
        pendingPlayers: Array<PlayerId>;
    };
};

export type PlayerState = {
    index: number;
    username: string;
    action: number; // 1 or 2.
    terraformRating: number;
    pendingTilePlacement?: TilePlacement;
    pendingResourceSource?: string | number; // either card name or player index
    pendingResourceActionDetails?: {
        actionType: 'removeResource' | 'gainResource' | 'stealResource'|'decreaseProduction';
        resourceAndAmounts: Array<ResourceAndAmount>;
        card: Card;
        locationType?: ResourceLocationType;
    };
    // e.g. Sell patents
    pendingDiscard?: Amount;
    // e.g. Insulation
    pendingProductionDecrease?: Resource;

    // In an action that makes you look at cards, specifies how many you can take or buy.
    numCardsToTake: number | null;
    // Is the player considering buying the cards they're looking at?
    buyCards?: boolean | null;
    corporation: null | Card;
    possibleCards: Card[];
    selectedCards: Card[];
    possibleCorporations: null | Card[];
    cards: Card[];
    playedCards: Card[];
    resources: Resources;
    productions: Resources;
    exchangeRates: {
        [Resource.STEEL]: number;
        [Resource.TITANIUM]: number;
    };
    discounts: Discounts;

    parameterRequirementAdjustments: PropertyCounter<Parameter>;
    temporaryParameterRequirementAdjustments: PropertyCounter<Parameter>;
};

function getParameterForTile(tile: Tile): Parameter | undefined {
    if (tile.type === TileType.OCEAN) {
        return Parameter.OCEAN;
    }

    if (tile.type === TileType.GREENERY) {
        return Parameter.OXYGEN;
    }

    return undefined;
}

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

function handleProduction(draft: RootState) {
    for (const player of draft.players) {
        player.resources[Resource.MEGACREDIT] += player.terraformRating;
        player.resources[Resource.HEAT] += player.resources[Resource.ENERGY];
        player.resources[Resource.ENERGY] = 0;
        for (const production in player.productions) {
            player.resources[production] += player.productions[production];
        }
    }
}

function greeneryPlacementTriggered(draft: RootState) {
    for (const parameter in draft.common.parameters) {
        if (parameter === Parameter.VENUS) continue;

        if (MAX_PARAMETERS[parameter] !== draft.common.parameters[parameter]) {
            return false;
        }
    }

    return true;
}

function handleChangeCurrentPlayer(state: RootState, draft: RootState) {
    const oldPlayerIndex = state.common.currentPlayerIndex;
    const placeInTurnOrder = state.common.playingPlayers.indexOf(oldPlayerIndex);
    const newPlayerPlaceInTurnOrder = (placeInTurnOrder + 1) % state.common.playingPlayers.length;
    draft.common.currentPlayerIndex = state.common.playingPlayers[newPlayerPlaceInTurnOrder];
    if (newPlayerPlaceInTurnOrder === 0) {
        draft.common.turn++;
    }
}

// Add Card Name here.
const bonusName = 'Toll Station';

export const reducer = (state: GameState | null = null, action) => {
    if (action.type === SET_GAME) {
        return action.payload.gameState;
    }
    // We want to initially set the state async, from the server.
    // Until SET_GAME is called, every other action is a noop.
    if (state === null) return null;
    const {payload} = action;
    return produce(state, draft => {
        const player = draft.players[payload?.playerIndex];
        const {common} = draft;
        function handleParameterIncrease(parameter: Parameter, amount: number) {
            if (parameter === Parameter.TERRAFORM_RATING) {
                player.terraformRating += amount;
                return;
            }
            const scale = PARAMETER_STEPS[parameter];
            const increase = amount * scale;
            const startingAmount = draft.common.parameters[parameter];
            const newAmount = Math.min(MAX_PARAMETERS[parameter], startingAmount + increase);
            const userTerraformRatingChange = (newAmount - startingAmount) / scale;
            draft.common.parameters[parameter] = newAmount;
            player.terraformRating += userTerraformRatingChange;
        }

        const mostRecentlyPlayedCard = player?.playedCards[player.playedCards.length - 1];

        function handleGainResource(resource: Resource, amount: Amount) {
            const numberAmount = convertAmountToNumber(amount, state, mostRecentlyPlayedCard);

            if (resource === Resource.CARD) {
                // Sometimes we list cards as a resource.
                // handle as a draw action.
                player.cards.push(...draft.common.deck.splice(0, numberAmount));
                return;
            }
            if (isStorableResource(resource)) {
                return;
            }
            player.resources[resource] += numberAmount;
        }
        switch (action.type) {
            case SET_CORPORATION:
                player.corporation = payload.corporation;
                break;
            case PAY_FOR_CARDS:
                player.resources[Resource.MEGACREDIT] -= action.payload.cards.length * 3;
                player.possibleCards = [];
                break;
            case REVEAL_AND_DISCARD_TOP_CARDS:
                // Step 1. Reveal the cards to the player so they can see them.
                const numCardsToReveal = convertAmountToNumber(payload.amount, state);
                draft.common.revealedCards = draft.common.deck.splice(0, numCardsToReveal);
                break;
            case DISCARD_REVEALED_CARDS:
                // Step 2. Discard the revealed cards.
                draft.common.discardPile.push(...draft.common.revealedCards);
                draft.common.revealedCards = [];
                break;
            case ASK_USER_TO_DISCARD_CARDS:
                player.pendingDiscard = payload.amount;
                break;
            case ASK_USER_TO_LOOK_AT_CARDS:
                player.possibleCards = draft.common.deck.splice(0, payload.amount);
                player.numCardsToTake = payload.numCardsToTake || null;
                player.buyCards = payload.buyCards;
                break;
            case SET_CARDS:
                player.cards = action.payload.cards;
                break;
            case BUY_SELECTED_CARDS:
                player.cards = [...player.cards, ...player.selectedCards];
                player.resources[Resource.MEGACREDIT] -= player.selectedCards.length * 3;
                player.selectedCards = [];
                player.possibleCards = [];
                player.numCardsToTake = null;
                payload.buyCards = null;
                break;
            case GAIN_SELECTED_CARDS:
                player.cards = [...player.cards, ...player.selectedCards];
                player.selectedCards = [];
                player.possibleCards = [];
                player.numCardsToTake = null;
                payload.buyCards = null;
                break;
            case SET_SELECTED_CARDS:
                player.selectedCards = action.payload.cards;
                break;
            case DISCARD_CARDS:
                draft.pendingVariableAmount = payload.cards.length;
                player.pendingDiscard = undefined;
                draft.common.discardPile.push(...payload.cards);
                player.cards = player.cards.filter(
                    playerCard => !payload.cards.map(card => card.name).includes(playerCard.name)
                );
                break;
            case DRAW_CARDS:
                player.cards.push(...draft.common.deck.splice(0, payload.numCards));
                break;
            case DRAW_POSSIBLE_CARDS:
                player.possibleCards.push(...draft.common.deck.splice(0, payload.numCards));
                const bonus = draft.common.deck.find(card => card.name === bonusName);
                if (bonus) {
                    player.possibleCards.push(bonus);
                    draft.common.deck = draft.common.deck.filter(card => card !== bonus);
                }
                break;
            case DECREASE_PRODUCTION:
                draft.pendingVariableAmount = payload.amount;

                player.productions[payload.resource] -= convertAmountToNumber(
                    payload.amount,
                    state,
                    mostRecentlyPlayedCard
                );
                break;
            case INCREASE_PRODUCTION:
                player.productions[payload.resource] += convertAmountToNumber(
                    payload.amount,
                    state,
                    mostRecentlyPlayedCard
                );
                break;
            case REMOVE_RESOURCE: {
                player.pendingResourceActionDetails = undefined;
                const {resource, amount, sourcePlayerIndex} = payload;

                const sourcePlayer = draft.players[sourcePlayerIndex];
                if (amount > sourcePlayer.resources[resource]) {
                    throw new Error('Trying to take too many resources');
                }
                draft.pendingVariableAmount = amount;

                sourcePlayer.resources[resource] -= amount;
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
                player[resource] += amount;
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
                break;
            }
            case GAIN_RESOURCE:
                handleGainResource(payload.resource, payload.amount);
                break;
            case GAIN_STORABLE_RESOURCE: {
                player.pendingResourceActionDetails = undefined;
                const {card, amount} = payload;
                const draftCard = player.playedCards.find(c => c.name === card.name);
                if (!draftCard) {
                    throw new Error('Card should exist to gain storable resources to');
                }
                draftCard.storedResourceAmount =
                    (draftCard.storedResourceAmount || 0) + convertAmountToNumber(amount, state);
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
                break;
            }
            case PAY_TO_PLAY_STANDARD_PROJECT: {
                let cost = payload.standardProjectAction.cost - player.discounts.standardProjects;
                if (payload.standardProjectAction.type === StandardProjectType.POWER_PLANT) {
                    cost -= player.discounts.standardProjectPowerPlant;
                }
                player.resources[Resource.MEGACREDIT] -= cost;
                break;
            }
            case CLAIM_MILESTONE:
                player.resources[Resource.MEGACREDIT] -= 8;
                draft.common.claimedMilestones.push({
                    claimedByPlayerIndex: player.index,
                    milestone: payload.milestone,
                });
                break;
            case FUND_AWARD:
                const cost = [8, 14, 20][draft.common.fundedAwards.length];
                player.resources[Resource.MEGACREDIT] -= cost;
                draft.common.fundedAwards.push({
                    fundedByPlayerIndex: player.index,
                    award: payload.award,
                });
                break;
            case MOVE_CARD_FROM_HAND_TO_PLAY_AREA:
                player.cards = player.cards.filter(c => c.name !== payload.card.name);
                player.playedCards.push(payload.card);
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
                // Oceans can run out. If they do, skip tile placement.
                player.pendingTilePlacement = payload.tilePlacement;
                break;
            case ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS: {
                const {actionType, resourceAndAmounts, card, locationType} = payload;
                player.pendingResourceActionDetails = {
                    actionType,
                    resourceAndAmounts,
                    card,
                    locationType,
                };

                break;
            }
            case PLACE_TILE:
                player.pendingTilePlacement = undefined;
                if (payload.tile?.type !== TileType.OCEAN) {
                    payload.tile.ownerPlayerIndex = player.index;
                }
                const matchingCell = draft.common.board.flat().find(cell => {
                    const coords = cell.coords || [];
                    return (
                        coords[0] === payload.cell.coords[0] && coords[1] === payload.cell.coords[1]
                    );
                });
                matchingCell!.tile = payload.tile;
                const parameterFromTile = getParameterForTile(payload.tile);
                if (parameterFromTile) {
                    handleParameterIncrease(parameterFromTile, 1);
                }

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
            case GO_TO_GAME_STAGE:
                draft.common.gameStage = action.payload;
                break;
            case MARK_CARD_ACTION_AS_PLAYED:
                const playedCard = player.playedCards.find(card => card.name === payload.card.name);
                playedCard!.usedActionThisRound = true;
                break;
            case ANNOUNCE_READY_TO_START_ROUND: {
                player.action = 1;
                if (draft.players.every(player => player.action === 1)) {
                    // Everyone's ready!
                    const cards = draft.players.flatMap(player => player.playedCards);
                    for (const card of cards) {
                        card.usedActionThisRound = false;
                    }

                    draft.common.gameStage = GameStage.ACTIVE_ROUND;
                }
                break;
            }
            case SKIP_ACTION: {
                const previous = player.action;
                player.action = 1;
                // Did the player just skip on their first action?
                // If so, they're out for the rest of the round.
                if (previous === 1) {
                    player.action = 0;
                    common.playingPlayers = common.playingPlayers.filter(
                        index => index !== common.currentPlayerIndex
                    );
                    // After removing the current player, is anyone else playing?
                    if (common.playingPlayers.length === 0) {
                        if (common.gameStage === GameStage.GREENERY_PLACEMENT) {
                            common.gameStage = GameStage.END_OF_GAME;
                            return;
                        }
                        player.temporaryParameterRequirementAdjustments = zeroParameterRequirementAdjustments();
                        handleProduction(draft);
                        const greeneryPlacement = greeneryPlacementTriggered(draft);
                        if (greeneryPlacement) {
                            common.playingPlayers = draft.players
                                .filter(
                                    p =>
                                        p.resources[Resource.PLANT] >=
                                        CONVERSIONS[Resource.PLANT].removeResource[Resource.PLANT]
                                )
                                .map(player => player.index);
                            if (common.playingPlayers.length > 0) {
                                common.gameStage = GameStage.GREENERY_PLACEMENT;
                            } else {
                                common.gameStage = GameStage.END_OF_GAME;
                            }
                        } else {
                            common.firstPlayerIndex =
                                (common.firstPlayerIndex + 1) % draft.players.length;
                            for (let i = common.firstPlayerIndex; i < draft.players.length; i++) {
                                common.playingPlayers.push(i);
                            }
                            for (let i = 0; i < common.firstPlayerIndex; i++) {
                                common.playingPlayers.push(i);
                            }
                            common.turn = 1;
                            common.generation++;
                            common.gameStage = GameStage.BUY_OR_DISCARD;
                        }
                    } else {
                        handleChangeCurrentPlayer(state, draft);
                    }
                } else {
                    handleChangeCurrentPlayer(state, draft);
                }
                break;
            }

            case COMPLETE_ACTION:
                player.pendingResourceActionDetails = undefined;
                player.action = (player.action % 2) + 1;
                // Did the player just complete their second action?
                if (player.action === 1) {
                    // It's the next player's turn
                    handleChangeCurrentPlayer(state, draft);
                }
                break;
            default:
                return draft;
        }
    });
};

export type RootState = ReturnType<typeof reducer>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
