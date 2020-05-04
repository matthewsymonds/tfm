import {CommonState, PlayerState, RootState} from './reducer';
import {Card, cards} from './models/card';
import {Resource} from './constants/resource';

export type SerializedCommonState = Omit<Omit<CommonState, 'deck'>, 'discardPile'> & {
    deck: SerializedCard[];
    discardPile: SerializedCard[];
};

export type SerializedPlayerState = Omit<
    Omit<
        Omit<
            Omit<Omit<Omit<PlayerState, 'corporation'>, 'possibleCards'>, 'possibleCorporations'>,
            'cards'
        >,
        'selectedCards'
    >,
    'playedCards'
> & {
    corporation: SerializedCard | null;
    possibleCards: SerializedCard[];
    possibleCorporations: SerializedCard[];
    cards: SerializedCard[];
    playedCards: SerializedCard[];
    selectedCards: SerializedCard[];
};

export type SerializedState = Omit<Omit<RootState, 'common'>, 'players'> & {
    common: SerializedCommonState;
    players: SerializedPlayerState[];
};

export const serializeState = (state: RootState): SerializedState => {
    const {players, common, ...rest} = state;
    return {
        ...rest,
        common: serializeCommonState(common),
        players: players.map(player => serializePlayerState(player)),
    };
};

export const deserializeState = (state: SerializedState): RootState => {
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
    usedActionThisRound?: boolean;
    storedResourceAmount?: number;
};

function deserializeCard(serializedCard: SerializedCard): Card {
    const card = cards.find(card => card.name === serializedCard.name)!;
    card.storedResourceAmount = serializedCard.storedResourceAmount || 0;
    card.storedResourceType = serializedCard.storedResourceType;
    card.usedActionThisRound = serializedCard.usedActionThisRound;
    return card;
}

function serializeCard(card: Card): SerializedCard {
    const result: SerializedCard = {
        name: card.name,
    };
    if (card.storedResourceType) {
        result.storedResourceType = card.storedResourceType;
    }
    if (card.storedResourceAmount) {
        result.storedResourceAmount = card.storedResourceAmount;
    }
    if (card.usedActionThisRound) {
        result.usedActionThisRound = card.usedActionThisRound;
    }
    return result;
}

const serializePlayerState = (player: PlayerState): SerializedPlayerState => {
    const {
        corporation,
        possibleCards,
        selectedCards,
        possibleCorporations,
        cards,
        playedCards,
        ...rest
    } = player;
    return {
        ...rest,
        corporation: corporation ? serializeCard(corporation) : null,
        possibleCards: possibleCards.map(serializeCard),
        selectedCards: selectedCards.map(serializeCard),
        possibleCorporations: possibleCorporations?.map(serializeCard) || [],
        cards: cards.map(serializeCard),
        playedCards: playedCards.map(serializeCard),
    };
};

const deserializePlayerState = (player: SerializedPlayerState): PlayerState => {
    const {
        corporation,
        possibleCards,
        selectedCards,
        possibleCorporations,
        cards,
        playedCards,
        ...rest
    } = player;
    return {
        ...rest,
        selectedCards: selectedCards.map(deserializeCard),
        corporation: corporation ? deserializeCard(corporation) : null,
        possibleCards: possibleCards.map(deserializeCard),
        possibleCorporations: possibleCorporations?.map(deserializeCard) || [],
        cards: cards.map(deserializeCard),
        playedCards: playedCards.map(deserializeCard),
    };
};
