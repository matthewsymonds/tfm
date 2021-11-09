import {BaseCommonState} from 'BaseCommonState';
import {ResourceActionType} from 'components/ask-user-to-confirm-resource-action-details';
import {Action, Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {SerializedColony} from 'constants/colonies';
import {GameStage} from 'constants/game';
import {Tag} from 'constants/tag';
import {
    GameAction,
    GameActionClaimMilestone,
    GameActionFundAward,
    GameActionGameUpdate,
    GameActionPass,
    GameActionPlayCard,
    GameActionPlayCardAction,
    GameActionPlayerResourceUpdate,
    GameActionSkip,
    GameActionStandardProject,
    GameActionTrade,
    GameActionType,
} from 'GameActionState';
import produce from 'immer';
import spawnExhaustiveSwitchError from 'utils';
import {BaseGameState} from './BaseGameState';
import {BasePlayerState} from './BasePlayerState';
import {ResourceLocationType} from './constants/resource';
import {Resource} from './constants/resource-enum';
import {Card, cardMap, cards, dummyCard} from './models/card';

export type SerializedCommonState = Omit<
    BaseCommonState,
    'deck' | 'discardPile' | 'revealedCards' | 'preludes' | 'colonies'
> & {
    deck: SerializedCard[];
    discardPile: SerializedCard[];
    revealedCards: SerializedCard[];
    preludes: SerializedCard[];
    colonies?: SerializedColony[];
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
    cardCost: number;
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

export type SerializedState = Omit<BaseGameState, 'common' | 'players' | 'log'> & {
    common: SerializedCommonState;
    players: SerializedPlayerState[];
    log: SerializedGameAction[];
};

export type SerializedCard = {
    name: string;
    lastRoundUsedAction?: number;
    storedResourceAmount?: number;
    increaseProductionResult?: Resource;
};

type SerializedGameActionPlayCard = Omit<GameActionPlayCard, 'card'> & {
    card: SerializedCard;
};

type SerializedGameActionPlayCardAction = Omit<GameActionPlayCardAction, 'card'> & {
    card: SerializedCard;
};

export type SerializedGameAction =
    | SerializedGameActionPlayCard
    | SerializedGameActionPlayCardAction
    | GameActionFundAward
    | GameActionClaimMilestone
    | GameActionStandardProject
    | GameActionTrade
    | GameActionSkip
    | GameActionPass
    | GameActionGameUpdate
    | GameActionPlayerResourceUpdate
    | string;

export function deserializeGameAction(serializedGameAction: SerializedGameAction): GameAction {
    if (typeof serializedGameAction === 'string') {
        return serializedGameAction;
    }
    switch (serializedGameAction.actionType) {
        case GameActionType.CARD:
        case GameActionType.CARD_ACTION:
            return {
                ...serializedGameAction,
                card: deserializeCard(serializedGameAction.card),
            };
        case GameActionType.AWARD:
        case GameActionType.MILESTONE:
        case GameActionType.STANDARD_PROJECT:
        case GameActionType.TRADE:
        case GameActionType.PASS:
        case GameActionType.SKIP:
        case GameActionType.GAME_UPDATE:
        case GameActionType.PLAYER_RESOURCE_UPDATE:
            return {
                ...serializedGameAction,
            };
        default:
            throw spawnExhaustiveSwitchError(serializedGameAction);
    }
}

export function deserializeCard(serializedCard: SerializedCard): Card {
    if (!serializedCard) return dummyCard;
    let card = cardMap[serializedCard.name] ?? dummyCard;
    card.storedResourceAmount = serializedCard.storedResourceAmount || 0;
    card.lastRoundUsedAction = serializedCard.lastRoundUsedAction;
    card.increaseProductionResult = serializedCard.increaseProductionResult;
    return card;
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

            player.pendingCardSelection = player.pendingCardSelection
                ? {
                      possibleCards: Array(player.pendingCardSelection.possibleCards.length),
                      draftPicks: player.pendingCardSelection.draftPicks
                          ? Array(player.pendingCardSelection.draftPicks?.length)
                          : undefined,
                      numCardsToTake: player.pendingCardSelection.numCardsToTake,
                      isBuyingCards: player.pendingCardSelection.isBuyingCards,
                  }
                : undefined;
            player.cards = Array(
                state.common.gameStage === GameStage.ACTIVE_ROUND
                    ? player.cards.length
                    : // Don't reveal card selection info during draft/card selection
                      player.previousCardsInHand ?? 0
            );
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
