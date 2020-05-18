import produce from 'immer';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {
    APPLY_DISCOUNTS,
    ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET,
    ASK_USER_TO_GAIN_RESOURCE,
    ASK_USER_TO_PLACE_TILE,
    CLAIM_MILESTONE,
    COMPLETE_ACTION,
    DECREASE_PRODUCTION,
    DISCARD_CARDS,
    DRAW_CARDS,
    DRAW_POSSIBLE_CARDS,
    FUND_AWARD,
    GAIN_RESOURCE,
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
    SET_CARDS,
    SET_CORPORATION,
    SET_GAME,
    SET_SELECTED_CARDS,
    SKIP_ACTION,
    ANNOUNCE_READY_TO_START_ROUND,
    REVEAL_AND_DISCARD_TOP_CARDS,
    DISCARD_REVEALED_CARDS,
    BUY_SELECTED_CARDS,
    GAIN_SELECTED_CARDS,
    ASK_USER_TO_LOOK_AT_CARDS,
    REMOVE_STORABLE_RESOURCE,
    ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS,
    ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
} from './actions';
import {Amount} from './constants/action';
import {
    Award,
    Board,
    Cell,
    INITIAL_BOARD_STATE,
    Milestone,
    Parameter,
    Tile,
    TilePlacement,
    TileType,
} from './constants/board';
import {CardType, Deck} from './constants/card-types';
import {Discounts} from './constants/discounts';
import {GameStage, MAX_PARAMETERS, MIN_PARAMETERS, PARAMETER_STEPS} from './constants/game';
import {PropertyCounter} from './constants/property-counter';
import {
    isStorableResource,
    Resource,
    ResourceLocationType,
    USER_CHOICE_LOCATION_TYPES,
    ResourceAndAmount,
} from './constants/resource';
import {StandardProjectType} from './constants/standard-project';
import {Tag} from './constants/tag';
import {convertAmountToNumber, getDiscountedCardCost} from './context/app-context';
import {Card, cards} from './models/card';
import {BILLY_TEST} from './test-states/billy-test';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {VariableAmount} from './constants/variable-amount';

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
    pendingVariableAmount?: number;
    pendingResourceSource?: string | number; // either card name or player index
    pendingResourceActionDetails?: {
        actionType: 'removeResource' | 'gainResource' | 'stealResource';
        resourceAndAmounts: Array<ResourceAndAmount>;
        card: Card;
        locationType?: ResourceLocationType;
    };

    // ====== pendingResourceOption ======
    // First: ask user to select which resource type (e.g. "3 plants or 2 animals")
    pendingResourceOption?: {
        resourceOption: PropertyCounter<Resource>;
        targetType?: ResourceLocationType;
        card?: Card; // for "add a resource to this card" card actions
    };
    // Second (only sometimes): after user picks a storable resource, ask them to pick the target location
    pendingResourceTargetConfirmation?: {
        resource: Resource;
        amount: number;
        targetType: ResourceLocationType;
        card?: Card; // for "add a resource to this card" card actions
    };

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

function isEndOfGame(draft: RootState) {
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
    const newPlayerPlaceInTurnOrder = placeInTurnOrder + (1 % draft.common.playingPlayers.length);
    draft.common.currentPlayerIndex = draft.common.playingPlayers[newPlayerPlaceInTurnOrder];
    if (newPlayerPlaceInTurnOrder === 0) {
        draft.common.turn++;
    }
}

