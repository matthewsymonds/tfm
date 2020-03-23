import {GameStage} from './constants/game';
import {INITIAL_BOARD_STATE, TileType, Board} from './constants/board';
import {
    SET_CORPORATION,
    SET_CARDS,
    GO_TO_GAME_STAGE,
    CHANGE_RESOURCE,
    GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS,
    CONFIRM_CORPORATION_AND_CARDS
} from './actions';
import produce from 'immer';
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

export type GameState = {
    gameStage: GameStage;
    corporation: null | Card;
    startingCards: null | Card[];
    possibleCorporations: null | Card[];
    cards: Card[];
    playedCards: Card[];
    generation: number;
    round: number;
    turn: number;
    resources: Resources;
    productions: Resources;
    temperature: number;
    ocean: number;
    oxygen: number;
    board: Board;
};

const INITIAL_STATE: GameState = {
    gameStage: GameStage.CorporationSelection,
    corporation: null,
    // TODO: should this be replaced with "possibleCards", and recycled between rounds?
    startingCards,
    possibleCorporations,
    cards: [],
    playedCards: [],
    generation: 0,
    round: 0,
    turn: 0,
    resources: initialResources(),
    productions: initialResources(),
    temperature: -30,
    ocean: 0,
    oxygen: 0,
    board: INITIAL_BOARD_STATE
};

export const reducer = (state = INITIAL_STATE, action) => {
    return produce(state, draft => {
        switch (action.type) {
            case SET_CORPORATION:
                draft.corporation = action.payload;
                break;
            case SET_CARDS:
                draft.cards = action.payload;
                break;
            case CONFIRM_CORPORATION_AND_CARDS:
                if (!draft.corporation) {
                    throw new Error('You must select a corporation');
                }
                draft.possibleCorporations = null; // no longer relevant
                draft.startingCards = null; // no longer relevant
                draft.corporation.gainResource?.forEach(resource => {
                    draft.resources[resource]++;
                });
                draft.corporation.removeResource?.forEach(resource => {
                    draft.resources[resource]--;
                });
                draft.corporation.increaseProduction?.forEach(production => {
                    draft.productions[production]++;
                });
                draft.corporation.decreaseProduction?.forEach(production => {
                    draft.productions[production]--;
                });
                draft.playedCards.push(draft.corporation);
            case GO_TO_GAME_STAGE:
                draft.gameStage = action.payload;
                break;
            case GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS:
                const citiesOnMars = getCitiesOnMars(state.board);
                draft.resources[Resource.Megacredit] += citiesOnMars;
            case CHANGE_RESOURCE:
                draft.resources[action.payload.resource] +=
                    action.payload.amount;
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
