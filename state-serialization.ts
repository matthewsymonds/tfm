import {ResourceActionType} from 'components/ask-user-to-confirm-resource-action-details';
import {Action, Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {Tag} from 'constants/tag';
import {Resource, ResourceLocationType} from './constants/resource';
import {Card, cards, dummyCard} from './models/card';
import {CommonState, GameState, PlayerState} from './reducer';

export type SerializedCommonState = Omit<Omit<CommonState, 'deck'>, 'discardPile'> & {
    deck: SerializedCard[];
    discardPile: SerializedCard[];
};

export type SerializedPlayerState = Omit<
    PlayerState,
    | 'corporation'
    | 'possibleCorporations'
    | 'cards'
    | 'playedCards'
    | 'pendingCardSelection'
    | 'pendingDiscard'
    | 'pendingResourceActionDetails'
    | 'pendingDuplicateProduction'
    | 'pendingChoice'
> & {
    corporation: SerializedCard;
    pendingCardSelection?: {
        possibleCards: SerializedCard[];
        numCardsToTake?: number | null;
        isBuyingCards?: boolean;
    };
    possibleCorporations: SerializedCard[];
    cards: SerializedCard[];
    playedCards: SerializedCard[];
    pendingResourceActionDetails?: {
        actionType: ResourceActionType;
        resourceAndAmounts: Array<{resource: Resource; amount: Amount}>;
        card: SerializedCard;
        playedCard?: SerializedCard;
        locationType?: ResourceLocationType;
    };
    pendingDuplicateProduction?: {
        tag: Tag;
        card: SerializedCard;
    };
    pendingDiscard?: {
        amount: Amount;
        card?: SerializedCard;
        playedCard?: SerializedCard;
        isFromSellPatents?: boolean;
    };
    pendingChoice?: {
        choice: Action[];
        card: SerializedCard;
        playedCard?: SerializedCard;
    };
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

export type SerializedCard = {
    name: string;
    storedResourceType?: Resource;
    lastRoundUsedAction?: number;
    storedResourceAmount?: number;
    increaseProductionResult?: Resource;
} | null;

export function deserializeCard(serializedCard: SerializedCard): Card {
    if (!serializedCard) return dummyCard;
    let card = cards.find(card => card.name === serializedCard.name) ?? dummyCard;
    card.storedResourceAmount = serializedCard.storedResourceAmount || 0;
    card.lastRoundUsedAction = serializedCard.lastRoundUsedAction;
    card.increaseProductionResult = serializedCard.increaseProductionResult;
    return card;
}

export function serializeCard(card: Card): SerializedCard {
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
    const {
        corporation,
        possibleCorporations,
        cards,
        playedCards,
        pendingCardSelection,
        pendingResourceActionDetails,
        pendingDuplicateProduction,
        pendingDiscard,
        pendingChoice,
        ...rest
    } = player;
    return {
        ...rest,
        corporation: serializeCard(corporation),
        pendingCardSelection: pendingCardSelection
            ? {
                  possibleCards: pendingCardSelection.possibleCards.map(serializeCard),
                  numCardsToTake: pendingCardSelection.numCardsToTake,
                  isBuyingCards: pendingCardSelection.isBuyingCards,
              }
            : undefined,
        possibleCorporations: possibleCorporations?.map(serializeCard) || [],
        cards: cards.map(serializeCard),
        playedCards: playedCards.map(serializeCard),
        pendingResourceActionDetails: pendingResourceActionDetails
            ? {
                  ...pendingResourceActionDetails,
                  card: serializeCard(pendingResourceActionDetails.card),
                  playedCard: pendingResourceActionDetails.playedCard
                      ? serializeCard(pendingResourceActionDetails.playedCard)
                      : undefined,
              }
            : undefined,
        pendingDuplicateProduction: pendingDuplicateProduction
            ? {
                  tag: pendingDuplicateProduction.tag,
                  card: serializeCard(pendingDuplicateProduction.card),
              }
            : undefined,
        pendingDiscard: pendingDiscard
            ? {
                  amount: pendingDiscard.amount,
                  card: pendingDiscard.card ? serializeCard(pendingDiscard.card) : undefined,
                  playedCard: pendingDiscard.playedCard
                      ? serializeCard(pendingDiscard.playedCard)
                      : undefined,
                  isFromSellPatents: pendingDiscard.isFromSellPatents ?? false,
              }
            : undefined,
        pendingChoice: pendingChoice
            ? {
                  choice: pendingChoice.choice,
                  card: serializeCard(pendingChoice.card),
                  playedCard: pendingChoice.playedCard
                      ? serializeCard(pendingChoice.playedCard)
                      : undefined,
              }
            : undefined,
    };
};

const deserializePlayerState = (player: SerializedPlayerState): PlayerState => {
    const {
        corporation,
        possibleCorporations,
        cards,
        playedCards,
        pendingCardSelection,
        pendingResourceActionDetails,
        pendingDuplicateProduction,
        pendingDiscard,
        pendingChoice,
        ...rest
    } = player;
    return {
        ...rest,
        corporation: deserializeCard(corporation),
        pendingCardSelection: pendingCardSelection
            ? {
                  possibleCards: pendingCardSelection.possibleCards.map(deserializeCard),
                  numCardsToTake: pendingCardSelection.numCardsToTake,
                  isBuyingCards: pendingCardSelection.isBuyingCards,
              }
            : undefined,
        possibleCorporations: possibleCorporations?.map(deserializeCard) || [],
        cards: cards.map(deserializeCard),
        playedCards: playedCards.map(deserializeCard),
        pendingResourceActionDetails: pendingResourceActionDetails
            ? {
                  ...pendingResourceActionDetails,
                  card: deserializeCard(pendingResourceActionDetails.card),
                  playedCard: pendingResourceActionDetails.playedCard
                      ? deserializeCard(pendingResourceActionDetails.playedCard)
                      : undefined,
              }
            : undefined,
        pendingDuplicateProduction: pendingDuplicateProduction
            ? {
                  tag: pendingDuplicateProduction.tag,
                  card: deserializeCard(pendingDuplicateProduction.card),
              }
            : undefined,
        pendingDiscard: pendingDiscard
            ? {
                  amount: pendingDiscard.amount,
                  card: pendingDiscard.card ? deserializeCard(pendingDiscard.card) : undefined,
                  playedCard: pendingDiscard.playedCard
                      ? deserializeCard(pendingDiscard.playedCard)
                      : undefined,
                  isFromSellPatents: pendingDiscard.isFromSellPatents ?? false,
              }
            : undefined,
        pendingChoice: pendingChoice
            ? {
                  choice: pendingChoice.choice,
                  card: deserializeCard(pendingChoice.card),
                  playedCard: pendingChoice.playedCard
                      ? deserializeCard(pendingChoice.playedCard)
                      : undefined,
              }
            : undefined,
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

        (player.pendingCardSelection = player.pendingCardSelection
            ? {
                  possibleCards: Array(player.pendingCardSelection.possibleCards.length),
                  numCardsToTake: player.pendingCardSelection.numCardsToTake,
                  isBuyingCards: player.pendingCardSelection.isBuyingCards,
              }
            : undefined),
            (player.cards = Array(player.cards.length));
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