// Add Card Name here.
const bonusName = 'Special Design';

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
            player.pendingResourceOption = undefined;
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
                draft.common.discardPile.push(...payload.cards);
                player.cards = player.cards.filter(
                    playerCard => !payload.cards.map(card => card.name).includes(playerCard.name)
                );
                // if (player.pendingResourceReduction) {
                //     player.pendingResourceReduction = undefined;
                //     draft.pendingVariableAmount = payload.cards.length;
                // }
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
                const {resource, amount, location} = payload;

                // FINALIZE AMOUNT
                let numberAmount: number;
                if (amount === VariableAmount.USER_CHOICE) {
                    if (!player.pendingVariableAmount) {
                        throw new Error('Pending variable amount not found in state');
                    }
                    numberAmount = player.pendingVariableAmount;
                } else if (typeof amount !== 'number') {
                    throw new Error('Remove resource amount should be a number or USER_CHOICE');
                } else {
                    numberAmount = amount;
                }

                // FINALIZE LOCATION (PLAYER)
                let targetPlayer: PlayerState;
                if (!location) {
                    targetPlayer = player;
                } else if (USER_CHOICE_LOCATION_TYPES.includes(location)) {
                    // remove from selected player
                    if (typeof player.pendingResourceSource !== 'number') {
                        throw new Error('Pending source player not found in state');
                    }
                    targetPlayer = draft.players[player.pendingResourceSource];
                    if (!targetPlayer) {
                        throw new Error('Could not find player to remove resources from');
                    }
                } else {
                    throw new Error('Invalid player source location when removing resource');
                }

                // REMOVE NUMBER AMOUNT FROM TARGET PLAYER
                player.resources[resource] -= numberAmount;
                break;
            }
            case REMOVE_STORABLE_RESOURCE: {
                const {card, resource, amount, location} = payload;

                // FINALIZE AMOUNT
                let numberAmount: number;
                if (amount === VariableAmount.USER_CHOICE) {
                    if (!player.pendingVariableAmount) {
                        throw new Error('Pending variable amount not found in state');
                    }
                    numberAmount = player.pendingVariableAmount;
                } else if (typeof amount !== 'number') {
                    throw new Error('Remove resource amount should be a number or USER_CHOICE');
                } else {
                    numberAmount = amount;
                }

                // FINALIZE LOCATION (CARD)
                let targetCard: Card;
                if (USER_CHOICE_LOCATION_TYPES.includes(location)) {
                    if (typeof player.pendingResourceSource !== 'string') {
                        throw new Error('Pending source card not found in state');
                    }
                    const allCards = draft.players.flatMap(p => p.playedCards);
                    targetCard = allCards.find(card => card.name === player.pendingResourceSource)!;
                    if (!targetCard) {
                        throw new Error('Could not find card to remove storable resources from');
                    }
                } else if (location === ResourceLocationType.THIS_CARD) {
                    if (!card) {
                        throw new Error(
                            'Could not find this card to remove storable resources from'
                        );
                    }
                    targetCard = card;
                } else {
                    throw new Error('Could find target location to remove resources from');
                }

                // REMOVE NUMBER AMOUNT FROM TARGET CARD
                if (targetCard.storedResourceType !== resource) {
                    throw new Error('Card does not store that type of resource');
                } else if (targetCard.storedResourceAmount === undefined) {
                    throw new Error('Card does not contain enough of that resource to remove');
                }
                targetCard.storedResourceAmount -= numberAmount;
                break;
            }
            case GAIN_RESOURCE:
                handleGainResource(payload.resource, payload.amount);
                break;
            case GAIN_STORABLE_RESOURCE: {
                const {card, amount} = payload;
                const draftCard = player.playedCards.find(c => c.name === card.name);
                if (!draftCard) {
                    throw new Error('Card should exist to gain storable resources to');
                }
                draftCard.storedResourceAmount =
                    (draftCard.storedResourceAmount || 0) + convertAmountToNumber(amount, state);
                player.pendingResourceTargetConfirmation = undefined;
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
                player.pendingTilePlacement = payload.tilePlacement;
                break;
            case ASK_USER_TO_GAIN_RESOURCE:
                player.pendingResourceOption = {
                    resourceOption: payload.action.gainResourceOption,
                    targetType: payload.action.gainResourceTargetType,
                    card: payload.card,
                };
                break;
            case ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET:
                player.pendingResourceOption = undefined;
                player.pendingResourceTargetConfirmation = {
                    resource: payload.resource,
                    targetType: payload.targetType,
                    amount: payload.amount,
                    card: payload.card,
                };
                break;
            case ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS: {
                const {actionType, resourceAndAmounts, card, playerIndex, locationType} = payload;
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
                break;
            case INCREASE_PARAMETER:
                const {parameter, amount} = payload;
                handleParameterIncrease(parameter, amount);
                break;
            case APPLY_DISCOUNTS:
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
            case GO_TO_GAME_STAGE:
                draft.common.gameStage = action.payload;
                break;
            case MARK_CARD_ACTION_AS_PLAYED:
                const playedCard = player.playedCards.find(card => card.name === payload.card.name);
                playedCard!.usedActionThisRound = true;
                break;
            case ANNOUNCE_READY_TO_START_ROUND:
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
            case SKIP_ACTION:
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
                        player.temporaryParameterRequirementAdjustments = zeroParameterRequirementAdjustments();
                        handleProduction(draft);
                        const endOfGame = isEndOfGame(draft);
                        if (endOfGame) {
                            common.gameStage = GameStage.END_OF_GAME;
                        } else {
                            common.firstPlayerIndex =
                                (common.firstPlayerIndex + 1) % draft.players.length;
                            for (let i = common.firstPlayerIndex; i < draft.players.length; i++) {
                                common.playingPlayers.push(i);
                            }
                            for (let i = 0; i < common.firstPlayerIndex; i++) {
                                common.playingPlayers.push(i);
                            }
                            common.generation++;
                            common.gameStage = GameStage.BUY_OR_DISCARD;
                        }
                    }
                } else {
                    handleChangeCurrentPlayer(state, draft);
                }
                break;

            case COMPLETE_ACTION:
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

function getCitiesOnMars(state): number {
    return state.board.reduce((acc, row) => {
        const citiesInRow = row.reduce((rowAcc, cell) => {
            if (!cell.onMars) return rowAcc;
            if (!cell.tile) return rowAcc;

            return cell.tile.type == TileType.CITY ? rowAcc + 1 : rowAcc;
        }, 0);

        return citiesInRow + acc;
    }, 0);
}

export type RootState = ReturnType<typeof reducer>;
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
