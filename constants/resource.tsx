// Can appear on the board, on a card, or in a colony.

import {colors} from 'components/ui';
import spawnExhaustiveSwitchError from 'utils';
import {Amount} from './action';
import {Resource} from './resource-enum';

export const PROTECTED_HABITAT_RESOURCE = [Resource.PLANT, Resource.ANIMAL, Resource.MICROBE];

const storableResources = [
    Resource.ANIMAL,
    Resource.ASTEROID,
    Resource.CAMP,
    Resource.FIGHTER,
    Resource.FLOATER,
    Resource.MICROBE,
    Resource.SCIENCE,
    Resource.ANY_STORABLE_RESOURCE,
] as const;

export const STANDARD_RESOURCES = [
    Resource.MEGACREDIT,
    Resource.STEEL,
    Resource.TITANIUM,
    Resource.PLANT,
    Resource.ENERGY,
    Resource.HEAT,
];

export type StorableResource = typeof storableResources[number];

export function isStorableResource(resource: any): resource is StorableResource {
    return storableResources.includes(resource);
}

export type ResourceAndAmount = {
    resource: Resource;
    amount: Amount;
};

export enum ResourceLocationType {
    THIS_CARD = 'thisCard',
    ANY_CARD_OWNED_BY_YOU = 'anyCardOwnedByYou',
    ANY_CARD = 'anyCard',
    ANY_PLAYER = 'anyPlayer',
    ANY_PLAYER_WITH_VENUS_TAG = 'anyPlayerWithVenusTag',
    LAST_PLAYED_CARD = 'lastPlayedCard',
    VENUS_CARD = 'venusCard',
    JOVIAN_CARD = 'jovianCard',
    ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE = 'anyPlayerWithTileAdjacentToMostRecentlyPlacedTile',
    ANY_CARD_WITH_NONZERO_STORABLE_RESOURCE = 'anyCardWithNonzeroStorableResource',
}

export const USER_CHOICE_LOCATION_TYPES = [
    ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    ResourceLocationType.ANY_CARD,
    ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE,
    ResourceLocationType.VENUS_CARD,
    ResourceLocationType.JOVIAN_CARD,
    ResourceLocationType.ANY_PLAYER,
    ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG,
    ResourceLocationType.ANY_CARD_WITH_NONZERO_STORABLE_RESOURCE,
];

export const getClassName = (resource: Resource) => {
    switch (resource) {
        case Resource.TITANIUM:
            return 'titanium-icon';
        case Resource.MEGACREDIT:
            return 'megacredit-icon';
        case Resource.CARD:
            return 'card-icon';
        case Resource.HEAT:
            return 'heat-icon';
        case Resource.ENERGY:
            return 'energy-icon';
        default:
            return 'resource-icon';
    }
};

export const getResourceBorder = (resource: Resource) => {
    switch (resource) {
        case Resource.STEEL:
            return '1px solid black';
        default:
            return 'none';
    }
};

export const getResourceSymbol = (resource: Resource) => {
    switch (resource) {
        case Resource.ANIMAL:
            return '🐶';
        case Resource.ASTEROID:
            return '🪨';
        case Resource.CAMP:
            return '🏠';
        case Resource.CARD:
            return '🌎';
        case Resource.ENERGY:
            return '⚡';
        case Resource.FIGHTER:
            return '🚀';
        case Resource.FLOATER:
            return '☁️';
        case Resource.HEAT:
            return '🔥';
        case Resource.MEGACREDIT:
            return '€';
        case Resource.MICROBE:
            return '🐛';
        case Resource.PLANT:
            return '🍂';
        case Resource.SCIENCE:
            return '⚛️';
        case Resource.STEEL:
            return '🔨';
        case Resource.TITANIUM:
            return '☆';
        case Resource.ANY_STORABLE_RESOURCE:
            return '📦';
        case Resource.ANY_STANDARD_RESOURCE:
            return '?';
        case Resource.PRESERVATION:
            return 'P';
        default:
            throw spawnExhaustiveSwitchError(resource);
    }
};

