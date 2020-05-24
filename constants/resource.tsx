// Can appear on the board, on a card, or in a colony.

import {Amount} from './action';

// Can appear on the board, on a card, or in a colony.
export enum Resource {
    ANIMAL = 'resourceAnimal',
    CAMP = 'resourceCamp',
    CARD = 'resourceCard',
    ENERGY = 'resourceEnergy',
    FIGHTER = 'resourceFighter',
    FLOATER = 'resourceFloater',
    HEAT = 'resourceHeat',
    MEGACREDIT = 'resourceMegacredit',
    MICROBE = 'resourceMicrobe',
    PLANT = 'resourcePlant',
    SCIENCE = 'resourceScience',
    STEEL = 'resourceSteel',
    TITANIUM = 'resourceTitanium',
    ASTEROID = 'asteroid',
}

export const PROTECTED_HABITAT_RESOURCE = [Resource.PLANT, Resource.ANIMAL, Resource.MICROBE];

const storableResources = [
    Resource.ANIMAL,
    Resource.CAMP,
    Resource.FIGHTER,
    Resource.FLOATER,
    Resource.MICROBE,
    Resource.SCIENCE,
] as const;

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
}

export const USER_CHOICE_LOCATION_TYPES = [
    ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    ResourceLocationType.ANY_CARD,
    ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE,
    ResourceLocationType.VENUS_CARD,
    ResourceLocationType.JOVIAN_CARD,
    ResourceLocationType.ANY_PLAYER,
    ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG,
];

export const getClassName = (resource: Resource) => {
    switch (resource) {
        case Resource.TITANIUM:
            return 'titanium-icon';
        case Resource.MEGACREDIT:
            return 'megacredit-icon';
        default:
            return 'resource-icon';
    }
};

export const getResourceSymbol = (resource: Resource) => {
    switch (resource) {
        case Resource.ANIMAL:
            return '🐶';
        case Resource.ASTEROID:
            return '☄️';
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
    }
};

export const getResourceName = (resource: Resource) => {
    switch (resource) {
        case Resource.ANIMAL:
            return 'animal';
        case Resource.ASTEROID:
            return 'asteroid';
        case Resource.CAMP:
            return 'camp';
        case Resource.CARD:
            return 'card';
        case Resource.ENERGY:
            return 'energy';
        case Resource.FIGHTER:
            return 'fighter';
        case Resource.FLOATER:
            return 'floater';
        case Resource.HEAT:
            return 'heat';
        case Resource.MEGACREDIT:
            return 'megacredit';
        case Resource.MICROBE:
            return 'microbe';
        case Resource.PLANT:
            return 'plant';
        case Resource.SCIENCE:
            return 'science';
        case Resource.STEEL:
            return 'steel';
        case Resource.TITANIUM:
            return 'titanium';
        default:
            throw new Error('unrecognized resource');
    }
};

export const getResourceColor = (resource: Resource) => {
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
            return 'gray';
        case Resource.FIGHTER:
            return 'gray';
        case Resource.HEAT:
            return 'gold';
        case Resource.MEGACREDIT:
            return 'gold';
        case Resource.MICROBE:
            return 'green';
        case Resource.PLANT:
            return 'darkgreen';
        case Resource.SCIENCE:
            return 'white';
        case Resource.STEEL:
            return 'brown';
        case Resource.TITANIUM:
            return 'yellow';
    }
};

export const getResourceBackgroundColor = (resource: Resource) => {
    switch (resource) {
        case Resource.ANIMAL:
            return 'brown';
        case Resource.ASTEROID:
            return 'black';
        case Resource.CAMP:
            return 'lightbrown';
        case Resource.CARD:
            return 'black';
        case Resource.ENERGY:
            return 'purple';
        case Resource.FLOATER:
            return 'red';
        case Resource.FIGHTER:
            return 'black';
        case Resource.HEAT:
            return 'orange';
        case Resource.MEGACREDIT:
            return 'lightgoldenrodyellow';
        case Resource.MICROBE:
            return 'white';
        case Resource.PLANT:
            return 'lightgreen';
        case Resource.SCIENCE:
            return 'darkgray';
        case Resource.STEEL:
            return '#EBA980';
        case Resource.TITANIUM:
            return 'black';
    }
};
