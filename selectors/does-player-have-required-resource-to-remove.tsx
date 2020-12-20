import {Action} from 'constants/action';
import {isStorableResource, Resource, ResourceLocationType} from 'constants/resource';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getAllowedCardsForResourceAction} from 'selectors/card';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {getAppropriatePlayerForAction} from 'selectors/get-appropriate-player-for-action';

/* Locations where we must remove the resource, or the action isn't playable */
const REQUIRED_REMOVE_RESOURCE_LOCATIONS = [
    ResourceLocationType.THIS_CARD,
    ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
];

export function doesPlayerHaveRequiredResourcesToRemove(
    action: Action,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card
) {
    const player = _player ?? getAppropriatePlayerForAction(state, parent);

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
            playerAmount = player.cards.length;
        } else {
            playerAmount = player.resources[resource];
        }

        return playerAmount >= requiredAmount;
    }

    return true;
}
