import {createContext} from 'react';
import {Tag} from '../constants/card-types';
import {Resource} from '../constants/resource';
import {Card} from '../models/card';
import {RootState, PlayerState} from '../reducer';
import {getLoggedInPlayer} from '../selectors/players';
import {MinimumProductions} from '../constants/game';
import {Location} from '../constants/board';

import {
    payToPlayCard,
    decreaseProduction,
    increaseProduction,
    removeResource,
    increaseParameter,
    gainResource,
    moveCardFromHandToPlayArea
} from '../actions';
import {Parameter} from '../constants/board';

function canAfford(card: Card, state: RootState) {
    const player = getLoggedInPlayer(state);
    let {cost = 0} = card;

    const isBuildingCard = card.tags.some(tag => tag === Tag.BUILDING);
    if (isBuildingCard) {
        cost -= player.exchangeRates[Resource.STEEL] * player.resources[Resource.STEEL];
    }

    const isSpaceCard = card.tags.some(tag => tag === Tag.SPACE);
    if (isSpaceCard) {
        cost -= player.exchangeRates[Resource.TITANIUM] * player.resources[Resource.TITANIUM];
    }

    const {discounts} = player;

    cost -= discounts.card;

    for (const tag of card.tags) {
        cost -= discounts.tags[tag] || 0;
    }

    for (const tag of [...new Set(card.tags)]) {
        cost -= discounts.cards[tag] || 0;
    }

    cost -= discounts.nextCardThisGeneration;

    return cost <= player.resources[Resource.MEGACREDIT];
}

function canPlayCardWithGlobalParameters(card: Card, state: RootState) {
    const {requiredGlobalParameter} = card;
    if (!requiredGlobalParameter) return true;

    const {type, min = -Infinity, max = Infinity} = requiredGlobalParameter;

    const value = state.common.parameters[type];

    return value >= min && value <= max;
}

function doesPlayerHaveRequiredTags(card: Card, state: RootState) {
    const player = getLoggedInPlayer(state);

    for (const tag in card.requiredTags) {
        const requiredAmount = card.requiredTags[tag];

        const playerTags = player.playedCards.flatMap(card => card.tags);

        return playerTags.filter(t => t === tag).length >= requiredAmount;
    }

    return true;
}

function doesPlayerHaveRequiredResources(card: Card, state: RootState) {
    const player = getLoggedInPlayer(state);

    for (const resource in card.requiredResources) {
        const requiredAmount = card.requiredResources[resource];

        const playerAmount = player.resources[resource];

        return playerAmount >= requiredAmount;
    }

    return true;
}

function meetsProductionRequirements(card: Card, state: RootState) {
    const player = getLoggedInPlayer(state);

    const {requiredProduction, decreaseProduction, decreaseAnyProduction} = card;

    if (requiredProduction && player.productions[requiredProduction] < requiredProduction) {
        return false;
    }

    for (const production in decreaseProduction) {
        if (
            player.productions[production] - decreaseProduction[production] <
            MinimumProductions[production]
        ) {
            return false;
        }
    }

    for (const production in decreaseAnyProduction) {
        for (const p of state.players) {
            if (
                p.productions[production] - decreaseProduction[production] <
                MinimumProductions[production]
            ) {
                return false;
            }
        }
    }

    return true;
}

