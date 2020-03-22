// Can appear on the board, on a card, or in a colony.
export enum Resource {
    Animal,
    Camp,
    Card,
    Energy,
    Fighter,
    Floater,
    Heat,
    Megacredit,
    Microbe,
    Plant,
    Science,
    Steel,
    Titanium
}

export const getResourceSymbol = (resource: Resource) => {
    switch (resource) {
        case Resource.Animal:
            return '🐶';
        case Resource.Camp:
            return '🏠';
        case Resource.Card:
            return '🌎';
        case Resource.Energy:
            return '⚡';
        case Resource.Fighter:
            return '🚀';
        case Resource.Floater:
            return '☁️';
        case Resource.Heat:
            return '🔥';
        case Resource.Megacredit:
            return '€';
        case Resource.Microbe:
            return '🐛';
        case Resource.Plant:
            return '🍂';
        case Resource.Science:
            return '⚛️';
        case Resource.Steel:
            return '🔨';
        case Resource.Titanium:
            return '☆';
    }
};

export const getResourceColor = (resource: Resource) => {
    switch (resource) {
        case Resource.Animal:
            return 'brown';
        case Resource.Camp:
            return 'brown';
        case Resource.Card:
            return 'orange';
        case Resource.Energy:
            return 'white';
        case Resource.Floater:
            return 'gray';
        case Resource.Fighter:
            return 'gray';
        case Resource.Heat:
            return 'gold';
        case Resource.Megacredit:
            return 'gold';
        case Resource.Microbe:
            return 'green';
        case Resource.Plant:
            return 'darkgreen';
        case Resource.Science:
            return 'white';
        case Resource.Steel:
            return 'brown';
        case Resource.Titanium:
            return 'yellow';
    }
};

export const getResourceBackgroundColor = (resource: Resource) => {
    switch (resource) {
        case Resource.Animal:
            return 'brown';
        case Resource.Camp:
            return 'lightbrown';
        case Resource.Card:
            return 'black';
        case Resource.Energy:
            return 'purple';
        case Resource.Floater:
            return 'red';
        case Resource.Fighter:
            return 'black';
        case Resource.Heat:
            return 'orange';
        case Resource.Megacredit:
            return 'lightgoldenrodyellow';
        case Resource.Microbe:
            return 'white';
        case Resource.Plant:
            return 'lightgreen';
        case Resource.Science:
            return 'darkgray';
        case Resource.Steel:
            return '#EBA980';
        case Resource.Titanium:
            return 'black';
    }
};