export const getResourceName = (resource: Resource, shouldCapitalize: boolean = false) => {
    let resourceName: string;
    switch (resource) {
        case Resource.ANIMAL:
            resourceName = 'animal';
            break;
        case Resource.ASTEROID:
            resourceName = 'asteroid resource';
            break;
        case Resource.CAMP:
            resourceName = 'camp';
            break;
        case Resource.CARD:
            resourceName = 'card';
            break;
        case Resource.ENERGY:
            resourceName = 'energy';
            break;
        case Resource.FIGHTER:
            resourceName = 'fighter resource';
            break;
        case Resource.FLOATER:
            resourceName = 'floater';
            break;
        case Resource.HEAT:
            resourceName = 'heat';
            break;
        case Resource.MEGACREDIT:
            resourceName = 'megacredit';
            break;
        case Resource.MICROBE:
            resourceName = 'microbe';
            break;
        case Resource.PLANT:
            resourceName = 'plant';
            break;
        case Resource.SCIENCE:
            resourceName = 'science resource';
            break;
        case Resource.STEEL:
            resourceName = 'steel';
            break;
        case Resource.TITANIUM:
            resourceName = 'titanium';
            break;
        case Resource.ANY_STORABLE_RESOURCE:
        case Resource.ANY_STANDARD_RESOURCE:
            resourceName = 'resource';
            break;
        case Resource.PRESERVATION:
            resourceName = 'preservation';
            break;
        default:
            throw spawnExhaustiveSwitchError(resource);
    }
    return shouldCapitalize
        ? `${resourceName[0].toUpperCase()}${resourceName.slice(1)}`
        : resourceName;
};

export const getResourceColor = (resource: Resource): string => {
    switch (resource) {
        case Resource.ANIMAL:
            return 'brown';
        case Resource.ASTEROID:
            return 'gray';
        case Resource.CAMP:
            return 'brown';
        case Resource.CARD:
            return 'orange';
        case Resource.ENERGY:
            return 'white';
        case Resource.FLOATER:
            return 'white';
        case Resource.FIGHTER:
            return 'gray';
        case Resource.HEAT:
            return 'gold';
        case Resource.MEGACREDIT:
            return 'black';
        case Resource.MICROBE:
            return 'darkgreen';
        case Resource.PLANT:
            return 'darkgreen';
        case Resource.SCIENCE:
            return 'white';
        case Resource.STEEL:
            return '#ffefec';
        case Resource.TITANIUM:
            return 'yellow';
        case Resource.ANY_STORABLE_RESOURCE:
        case Resource.ANY_STANDARD_RESOURCE:
        case Resource.PRESERVATION:
            return 'black';
        default:
            throw spawnExhaustiveSwitchError(resource);
    }
};

export const getResourceBackgroundColor = (resource: Resource) => {
    switch (resource) {
        case Resource.ANIMAL:
            return '#eee';
        case Resource.ASTEROID:
            return 'black';
        case Resource.CAMP:
            return colors.DARK_4;
        case Resource.CARD:
            return 'black';
        case Resource.ENERGY:
            return 'purple';
        case Resource.FLOATER:
            return '#dba102';
        case Resource.FIGHTER:
            return 'black';
        case Resource.HEAT:
        case Resource.PRESERVATION:
            return '#ef2b2b';
        case Resource.MEGACREDIT:
            return '#fbe21e';
        case Resource.MICROBE:
            return 'lightgreen';
        case Resource.PLANT:
            return 'lightgreen';
        case Resource.SCIENCE:
            return colors.DARK_4;
        case Resource.STEEL:
            return 'brown';
        case Resource.TITANIUM:
            return 'black';
        case Resource.ANY_STORABLE_RESOURCE:
        case Resource.ANY_STANDARD_RESOURCE:
            return 'white';
        default:
            throw spawnExhaustiveSwitchError(resource);
    }
};