function meetsTilePlacementRequirements(card: Card, state: RootState): boolean {
    if (!card.tilePlacements) return true;

    for (const tilePlacement of card.tilePlacements) {
        if (!tilePlacement.isRequired || !tilePlacement.location) continue;

        const location = tilePlacement.location;
        switch (location as Location) {
            case Location.CITY_ADJACENT:
                // getAllCitiesOnMars(board).forEach(cityLocation => {
                //     return getAdjacentHexes(cityLocation).some(l => l.isEmpty && l.isNonReserved)
                // })
                continue;
            case Location.DOUBLE_CITY_ADJACENT:
            // getAllCitiesOnMars(board).forEach(() => {
            // const adjacentHexes = getAdjacentHexes(cityLocation).forEach(adjacentHexToCity => {
            // return true if getAdjacentHexes(adjacentHexToCity) contains 2 cities and is non reserved
            // });
            // })
            case Location.GREENERY_ADJACENT:
            // getAllGreeneries(board).forEach(() => {
            //     return getAdjacentHexes(greeneryLocation).some(l => l.isEmpty && l.isNonReserved)
            // })
            case Location.ISOLATED:
                // board.allLocations.some(location => getAjdacentHexes(location).every(adj => adj.isEmpty))
                // Only noctis can go on noctis
                continue;
            case Location.NON_RESERVED:
            // board.allLocations.some(location => location.isNonReserved)
            case Location.NOT_RESERVED_FOR_OCEAN:
            // board.allLocations.some(location => location.isNonReserved)
            case Location.VOLCANIC:
            // getVolcanicTiles(board).some(location => location.isEmpty)
            case Location.STEEL_OR_TITANIUM:
            // getSteelOrTitaniumLocations(board).some(location => location.isEmpty && isNonReserved)
            case Location.STEEL_OR_TITANIUM_PLAYER_ADJACENT:
            // getOccupiedHexesForPlayer(currentplayer, board).some(occupiedHex => {
            //     getAdjacentHex(occupiedHex).some(adj => adj.isEmpty && isNonReserved && hasSteelOrTitanium)
            // })
            case Location.RESERVED_FOR_OCEAN:
                // getReservedForOceanHexes(board).some(hex => hex.isEmpty && isNonReserved)
                break;
            case Location.PHOBOS:
            case Location.NOCTIS:
            case Location.GANYMEDE:
                // Only can be occupied using these cards
                continue;
            default:
                throw new Error('case not handled');
        }
    }

    return true;
}

function canPlayCard(card: Card, state: RootState): [boolean, string | undefined] {
    if (!canAfford(card, state)) {
        return [false, 'Cannot afford to play'];
    }

    if (!canPlayCardWithGlobalParameters(card, state)) {
        return [false, 'Global parameters not met'];
    }

    if (!doesPlayerHaveRequiredTags(card, state)) {
        return [false, 'Required tags not met'];
    }

    // Also accounts for opponent resources if applicable
    if (!doesPlayerHaveRequiredResources(card, state)) {
        return [false, 'Not enough of required resource'];
    }

    // Also accounts for opponent productions if applicable
    if (!meetsProductionRequirements(card, state)) {
        return [false, 'Does not have required production'];
    }

    if (!meetsTilePlacementRequirements(card, state)) {
        return [false, 'Cannot place tile'];
    }

    return [true, 'Good to go'];
}

function playCard(card: Card, state: RootState) {
    const playerIndex = state.loggedInPlayerIndex;
    if (card.cost) {
        this.queue.push(payToPlayCard(card, playerIndex));
    }

    for (const resource in card.decreaseProduction) {
        this.queue.push(
            decreaseProduction(resource as Resource, card.decreaseProduction[resource], playerIndex)
        );
    }

    for (const resource in card.increaseProduction) {
        this.queue.push(
            increaseProduction(resource as Resource, card.increaseProduction[resource], playerIndex)
        );
    }

    for (const resource in card.removeResources) {
        this.queue.push(
            removeResource(resource as Resource, card.removeResources[resource], playerIndex)
        );
    }

    for (const resource in card.gainResource) {
        this.queue.push(
            gainResource(resource as Resource, card.gainResource[resource], playerIndex)
        );
    }

    for (const parameter in card.increaseParameter) {
        this.queue.push(
            increaseParameter(
                parameter as Parameter,
                card.increaseParameter[parameter],
                playerIndex
            )
        );
    }

    this.queue.push(moveCardFromHandToPlayArea(card, playerIndex));
}

function processQueue(dispatch: Function) {
    while (this.queue.length > 0) {
        dispatch(this.queue.shift());
    }
}

export const ctx = {
    queue: [],
    canPlayCard,
    playCard,
    processQueue
};

export const AppContext = createContext(ctx);
