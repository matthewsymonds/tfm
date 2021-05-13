import {BaseCommonState} from 'BaseCommonState';
import {ResourceActionType} from 'components/ask-user-to-confirm-resource-action-details';
import {Action, Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {Tag} from 'constants/tag';
import produce from 'immer';
import {BaseGameState} from './BaseGameState';
import {BasePlayerState} from './BasePlayerState';
import {Resource, ResourceLocationType} from './constants/resource';
import {Card, cardMap, cards, dummyCard} from './models/card';

export type SerializedCommonState = Omit<
    BaseCommonState,
    'deck' | 'discardPile' | 'revealedCards' | 'preludes'
> & {
    deck: SerializedCard[];
    discardPile: SerializedCard[];
    revealedCards: SerializedCard[];
    preludes: SerializedCard[];
};

export type SerializedPlayerState = Omit<
    BasePlayerState,
    | 'corporation'
    | 'possibleCorporations'
    | 'cards'
    | 'playedCards'
    | 'preludes'
    | 'possiblePreludes'
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
        draftPicks?: SerializedCard[];
    };
    possibleCorporations: SerializedCard[];
    cards: SerializedCard[];
    playedCards: SerializedCard[];
    preludes: SerializedCard[];
    choosePrelude?: boolean;
    possiblePreludes: SerializedCard[];
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

export type SerializedState = Omit<Omit<BaseGameState, 'common'>, 'players'> & {
    common: SerializedCommonState;
    players: SerializedPlayerState[];
};

export type SerializedCard = {
    name: string;
    lastRoundUsedAction?: number;
    storedResourceAmount?: number;
    increaseProductionResult?: Resource;
};

export function deserializeCard(serializedCard: SerializedCard): Card {
    if (!serializedCard) return dummyCard;
    let card = cardMap[serializedCard.name] ?? dummyCard;
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

// No cheating! This method hides private information.
export const censorGameState = (readonlyState: SerializedState, username: string) => {
    return produce(readonlyState, state => {
        state.common.deck = [];
        state.common.discardPile = [];
        state.common.preludes = [];
        if (state.common.gameStage === GameStage.END_OF_GAME) {
            // No need to censor the game state anymore.
            // Out of performance concern, still don't include deck, preludes, or discard.
            return state;
        }
        for (const player of state.players) {
            if (player.username === username) {
                continue;
            }

            (player.pendingCardSelection = player.pendingCardSelection
                ? {
                      possibleCards: Array(player.pendingCardSelection.possibleCards.length),
                      draftPicks: player.pendingCardSelection.draftPicks
                          ? Array(player.pendingCardSelection.draftPicks?.length)
                          : undefined,
                      numCardsToTake: player.pendingCardSelection.numCardsToTake,
                      isBuyingCards: player.pendingCardSelection.isBuyingCards,
                  }
                : undefined),
                (player.cards = Array(player.cards.length));
            player.possibleCorporations = Array(player.possibleCorporations.length);
            player.possiblePreludes = Array(player.possiblePreludes?.length ?? 0);
            player.preludes = Array(player.preludes?.length ?? 0);

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
    });
};
