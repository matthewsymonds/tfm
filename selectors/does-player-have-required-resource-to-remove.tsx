import {Action} from 'constants/action';
import {isStorableResource} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getAllowedCardsForResourceAction} from 'selectors/card';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {getAppropriatePlayerForAction} from 'selectors/get-appropriate-player-for-action';
import {SupplementalResources} from 'server/api-action-handler';
import {getCard} from './get-card';

export function doesPlayerHaveRequiredResourcesToRemove(
    action: Action | Card,
    state: GameState,
    _player: PlayerState | null,
    parent?: Card,
    supplementalResources?: SupplementalResources,
    sourceCard?: Card
) {
    const player = _player ?? getAppropriatePlayerForAction(state, parent);

    // If the action is from playing a card, let user attempt to sort out.
    // Note this is different from the cost of playing a card (MC, which includes heat for helion).
    if (sourceCard) return true;

    for (const resource in action.removeResource) {
        let playerAmount = Infinity;
        const requiredAmount = convertAmountToNumber(
            action.removeResource[resource],
            state,
            player
        );
        if (isStorableResource(resource)) {
            // Find the max amount the player has on 1 card.
            const cards = getAllowedCardsForResourceAction({
                thisCard: parent!,
                resource,
                player,
                resourceLocationType: action.removeResourceSourceType!,
                players: state.players,
            });

            playerAmount = Math.max(
                ...cards.map(card => card.storedResourceAmount ?? 0)
            );
        } else if (resource === Resource.CARD) {
            playerAmount = player.cards.length;
        } else {
            // Standard resource
            playerAmount = getAmountForResource(
                resource as Resource,
                player,
                supplementalResources
            );
        }
        if (playerAmount < requiredAmount) return false;
    }

    if (Object.keys(action.removeResourceOption ?? {}).length > 0) {
        for (const resource in action.removeResourceOption) {
            // Resource option only implemented for standard resources.
            if (
                player.resources[resource] >=
                action.removeResourceOption[resource]
            ) {
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
): number {
    const baseAmount = player.resources[resource] ?? 0;
    if (resource !== Resource.HEAT) {
        return baseAmount;
    }

    return getSupplementalQuantity(player, supplementalResources) + baseAmount;
}

export function getSupplementalQuantity(
    player: PlayerState,
    supplementalResources?: SupplementalResources
): number {
    const fullCard = getFullCardForSupplementalQuantity(
        player,
        supplementalResources
    );
    let supplementalQuantity = 0;

    if (fullCard?.storedResourceAmount && fullCard?.useStoredResourceAsHeat) {
        if (supplementalResources?.quantity != null) {
            supplementalQuantity =
                fullCard.useStoredResourceAsHeat *
                supplementalResources.quantity;
        } else {
            supplementalQuantity =
                fullCard.useStoredResourceAsHeat *
                fullCard.storedResourceAmount;
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
        const card = player.playedCards.find(
            card => card.name === supplementalResources.name
        );
        if (card) {
            fullCard = getCard(card);
        }
    } else {
        const card = player.playedCards
            .map(getCard)
            .find(card => card.useStoredResourceAsHeat);
        if (card) {
            fullCard = getCard(card);
        }
    }

    return fullCard;
}
