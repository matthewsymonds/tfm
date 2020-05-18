import {PlayerState} from '../reducer';
import {StorableResource, Resource, ResourceLocationType} from '../constants/resource';
import {Tag} from '../constants/tag';
import {Card} from '../models/card';
import spawnExhaustiveSwitchError from '../utils';

export function getAllPlayedCards(player: PlayerState) {
    return player.playedCards;
}

export function getAllPlayedCardsExcludingLast(player: PlayerState) {
    return player.playedCards.slice(0, player.playedCards.length - 1);
}

export function getAllPlayedCardsThatHoldResource(player: PlayerState, resource: StorableResource) {
    return player.playedCards.filter(card => {
        return card.storedResourceType && card.storedResourceType === resource;
    });
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

export function getAllowedCardsForResourceAction({
    player,
    resource,
    resourceLocationType,
    thisCard,
}: {
    player: PlayerState;
    resource: StorableResource;
    resourceLocationType: ResourceLocationType;
    thisCard: Card | undefined;
}): Card[] {
    switch (resourceLocationType) {
        case ResourceLocationType.ANY_CARD_OWNED_BY_YOU:
            return getAllPlayedCardsThatHoldResource(player, resource);
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
            // TODO
            return [];
        case ResourceLocationType.ANY_PLAYER:
        case ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG:
            throw new Error('Unsupported resource location type for card selection');
        default:
            throw spawnExhaustiveSwitchError(resourceLocationType);
    }
}
