import {CardType} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {Resource} from './constants/resource';
import {Card, cards, dummyCard} from './models/card';
import {CommonState, GameState, PlayerState} from './reducer';

export type SerializedCommonState = Omit<Omit<CommonState, 'deck'>, 'discardPile'> & {
    deck: SerializedCard[];
    discardPile: SerializedCard[];
};

export type SerializedPlayerState = Omit<
    Omit<
        Omit<Omit<Omit<PlayerState, 'corporation'>, 'possibleCards'>, 'possibleCorporations'>,
        'cards'
    >,
    'playedCards'
> & {
    corporation: SerializedCard;
    possibleCards: SerializedCard[];
    possibleCorporations: SerializedCard[];
    cards: SerializedCard[];
    playedCards: SerializedCard[];
};

export type SerializedState = Omit<Omit<GameState, 'common'>, 'players'> & {
    common: SerializedCommonState;
    players: SerializedPlayerState[];
};

export const serializeState = (state: GameState): SerializedState => {
    const {players, common, ...rest} = state;
    return {
        ...rest,
        common: serializeCommonState(common),
        players: players.map(player => serializePlayerState(player)),
    };
};

export const deserializeState = (state: SerializedState): GameState => {
    const {players, common, ...rest} = state;
    return {
        ...rest,
        common: deserializeCommonState(common),
        players: players.map(player => deserializePlayerState(player)),
    };
};

const serializeCommonState = (common: CommonState): SerializedCommonState => {
    const {deck, discardPile, ...rest} = common;
    return {
        ...rest,
        deck: deck.map(serializeCard),
        discardPile: discardPile.map(serializeCard),
    };
};

const deserializeCommonState = (common: SerializedCommonState): CommonState => {
    const {deck, discardPile, ...rest} = common;
    return {
        ...rest,
        deck: deck.map(deserializeCard),
        discardPile: discardPile.map(deserializeCard),
    };
};

type SerializedCard = {
    name: string;
    storedResourceType?: Resource;
    lastRoundUsedAction?: number;
    storedResourceAmount?: number;
    increaseProductionResult?: Resource;
} | null;

function deserializeCard(serializedCard: SerializedCard): Card {
    if (!serializedCard) return dummyCard;
    let card = cards.find(card => card.name === serializedCard.name) ?? dummyCard;
    card.storedResourceAmount = serializedCard.storedResourceAmount || 0;
    card.lastRoundUsedAction = serializedCard.lastRoundUsedAction;
    card.increaseProductionResult = serializedCard.increaseProductionResult;
    return card;
}

function serializeCard(card: Card): SerializedCard {
    const result: SerializedCard = {
        name: card.name,
    };
    if (card.storedResourceAmount) {
        result.storedResourceAmount = card.storedResourceAmount;
    }
    if (card.lastRoundUsedAction) {
        result.lastRoundUsedAction = card.lastRoundUsedAction;
    }
    if (card.increaseProductionResult) {
        result.increaseProductionResult = card.increaseProductionResult;
    }
    return result;
}

const serializePlayerState = (player: PlayerState): SerializedPlayerState => {
    const {corporation, possibleCards, possibleCorporations, cards, playedCards, ...rest} = player;
    return {
        ...rest,
        corporation: serializeCard(corporation),
        possibleCards: possibleCards.map(serializeCard),
        possibleCorporations: possibleCorporations?.map(serializeCard) || [],
        cards: cards.map(serializeCard),
        playedCards: playedCards.map(serializeCard),
    };
};

const deserializePlayerState = (player: SerializedPlayerState): PlayerState => {
    const {corporation, possibleCards, possibleCorporations, cards, playedCards, ...rest} = player;
    return {
        ...rest,
        corporation: deserializeCard(corporation),
        possibleCards: possibleCards.map(deserializeCard),
        possibleCorporations: possibleCorporations?.map(deserializeCard) || [],
        cards: cards.map(deserializeCard),
        playedCards: playedCards.map(deserializeCard),
    };
};

// No cheating! This method hides private information.
export const censorGameState = (state: SerializedState, username: string) => {
    state.common.deck = [];
    state.common.discardPile = [];
    for (const player of state.players) {
        if (player.username === username) {
            continue;
        }

        player.possibleCards = Array(player.possibleCards.length);
        player.cards = Array(player.cards.length);
        player.possibleCorporations = Array(player.possibleCorporations.length);

        if (state.common.gameStage === GameStage.CORPORATION_SELECTION) {
            player.corporation = {name: ''};
        }

        for (const card of player.playedCards) {
            if (!card) continue;
            const matchingCard = cards.find(cardModel => cardModel.name === card.name)!;
            if (matchingCard.type === CardType.EVENT) {
                card.name = '';
            }

            if (
                state.common.gameStage === GameStage.CORPORATION_SELECTION &&
                matchingCard.type === CardType.CORPORATION
            ) {
                card.name = '';
            }
        }
    }
    return state;
};
