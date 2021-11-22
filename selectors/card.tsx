import {Amount} from 'constants/action';
import {isConditionAmount} from 'constants/conditional-amount';
import {isContestAmount} from 'constants/contest-amount';
import {isOperationAmount} from 'constants/operation-amount';
import {isProductionAmount} from 'constants/production-amount';
import {
    PROTECTED_HABITAT_RESOURCE,
    ResourceLocationType,
    StorableResource,
} from 'constants/resource';
import {isResourceAmount} from 'constants/resource-amount';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getTags, VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import spawnExhaustiveSwitchError from 'utils';
import {
    convertConditionAmountToNumber,
    convertContestAmountToNumber,
    convertOperationAmountToNumber,
    convertProductionAmountToNumber,
    convertResourceAmountToNumber,
} from './convert-amount-to-number';
import {getCard} from './get-card';
import {getPlayedCards} from './get-played-cards';
import {isTagAmount} from './is-tag-amount';

export function getAllPlayedCards(player: PlayerState) {
    return getPlayedCards(player);
}

export function getCardVictoryPoints(
    amount: Amount | undefined,
    state: GameState,
    player: PlayerState,
    card: Card
) {
    if (!amount) return 0;
    if (typeof amount === 'number') return amount;
    if (isTagAmount(amount)) {
        const tags = getTags(player);
        // Wild tags do not count here.
        const matchingTags = tags.filter(tag => tag === amount.tag);
        return Math.floor(matchingTags.length / (amount.dividedBy ?? 1));
    }
    if (isOperationAmount(amount)) {
        return convertOperationAmountToNumber(amount, state, player, card);
    }

    if (isConditionAmount(amount)) {
        return convertConditionAmountToNumber(amount, state, player, card);
    }

    if (isContestAmount(amount)) {
        return convertContestAmountToNumber(amount, state, player, card);
    }

    if (isProductionAmount(amount)) {
        return convertProductionAmountToNumber(amount, state, player, card);
    }

    if (isResourceAmount(amount)) {
        return convertResourceAmountToNumber(amount, state, player, card);
    }

    const selector = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!selector) return 0;

    return selector(state, player, card) || 0;
}

export function getAllPlayedCardsExcludingLast(player: PlayerState) {
    return getPlayedCards(player).slice(0, getPlayedCards(player).length - 1);
}

export function getLastPlayedCard(player: PlayerState) {
    return getPlayedCards(player)[getPlayedCards(player).length - 1];
}

export function getAllPlayedCardsWithTagThatHoldResource(
    player: PlayerState,
    tag: Tag,
    resource: StorableResource
) {
    return getPlayedCards(player).filter(card => {
        return (
            card.storedResourceType &&
            card.storedResourceType === resource &&
            card.tags.includes(tag)
        );
    });
}

export function getAllPlayedCardsWithNonZeroStorableResource(player: PlayerState) {
    return getPlayedCards(player).filter(card => card.storedResourceAmount);
}

export function getAllPlayedCardsThatHoldResource(
    currentPlayer: PlayerState,
    player: PlayerState,
    resource: Resource
) {
    let cards: Card[] = [];
    for (const card of getPlayedCards(player)) {
        if (
            currentPlayer.index !== player.index &&
            card.name === 'Protected Habitats' &&
            PROTECTED_HABITAT_RESOURCE.includes(resource)
        ) {
            return [];
        }

        if (card.name === 'Pets') {
            continue;
        }

        if (card.storedResourceType === resource && card.storedResourceAmount) {
            cards.push(card);
        }
    }
    return cards;
}

export function getAllowedCardsForResourceAction({
    player,
    resource,
    resourceLocationType,
    thisCard,
    players,
}: {
    player: PlayerState;
    resource: StorableResource;
    resourceLocationType: ResourceLocationType;
    thisCard: Card | undefined;
    players: PlayerState[];
}): Card[] {
    switch (resourceLocationType) {
        case ResourceLocationType.ANY_CARD_OWNED_BY_YOU:
            return getAllPlayedCardsThatHoldResource(player, player, resource);
        case ResourceLocationType.THIS_CARD:
            return thisCard
                ? [player.playedCards.find(card => card.name === thisCard.name)]
                      .filter(Boolean)
                      .map(getCard)
                : [];
        case ResourceLocationType.LAST_PLAYED_CARD: {
            const lastPlayedCard = getLastPlayedCard(player);
            if (
                lastPlayedCard.storedResourceType &&
                lastPlayedCard.storedResourceType === resource
            ) {
                return [lastPlayedCard];
            }
            return [];
        }
        case ResourceLocationType.JOVIAN_CARD:
            return getAllPlayedCardsWithTagThatHoldResource(player, Tag.JOVIAN, resource);
        case ResourceLocationType.VENUS_CARD:
            return getAllPlayedCardsWithTagThatHoldResource(player, Tag.VENUS, resource);
        case ResourceLocationType.ANY_CARD:
            const result: Card[] = [];
            for (const thisPlayer of players) {
                result.push(...getAllPlayedCardsThatHoldResource(player, thisPlayer, resource));
            }
            return result;
        case ResourceLocationType.ANY_CARD_WITH_NONZERO_STORABLE_RESOURCE:
            return getAllPlayedCardsWithNonZeroStorableResource(player);
        case ResourceLocationType.ANY_PLAYER:
        case ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG:
        case ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE:
            throw new Error('Unsupported resource location type for card selection');
        default:
            throw spawnExhaustiveSwitchError(resourceLocationType);
    }
}
