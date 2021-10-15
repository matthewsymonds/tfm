import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {Action} from 'constants/action';
import {getColony, MAX_NUM_COLONIES} from 'constants/colonies';
import {isStorableResource, ResourceLocationType} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getAllowedCardsForResourceAction} from 'selectors/card';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {getAppropriatePlayerForAction} from 'selectors/get-appropriate-player-for-action';
import {
    ActionCardPair,
    EffectEvent,
    getActionsFromEffectForPlayer,
    SupplementalResources,
} from 'server/api-action-handler';
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
    supplementalResources?: SupplementalResources,
    sourceCard?: Card
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

            playerAmount = Math.max(...cards.map(card => card.storedResourceAmount ?? 0));
        } else if (resource === Resource.CARD) {
            // When you have remove/gain, discard must happen first (exception: Colonies which does not call this function).
            // Playing a card limits your hand by 1, so Sponsored Academies needs this ternary.
            playerAmount = sourceCard ? player.cards.length - 1 : player.cards.length;
        } else if (!sourceCard) {
            // Pre-enforce remove resource standard resources on non-cards (e.g. a Card Action: spend 2 to draw a card, or a Standard Project, or a Conversoin)
            playerAmount = getAmountForResource(
                resource as Resource,
                player,
                supplementalResources
            );
        }
        if (playerAmount < requiredAmount) {
            // We can do some complex logic to check if the player has some path out.
            const delta = getEffectsDelta(state, player, action, resource as Resource, sourceCard);
            return delta + playerAmount >= requiredAmount;
        }
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

// Ensure that, if an effect exists that will gain you resources,
// in such a way that it counters your decreased resources dipping beneath 0,
// that you can still play the card.
// Example: Olympus Conference with 1 science resource. Only Sponsored Academies in hand.
// Without this function you cannot play even though it should be possible.
// Note: thanks to effect actions having *choices* sometimes,
// This does not guarantee the player will not end up shooting themselves in the foot.
// Example: if you play Sponsored Academies then choose to *gain* a science resource on Olympus Conference,
// You will not have enough cards to discard and end up in an illegalState.
function getEffectsDelta(
    state: GameState,
    player: PlayerState,
    action: Action | Card,
    resource: Resource,
    sourceCard?: Card
) {
    // We should only do this stuff for cards, not standard projects or anything else.
    if (!sourceCard) {
        return 0;
    }

    const tags = 'isCard' in action ? action.tags : sourceCard ? sourceCard.tags : [];

    const additionalCards = 'isCard' in action ? [action] : sourceCard ? [sourceCard] : [];

    const actionCardPairs: ActionCardPair[] = [];

    for (const tilePlacement of action.tilePlacements ?? []) {
        const event: EffectEvent = {
            placedTile: tilePlacement.type,
        };

        actionCardPairs.push(
            ...getActionsFromEffectForPlayer(player, event, player, additionalCards)
        );
    }

    if (action.cost) {
        const event: EffectEvent = {
            cost: action.cost,
        };
        actionCardPairs.push(
            ...getActionsFromEffectForPlayer(player, event, player, additionalCards)
        );
    }

    if (tags.length > 0) {
        const event: EffectEvent = {
            tags,
        };
        actionCardPairs.push(
            ...getActionsFromEffectForPlayer(player, event, player, additionalCards)
        );
    }

    const actions = actionCardPairs.map(pair => {
        let action: Action | undefined;
        let card: Card;
        [action, card] = pair;
        if (action.choice) {
            action = action.choice.find(action => action.gainResource?.[resource]);
            if (!action || !canPlayActionInSpiteOfUI(action, state, player, card)[0]) {
                return undefined;
            }
        }

        return action;
    });

    const increases = actions.map(action => action?.gainResource?.[resource] ?? 0);

    let total = 0;
    for (const increase of increases) {
        if (!increase) continue;
        total += convertAmountToNumber(increase, state, player);
    }

    // Account for getting resources
    if (action.placeColony) {
        const colonies = state.common.colonies ?? [];
        const richColonies = colonies.map(getColony);

        const coloniesWithSpace = richColonies.filter(colony => {
            const matchingColony = state.common.colonies?.find(
                stateColony => stateColony.name === colony.name
            );

            return matchingColony?.colonies.length ?? Infinity < MAX_NUM_COLONIES;
        });

        total += Math.max(
            ...coloniesWithSpace.map(colony =>
                convertAmountToNumber(
                    colony.colonyPlacementBonus?.gainResource?.[resource] ?? 0,
                    state,
                    player
                )
            )
        );
    }

    // We should probably account for "lose 1 resource. place a city" but no cards do that.
    // This would only come up in custom cards.
    return total;
}
