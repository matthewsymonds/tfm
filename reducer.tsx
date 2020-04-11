import {useSelector, TypedUseSelectorHook} from 'react-redux';
import produce from 'immer';

import {GameStage} from './constants/game';
import {INITIAL_BOARD_STATE, TileType, Board} from './constants/board';
import {
    SET_CORPORATION,
    SET_CARDS,
    GO_TO_GAME_STAGE,
    PAY_FOR_CARD,
    CHANGE_RESOURCE,
    GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS,
    CONFIRM_CORPORATION_AND_CARDS
} from './actions';
import {Card, Deck, CardType} from './constants/card-types';
import {Resource} from './constants/resource';
import {cards} from './constants/cards';

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
        [Resource.Megacredit]: 0,
        [Resource.Steel]: 0,
        [Resource.Titanium]: 0,
        [Resource.Plant]: 0,
        [Resource.Energy]: 0,
        [Resource.Heat]: 0
    };
}

const possibleCards = cards.filter(
    card => card.deck === Deck.Basic || card.deck === Deck.Corporate
);

shuffle(possibleCards);

const allCorporations = possibleCards.filter(
    card => card.type === CardType.Corporation
);

const deck = possibleCards.filter(card => card.type !== CardType.Corporation);
const possibleCorporations = sampleCards(allCorporations, 2);
const startingCards = sampleCards(deck, 10);

export type Resources = {
    [Resource.Megacredit]: number;
    [Resource.Steel]: number;
    [Resource.Titanium]: number;
    [Resource.Plant]: number;
    [Resource.Energy]: number;
    [Resource.Heat]: number;
};

type PlayerId = number;

export type GameState = {
    currentPlayerIndex: number,
    players: Array<PlayerState>,
    common: {
        gameStage: GameStage,
        generation: number,
        round: number,
        turn: number,
        temperature: number,
        ocean: number,
        oxygen: number,
        board: Board
    },
    transaction: {
        isPending: boolean,
        pendingPlayers: Array<PlayerId>
    }
}

type PlayerState = {
    id: PlayerId,
    corporation: null | Card,
    startingCards: null | Card[],
    possibleCorporations: null | Card[],
    cards: Card[],
    playedCards: Card[],
    resources: Resources,
    productions: Resources,
};


const INITIAL_STATE: GameState = {
    common: {
        gameStage: GameStage.CorporationSelection,
        generation: 0,
        round: 0,
        turn: 0,
        temperature: -30,
        ocean: 0,
        oxygen: 0,
        board: INITIAL_BOARD_STATE
    },
    currentPlayerIndex: 0,
    players: [{
        id: 0,
        corporation: null,
        // TODO: should this be replaced with "possibleCards", and recycled between rounds?
        startingCards,
        possibleCorporations,
        cards: [],
        playedCards: [],
        resources: initialResources(),
        productions: initialResources(),
    }],
    transaction: {
        isPending: false,
        pendingPlayers: [],
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
                playerState.corporation.gainResource?.forEach(resource => {
                    playerState.resources[resource]++;
                });
                playerState.corporation.removeResource?.forEach(resource => {
                    playerState.resources[resource]--;
                });
                playerState.corporation.increaseProduction?.forEach(production => {
                    playerState.productions[production]++;
                });
                playerState.corporation.decreaseProduction?.forEach(production => {
                    playerState.productions[production]--;
                });
                playerState.playedCards.push(playerState.corporation);
            case GO_TO_GAME_STAGE:
                draft.common.gameStage = action.payload;
                break;
            // could this be generalized to GAIN_ONE_RESOURCE_PER_CONDITION(resource, condition)
            // case GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS:
            //     const citiesOnMars = getCitiesOnMars(state.board);
            //     draft.resources[Resource.Megacredit] += citiesOnMars;
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

            return cell.tile.type == TileType.City ? rowAcc + 1 : rowAcc;
        }, 0);

        return citiesInRow + acc;
    }, 0);
}

export type RootState = ReturnType<typeof reducer>;

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
