import produce from 'immer';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import {
    APPLY_DISCOUNTS,
    ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET,
    ASK_USER_TO_GAIN_RESOURCE,
    ASK_USER_TO_PLACE_TILE,
    ASK_USER_TO_REMOVE_RESOURCE,
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
    START_OVER,
    START_ROUND,
    REVEAL_AND_DISCARD_TOP_CARDS,
    DISCARD_REVEALED_CARDS,
    BUY_SELECTED_CARDS,
    GAIN_SELECTED_CARDS,
    ASK_USER_TO_LOOK_AT_CARDS,
    REMOVE_STORABLE_RESOURCE,
    ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS,
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
import {isStorableResource, Resource, ResourceLocationType} from './constants/resource';
import {StandardProjectType} from './constants/standard-project';
import {Tag} from './constants/tag';
import {convertAmountToNumber, getDiscountedCardCost} from './context/app-context';
import {Card, cards} from './models/card';
import {BILLY_TEST} from './test-states/billy-test';

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
    loggedInPlayerIndex: number;
    players: Array<PlayerState>;
    common: CommonState;
    transaction: {
        isPending: boolean;
        pendingPlayers: Array<PlayerId>;
    };
};

export type PlayerState = {
    index: number;
    action: number; // 1 or 2.
    terraformRating: number;
    pendingTilePlacement?: TilePlacement;
    pendingResourceReduction?: {
        resource: Resource;
        amount: Amount;
    };

    // ====== pendingResourceGain ======
    // First: ask user to select which resource type (e.g. "3 plants or 2 animals")
    pendingResourceGain?: {
        gainResourceOption: PropertyCounter<Resource>;
        gainResourceTargetType?: ResourceLocationType;
        card?: Card; // for "add a resource to this card" card actions
    };
    // Second (only sometimes): after user picks a storable resource, ask them to pick the target location
    pendingResourceGainTargetConfirmation?: {
        gainResource: PropertyCounter<Resource>;
        gainResourceTargetType: ResourceLocationType;
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

function sampleCards(cards: Card[], num: number) {
    const result: Card[] = [];
    for (let i = 0; i < num; i++) {
        const card = cards.shift();
        if (!card) {
            throw new Error('Out of cards to sample');
        }
        result.push(card);
    }
    return result;
}

function shuffle(array: Card[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initialResources() {
    return {
        [Resource.MEGACREDIT]: 0,
        [Resource.STEEL]: 0,
        [Resource.TITANIUM]: 0,
        [Resource.PLANT]: 0,
        [Resource.ENERGY]: 0,
        [Resource.HEAT]: 0,
    };
}

export function getInitialState(): GameState {
    const possibleCards = cards.filter(
        card => card.deck === Deck.BASIC || card.deck === Deck.CORPORATE
    );

    shuffle(possibleCards);

    const allCorporations = possibleCards.filter(card => card.type === CardType.CORPORATION);

    const deck = possibleCards.filter(card => card.type !== CardType.CORPORATION);
    const possibleCorporations = sampleCards(allCorporations, 2);

    return {
        queuePaused: false,
        loggedInPlayerIndex: 0,
        common: {
            playingPlayers: [],
            discardPile: [],
            revealedCards: [],
            gameStage: GameStage.CORPORATION_SELECTION,
            generation: 1,
            turn: 1,
            deck,
            parameters: MIN_PARAMETERS,
            board: INITIAL_BOARD_STATE,
            currentPlayerIndex: 0,
            firstPlayerIndex: 0,
            claimedMilestones: [],
            fundedAwards: [],
        },
        players: [
            {
                action: 1,
                index: 0,
                terraformRating: 20,
                corporation: null,
                possibleCards: [],
                selectedCards: [],
                numCardsToTake: null,
                possibleCorporations,
                cards: [],
                playedCards: [],
                resources: initialResources(),
                productions: initialResources(),
                parameterRequirementAdjustments: {
                    [Parameter.OCEAN]: 0,
                    [Parameter.OXYGEN]: 0,
                    [Parameter.TEMPERATURE]: 0,
                    [Parameter.VENUS]: 0,
                },
                temporaryParameterRequirementAdjustments: {
                    [Parameter.OCEAN]: 0,
                    [Parameter.OXYGEN]: 0,
                    [Parameter.TEMPERATURE]: 0,
                    [Parameter.VENUS]: 0,
                },
                exchangeRates: {
                    [Resource.STEEL]: 2,
                    [Resource.TITANIUM]: 3,
                },
                discounts: {
                    card: 0,
                    tags: {
                        [Tag.SPACE]: 0,
                        [Tag.VENUS]: 0,
                        [Tag.BUILDING]: 0,
                        [Tag.SCIENCE]: 0,
                        [Tag.EARTH]: 0,
                        [Tag.POWER]: 0,
                    },
                    cards: {
                        [Tag.SPACE]: 0,
                        [Tag.EARTH]: 0,
                    },
                    standardProjects: 0,
                    standardProjectPowerPlant: 0,
                    nextCardThisGeneration: 0,
                    trade: 0,
                },
            },
        ],
        transaction: {
            isPending: false,
            pendingPlayers: [],
        },
    };
}

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

const INITIAL_STATE: GameState = getInitialState();
// const INITIAL_STATE: GameState = BILLY_TEST; // qwerty

// Add Card Name here.
const bonusName = 'Special Design';

export const reducer = (state = INITIAL_STATE, action) => {
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
            player.pendingResourceGain = undefined;
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
            case START_OVER:
                return getInitialState();
            case SET_GAME:
                return payload.gameState;
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
                if (player.pendingResourceReduction) {
                    player.pendingResourceReduction = undefined;
                    draft.pendingVariableAmount = payload.cards.length;
                }
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
            case REMOVE_RESOURCE:
                player.resources[payload.resource] -= convertAmountToNumber(
                    payload.amount,
                    state,
                    mostRecentlyPlayedCard
                );
                break;
            case REMOVE_STORABLE_RESOURCE: {
                const {card, resource, amount} = payload;
                const draftCard = player.playedCards.find(c => c.name === card.name);
                if (!draftCard) {
                    throw new Error('Card should exist to remove storable resources from');
                } else if (draftCard.storedResourceType !== resource) {
                    throw new Error('Card does not store that type of resource');
                } else if (
                    draftCard.storedResourceAmount === undefined ||
                    draftCard.storedResourceAmount < amount
                ) {
                    throw new Error('Card does not contain enough of that resource to remove');
                }
                draftCard.storedResourceAmount -= convertAmountToNumber(amount, state);
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
                player.pendingResourceGainTargetConfirmation = undefined;
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
                player.temporaryParameterRequirementAdjustments = {
                    [Parameter.OCEAN]: 0,
                    [Parameter.OXYGEN]: 0,
                    [Parameter.TEMPERATURE]: 0,
                    [Parameter.VENUS]: 0,
                };
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
                player.pendingResourceGain = {
                    gainResourceOption: payload.action.gainResourceOption,
                    gainResourceTargetType: payload.action.gainResourceTargetType,
                };
                break;
            case ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET:
                player.pendingResourceGain = undefined;
                player.pendingResourceGainTargetConfirmation = {
                    gainResource: payload.gainResource,
                    gainResourceTargetType: payload.gainResourceTargetType,
                    card: payload.card,
                };
                break;
            case ASK_USER_TO_REMOVE_RESOURCE:
                player.pendingResourceReduction = {
                    resource: payload.resource,
                    amount: payload.amount,
                };
                break;
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
            case START_ROUND:
                draft.common.playingPlayers = state.players.map(player => player.index);
                const cards = draft.players.flatMap(player => player.playedCards);
                for (const card of cards) {
                    card.usedActionThisRound = false;
                }
                break;
            case SKIP_ACTION:
                const previous = player.action;
                player.action = 1;
                // Did the player just skip on their first action?
                // If so, they're out for the rest of the round.
                if (previous === 1) {
                    common.playingPlayers = common.playingPlayers.filter(
                        index => index !== common.currentPlayerIndex
                    );
                    // After removing the current player, is anyone else playing?
                    if (common.playingPlayers.length === 0) {
                        player.temporaryParameterRequirementAdjustments = {
                            [Parameter.OCEAN]: 0,
                            [Parameter.OXYGEN]: 0,
                            [Parameter.TEMPERATURE]: 0,
                            [Parameter.VENUS]: 0,
                        };
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
