// Can appear on the board, on a card, or in a colony.
export enum Resource {
    ANIMAL = 'resourceAnimal',
    CAMP = 'resourceCamp',
    CARD = 'resourceCard',
    ENERGY = 'resourceEnerge',
    FIGHTER = 'resourceFighter',
    FLOATER = 'resourceFloater',
    HEAT = 'resourceHeat',
    MEGACREDIT = 'resourceMegacredit',
    MICROBE = 'resourceMicrobe',
    PLANT = 'resourcePlant',
    SCIENCE = 'resourceScience',
    STEEL = 'resourceSteel',
    TITANIUM = 'resourceTitanium'
}

export const getResourceSymbol = (resource: Resource) => {
    switch (resource) {
        case Resource.ANIMAL:
            return '🐶';
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

export const getResourceColor = (resource: Resource) => {
    switch (resource) {
        case Resource.ANIMAL:
            return 'brown';
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
