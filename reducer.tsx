import {useSelector, TypedUseSelectorHook} from 'react-redux';
import produce from 'immer';

import {GameStage, MAX_PARAMETERS} from './constants/game';
import {Tag} from './constants/tag';
import {
    INITIAL_BOARD_STATE,
    TileType,
    Parameter,
    Board,
    TilePlacement,
    Tile,
    Cell
} from './constants/board';
import {
    SET_CORPORATION,
    GO_TO_GAME_STAGE,
    REVEAL_AND_DISCARD_TOP_CARD,
    DRAW_CARDS,
    PAY_FOR_CARDS,
    DECREASE_PRODUCTION,
    INCREASE_PRODUCTION,
    REMOVE_RESOURCE,
    GAIN_RESOURCE,
    MOVE_CARD_FROM_HAND_TO_PLAY_AREA,
    ASK_USER_TO_PLACE_TILE,
    ASK_USER_TO_REMOVE_RESOURCE,
    PAY_TO_PLAY_CARD,
    PLACE_TILE,
    INCREASE_PARAMETER,
    SET_CARDS,
    DISCARD_CARDS,
    drawCards,
    discardCards,
    START_OVER,
    PAY_TO_PLAY_STANDARD_PROJECT,
    MARK_CARD_ACTION_AS_PLAYED
} from './actions';
import {CardConfig, Deck, CardType} from './constants/card-types';
import {Resource} from './constants/resource';
import {cardConfigs} from './constants/cards';
import {Card} from './models/card';
import {Amount, Action, VariableAmount} from './constants/action';
import {StandardProjectType} from './constants/standard-project';

export type Resources = {
    [Resource.MEGACREDIT]: number;
    [Resource.STEEL]: number;
    [Resource.TITANIUM]: number;
    [Resource.PLANT]: number;
    [Resource.ENERGY]: number;
    [Resource.HEAT]: number;
};

type PlayerId = number;

export type GameState = {
    queuePaused: boolean;
    pendingVariableAmount?: number;
    loggedInPlayerIndex: number;
    players: Array<PlayerState>;
    common: {
        deck: Card[];
        discardPile: Card[];
        revealedCard?: Card;
        gameStage: GameStage;
        generation: number;
        round: number;
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
    transaction: {
        isPending: boolean;
        pendingPlayers: Array<PlayerId>;
    };
};

export type PlayerState = {
    index: number;
    terraformRating: number;
    pendingTilePlacement?: TilePlacement;
    pendingResourceReduction?: {
        resource: Resource;
        amount: Amount;
    };
    playerIndex: number;
    corporation: null | Card;
    possibleCards: Card[];
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
};

export type Discounts = {
    card: number;
    tags: {
        [Tag.SPACE]: number;
        [Tag.VENUS]: number;
        [Tag.BUILDING]: number;
        [Tag.SCIENCE]: number;
        [Tag.EARTH]: number;
        [Tag.POWER]: number;
    };
    cards: {
        [Tag.SPACE]: number;
        [Tag.EARTH]: number;
    };
    standardProjects: number;
    standardProjectPowerPlant: number;
    nextCardThisGeneration: number;
    trade: number;
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
    const ua = cards.filter(c => c.name === 'Urbanized Area')[0];
    ua && result.push(ua);
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
        [Resource.HEAT]: 0
    };
}

function getInitialState(): GameState {
    const cards = cardConfigs.map(config => new Card(config));

    const possibleCards = cards.filter(
        card => card.deck === Deck.BASIC || card.deck === Deck.CORPORATE
    );

    shuffle(possibleCards);

    const allCorporations = possibleCards.filter(card => card.type === CardType.CORPORATION);

    const deck = possibleCards.filter(card => card.type !== CardType.CORPORATION);
    const possibleCorporations = sampleCards(allCorporations, 2);
    const startingCards = sampleCards(deck, 10);

    return {
        queuePaused: false,
        loggedInPlayerIndex: 0,
        common: {
            discardPile: [],
            gameStage: GameStage.CORPORATION_SELECTION,
            generation: 0,
            round: 0,
            turn: 0,
            deck,
            parameters: {
                [Parameter.OCEAN]: 0,
                [Parameter.OXYGEN]: 0,
                [Parameter.TEMPERATURE]: -30,
                [Parameter.VENUS]: 0
            },
            board: INITIAL_BOARD_STATE,
            currentPlayerIndex: 0,
            firstPlayerIndex: 0
        },
        players: [
            {
                index: 0,
                terraformRating: 20,
                playerIndex: 0,
                corporation: null,
                possibleCards: startingCards,
                possibleCorporations,
                cards: [],
                playedCards: [],
                resources: initialResources(),
                productions: initialResources(),
                exchangeRates: {
                    [Resource.STEEL]: 2,
                    [Resource.TITANIUM]: 3
                },
                discounts: {
                    card: 0,
                    tags: {
                        [Tag.SPACE]: 0,
                        [Tag.VENUS]: 0,
                        [Tag.BUILDING]: 0,
                        [Tag.SCIENCE]: 0,
                        [Tag.EARTH]: 0,
                        [Tag.POWER]: 0
                    },
                    cards: {
                        [Tag.SPACE]: 0,
                        [Tag.EARTH]: 0
                    },
                    standardProjects: 0,
                    standardProjectPowerPlant: 0,
                    nextCardThisGeneration: 0,
                    trade: 0
                }
            }
        ],
        transaction: {
            isPending: false,
            pendingPlayers: []
        }
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
            amount: bonuses.filter(b => b === bonus).length
        };
    });
}

