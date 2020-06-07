import {PlayerState} from 'reducer';
import {
    StorableResource,
    Resource,
    ResourceLocationType,
    PROTECTED_HABITAT_RESOURCE,
} from 'constants/resource';
import {Tag} from 'constants/tag';
import {Card} from 'models/card';
import spawnExhaustiveSwitchError from 'utils';
import {VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import {Amount} from 'constants/action';
import {RootState} from 'reducer';

export function getAllPlayedCards(player: PlayerState) {
    return player.playedCards;
}

export function getCardVictoryPoints(amount: Amount | undefined, state: RootState, card: Card) {
    if (!amount) return 0;
    if (typeof amount === 'number') return amount;

    const selector = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!selector) return 0;

    return selector(state, card) || 0;
}

export function getAllPlayedCardsExcludingLast(player: PlayerState) {
    return player.playedCards.slice(0, player.playedCards.length - 1);
}

export function getLastPlayedCard(player: PlayerState) {
    return player.playedCards[player.playedCards.length - 1];
}

export function getAllPlayedCardsWithTagThatHoldResource(
    player: PlayerState,
    tag: Tag,
    resource: StorableResource
) {
    return player.playedCards.filter(card => {
        return (
            card.storedResourceType &&
            card.storedResourceType === resource &&
            card.tags.includes(tag)
        );
    });
}

export function getAllPlayedCardsThatHoldResource(
    currentPlayer: PlayerState,
    player: PlayerState,
    resource: Resource
) {
    let cards: Card[] = [];
    for (const card of player.playedCards) {
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
            return thisCard ? [thisCard] : [];
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
        case ResourceLocationType.ANY_PLAYER:
        case ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG:
            throw new Error('Unsupported resource location type for card selection');
        default:
            throw spawnExhaustiveSwitchError(resourceLocationType);
    }
}
