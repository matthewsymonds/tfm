import {useSelector, TypedUseSelectorHook} from 'react-redux';
import produce from 'immer';

import {GameStage} from './constants/game';
import {INITIAL_BOARD_STATE, TileType, Board, Parameter} from './constants/board';
import {
    SET_CORPORATION,
    SET_CARDS,
    GO_TO_GAME_STAGE,
    PAY_FOR_CARD,
    CHANGE_RESOURCE,
    GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS,
    CONFIRM_CORPORATION_AND_CARDS
} from './actions';
import {CardConfig, Deck, CardType, Tag} from './constants/card-types';
import {Resource} from './constants/resource';
import {cardConfigs} from './constants/cards';
import {Card} from './models/card';

const cards = cardConfigs.map(config => new Card(config));

function sampleCards(cards: Card[], num: number) {
    const result = [];
    for (let i = 0; i < num; i++) {
        result.push(cards.shift());
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
        [Resource.HEAT]: 0
    };
}

const possibleCards = cards.filter(
    card => card.deck === Deck.BASIC || card.deck === Deck.CORPORATE
);

shuffle(possibleCards);

const allCorporations = possibleCards.filter(card => card.type === CardType.CORPORATION);

const deck = possibleCards.filter(card => card.type !== CardType.CORPORATION);
const possibleCorporations = sampleCards(allCorporations, 2);
const startingCards = sampleCards(deck, 10);

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
    loggedInPlayerIndex: number;
    players: Array<PlayerState>;
    common: {
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
    playerIndex: number;
    corporation: null | Card;
    startingCards: null | Card[];
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

const INITIAL_STATE: GameState = {
    loggedInPlayerIndex: 0,
    common: {
        gameStage: GameStage.CORPORATION_SELECTION,
        generation: 0,
        round: 0,
        turn: 0,
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
            playerIndex: 0,
            corporation: null,
            // TODO: should this be replaced with "possibleCards", and recycled between rounds?
            startingCards,
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

export const reducer = (state = INITIAL_STATE, action) => {
    const {payload} = action;
    return produce(state, draft => {
        switch (action.type) {
            case SET_CORPORATION:
                draft.players[payload.playerId].corporation = payload.corporation;
                break;
            case SET_CARDS:
                draft.players[payload.playerId].cards = action.payload.cards;
                break;
            case CONFIRM_CORPORATION_AND_CARDS:
                const playerState = draft.players[payload.playerId];
                if (!playerState.corporation) {
                    throw new Error('You must select a corporation');
                }
                playerState.possibleCorporations = null; // no longer relevant
                playerState.startingCards = null; // no longer relevant
                const {corporation} = playerState;
                for (const resource in corporation.gainResource) {
                    playerState.resources[resource] += corporation.gainResource[resource];
                }
                for (const resource in corporation.removeResources) {
                    playerState.resources[resource] -= corporation.removeResources[resource];
                }
                for (const production in corporation.increaseProduction) {
                    playerState.productions[production] +=
                        corporation.increaseProduction[production];
                }
                for (const production in corporation.decreaseProduction) {
                    playerState.productions[production] -=
                        corporation.decreaseProduction[production];
                }
                playerState.playedCards.push(playerState.corporation);
            case GO_TO_GAME_STAGE:
                draft.common.gameStage = action.payload;
                break;
            // could this be generalized to GAIN_ONE_RESOURCE_PER_CONDITION(resource, condition)
            // case GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS:
            //     const citiesOnMars = getCitiesOnMars(state.board);
            //     draft.resources[Resource.MEGACREDIT] += citiesOnMars;
            // case CHANGE_RESOURCE:
            //     draft.resources[action.payload.resource] +=
            //         action.payload.amount;
            case PAY_FOR_CARD:
                draft.transaction.isPending = true;
                draft.transaction.pendingPlayers = [payload.playerId];
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