const INITIAL_STATE: GameState = getInitialState();

export const reducer = (state = INITIAL_STATE, action) => {
    const {payload} = action;
    return produce(state, draft => {
        const player = draft.players[payload?.playerIndex];
        function handleParameterIncrease(parameter: Parameter, amount: number) {
            if (parameter === Parameter.TERRAFORM_RATING) {
                player.terraformRating += amount;
                return;
            }
            const scale = 1 + Number(parameter === Parameter.TEMPERATURE);
            const increase = amount * scale;
            const startingAmount = draft.common.parameters[parameter];
            const newAmount = Math.min(MAX_PARAMETERS[parameter], startingAmount + increase);
            const userTerraformRatingChange = (newAmount - startingAmount) / scale;
            draft.common.parameters[parameter] = newAmount;
            player.terraformRating += userTerraformRatingChange;
        }

        function handleGainResource(resource: Resource, amount: Amount) {
            let numberAmount: number;
            if (typeof amount === 'number') {
                numberAmount = amount;
            } else {
                numberAmount = draft.pendingVariableAmount!;
            }
            if (resource === Resource.CARD) {
                // Sometimes we list cards as a resource.
                // handle as a draw action.
                player.cards.push(...draft.common.deck.splice(0, numberAmount));
                return;
            }
            const card = player.playedCards.find(card => card.storedResourceType === resource);

            if (card) {
                // TODO this is silly. Handle having a different target card.
                card.storedResourceAmount = (card.storedResourceAmount || 0) + numberAmount;
            } else {
                player.resources[resource] += numberAmount;
            }
        }
        switch (action.type) {
            case START_OVER:
                return getInitialState();
            case SET_CORPORATION:
                player.corporation = payload.corporation;
                break;
            case PAY_FOR_CARDS:
                player.resources[Resource.MEGACREDIT] -= action.payload.cards.length * 3;
                break;
            case REVEAL_AND_DISCARD_TOP_CARD:
                draft.common.revealedCard = draft.common.deck.pop();
                break;
            case SET_CARDS:
                player.cards = action.payload.cards;
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
            case DECREASE_PRODUCTION:
                player.productions[payload.resource] -= payload.amount;
                break;
            case INCREASE_PRODUCTION:
                player.productions[payload.resource] += payload.amount;
                break;
            case REMOVE_RESOURCE:
                player.resources[payload.resource] -= payload.amount;
                break;
            case GAIN_RESOURCE:
                handleGainResource(payload.resource, payload.amount);
                break;
            case PAY_TO_PLAY_CARD:
                player.resources[Resource.MEGACREDIT] -= payload.card.cost;
                break;
            case PAY_TO_PLAY_STANDARD_PROJECT:
                player.resources[Resource.MEGACREDIT] -= payload.standardProjectAction.cost;
                break;
            case MOVE_CARD_FROM_HAND_TO_PLAY_AREA:
                player.cards = player.cards.filter(c => c.name !== payload.card.name);
                player.playedCards.push(payload.card);
                break;
            case ASK_USER_TO_PLACE_TILE:
                player.pendingTilePlacement = payload.tilePlacement;
                break;
            case ASK_USER_TO_REMOVE_RESOURCE:
                player.pendingResourceReduction = {
                    resource: payload.resource,
                    amount: payload.amount
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
            case GO_TO_GAME_STAGE:
                draft.common.gameStage = action.payload;
                break;
            case MARK_CARD_ACTION_AS_PLAYED:
                const playedCard = player.playedCards.find(card => card.name === payload.card.name);
                playedCard!.usedActionThisRound = true;
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
