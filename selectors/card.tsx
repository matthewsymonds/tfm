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

export function getAllowedCardsToGainResourceTo({
    player,
    resource,
    gainResourceTargetType,
    thisCard,
}: {
    player: PlayerState;
    resource: StorableResource;
    gainResourceTargetType: ResourceLocationType;
    thisCard: Card | undefined;
}): Card[] {
    switch (gainResourceTargetType) {
        case ResourceLocationType.ANY_CARD:
        case ResourceLocationType.ANIMAL_CARD:
        case ResourceLocationType.MICROBE_CARD:
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
        default:
            throw spawnExhaustiveSwitchError(gainResourceTargetType);
    }
}
