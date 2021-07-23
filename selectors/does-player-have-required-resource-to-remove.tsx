import {Action} from 'constants/action';
import {isStorableResource, Resource, ResourceLocationType} from 'constants/resource';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getAllowedCardsForResourceAction} from 'selectors/card';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {getAppropriatePlayerForAction} from 'selectors/get-appropriate-player-for-action';
import {SupplementalResources} from 'server/api-action-handler';
import {getCard} from './get-card';

/* Locations where we must remove the resource, or the action isn't playable */
const REQUIRED_REMOVE_RESOURCE_LOCATIONS = [
    ResourceLocationType.THIS_CARD,
    ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
];

export function doesPlayerHaveRequiredResourcesToRemove(
    action: Action | Card,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card,
    supplementalResources?: SupplementalResources
) {
    const player = _player ?? getAppropriatePlayerForAction(state, parent);

    // Moss exception.
    // Note because this handling is special,
    // it gets in the way of custom cards.
    if ('name' in action) {
        if (action.name === 'Moss') {
            // Viral enhancers will always give us the plant we need to continue.
            if (player.playedCards.some(card => card.name === 'Viral Enhancers')) {
                return true;
            }
            if (player.playedCards.some(card => card.name === 'Manutech')) {
                return true;
            }
        }
        if (action.name === 'Nitrophilic Moss') {
            if (player.playedCards.some(card => card.name === 'Manutech')) {
                return true;
            }
        }
    }

    if (
        action.removeResourceSourceType &&
        !REQUIRED_REMOVE_RESOURCE_LOCATIONS.includes(action.removeResourceSourceType)
    ) {
        // If we're removing a resource and it's not required, then the action is playable
        return true;
    }

    for (const resource in action.removeResource) {
        const requiredAmount = convertAmountToNumber(
            action.removeResource[resource],
            state,
            player
        );
        if (isStorableResource(resource)) {
            const cards = getAllowedCardsForResourceAction({
                thisCard: parent!,
                resource,
                player,
                resourceLocationType: action.removeResourceSourceType!,
                players: state.players,
            });

            if (cards.every(card => (card.storedResourceAmount || 0) < requiredAmount)) {
                return false;
            }

            return true;
        }

        let playerAmount: number;
        if (resource === Resource.CARD) {
            // If we're playing a card which requires a discard,
            // then by the time we play it there will be one fewer card in hand.
            // Otherwise, if it's an action or effect the card has already been played.
            playerAmount = action instanceof Card ? player.cards.length - 1 : player.cards.length;
        } else {
            playerAmount = getAmountForResource(
                resource as Resource,
                player,
                supplementalResources
            );
        }

        return playerAmount >= requiredAmount;
    }

    if (Object.keys(action.removeResourceOption ?? {}).length > 0) {
        for (const resource in action.removeResourceOption) {
            // Resource option only implemented for standard resources.
            if (player.resources[resource] >= action.removeResourceOption[resource]) {
                return true;
            }
        }
        // Did not find a resource the player could provide to fulfill the option (e.g. Electro Catapult).
        return false;
    }

    return true;
}

export function getAmountForResource(
    resource: Resource,
    player: PlayerState,
    supplementalResources?: SupplementalResources
) {
    const baseAmount = player.resources[resource];
    if (resource !== Resource.HEAT) {
        return baseAmount;
    }

    return getSupplementalQuantity(player, supplementalResources) + baseAmount;
}

export function getSupplementalQuantity(
    player: PlayerState,
    supplementalResources?: SupplementalResources
): number {
    const fullCard = getFullCardForSupplementalQuantity(player, supplementalResources);
    let supplementalQuantity = 0;

    if (fullCard?.storedResourceAmount && fullCard?.useStoredResourceAsHeat) {
        if (supplementalResources?.quantity != null) {
            supplementalQuantity =
                fullCard.useStoredResourceAsHeat * supplementalResources.quantity;
        } else {
            supplementalQuantity = fullCard.useStoredResourceAsHeat * fullCard.storedResourceAmount;
        }
    }

    return supplementalQuantity;
}

export function getFullCardForSupplementalQuantity(
    player: PlayerState,
    supplementalResources?: SupplementalResources
) {
    let fullCard: Card | undefined = undefined;

    if (supplementalResources?.name) {
        const card = player.playedCards.find(card => card.name === supplementalResources.name);
        if (card) {
            fullCard = getCard(card);
        }
    } else {
        const card = player.playedCards.map(getCard).find(card => card.useStoredResourceAsHeat);
        if (card) {
            fullCard = getCard(card);
        }
    }

    return fullCard;
}
