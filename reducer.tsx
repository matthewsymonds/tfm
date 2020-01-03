import {GameStage} from './constants/game';
import {SET_CORPORATION, SET_CARDS} from './actions';
import produce from 'immer';
import {Card, Deck, CardType} from './constants/card-types';
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
    megacredit: 0,
    steel: 0,
    titanium: 0,
    plant: 0,
    energy: 0,
    heat: 0
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
const corporations = sampleCards(allCorporations, 2);
const startingCards = sampleCards(deck, 10);

const INITIAL_STATE = {
  gameStage: GameStage.CorporationSelection,
  corporation: null,
  startingCards,
  corporations,
  cards: [],
  playedCards: [],
  generation: 0,
  round: 0,
  turn: 0,
  resources: initialResources(),
  production: initialResources(),
  temperature: -30,
  ocean: 0,
  oxygen: 0
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
      default:
        return draft;
    }
  });
};
