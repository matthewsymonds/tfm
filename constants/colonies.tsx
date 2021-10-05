import {sample, shuffle} from 'initial-state';
import {Action} from './action';
import {t, TileType} from './board';
import {ResourceLocationType} from './resource';
import {Resource} from './resource-enum';

type TradeIncomeQuantity = {
    // For display purposes
    tradeIncomeQuantities: number[];
};
type TradeIncomeResource = {
    // For display purposes
    tradeIncomeResources: Resource[];
};

export type AcceptedTradePayment = {
    resource: Resource;
    quantity: number;
};

export const ACCEPTED_TRADE_PAYMENT: AcceptedTradePayment[] = [
    {resource: Resource.MEGACREDIT, quantity: 9},
    {resource: Resource.ENERGY, quantity: 3},
    {resource: Resource.TITANIUM, quantity: 3},
];

type TradeIncomeDisplay = TradeIncomeQuantity | TradeIncomeResource;

export type Colony = {
    name: string;
    // What a colony gets when anyone trades
    colonyBonus: Action;
    // What the trade fleet gets for visiting the colony (length 7)
    tradeIncome: Action[];
    // -1 initially for animals and other storable resources.
    // What you get for establishing a colony (length 3)
    colonyPlacementBonus: Action[];
    lastTrade?: Trade;
    planetColor: string;
    borderColor: string;
    planetSize: number;
    planetPosition: {
        right: number;
        top: number;
    };
    blur?: number;
    reverseBackground?: boolean;
    backgroundColor: string;
    offlineUntilResource?: Resource;
} & TradeIncomeDisplay;

export type SerializedColony = {
    name: string;
    // Where is the gray cube?
    step: number;
    // Colonies placed (each number is a player index, up to 3 colonies allowed)
    colonies: number[];
    lastTrade?: Trade;
};

type Trade = {
    player: string;
    round: number;
};

export const STARTING_STEP = 1;
export const STARTING_STEP_STORABLE_RESOURCE_COLONY = -1;
const MAX_NUM_COLONIES = 3;

export const COLONIES: Colony[] = [];

let tradeIncomeQuantities: number[] | Resource[] = [0, 2, 3, 5, 7, 10, 13];

COLONIES.push({
    name: 'Callisto',
    colonyBonus: {gainResource: {[Resource.ENERGY]: 3}},
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.ENERGY]: quantity},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        increaseProduction: {[Resource.ENERGY]: 1},
    }),
    planetColor: '#cc9ad0',
    borderColor: '#61244b',
    planetSize: 116,
    planetPosition: {right: 8, top: -10},
    backgroundColor: '#222',
});

tradeIncomeQuantities = [1, 2, 3, 4, 6, 8, 10];

COLONIES.push({
    name: 'Ceres',
    colonyBonus: {gainResource: {[Resource.STEEL]: 2}},
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.STEEL]: quantity},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        increaseProduction: {[Resource.STEEL]: 1},
    }),
    planetColor: '#cbcade',
    borderColor: '#34375f',
    planetSize: 24,
    planetPosition: {right: 40, top: 24},
    backgroundColor: '#222',
});

tradeIncomeQuantities = [0, 1, 2, 3, 4, 4, 5];

COLONIES.push({
    name: 'Enceladus',
    colonyBonus: {
        gainResource: {[Resource.MICROBE]: 1},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    },
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.MICROBE]: quantity},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        gainResource: {[Resource.MICROBE]: 3},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    }),
    planetColor: 'moccasin',
    borderColor: 'gray',
    planetSize: 16,
    planetPosition: {right: 20, top: 20},
    backgroundColor: 'moccasin',
    offlineUntilResource: Resource.MICROBE,
});

tradeIncomeQuantities = [
    Resource.MEGACREDIT,
    Resource.MEGACREDIT,
    Resource.ENERGY,
    Resource.ENERGY,
    Resource.PLANT,
    Resource.PLANT,
    Resource.PLANT,
];

COLONIES.push({
    name: 'Europa',
    tradeIncomeResources: tradeIncomeQuantities,
    colonyBonus: {gainResource: {[Resource.MEGACREDIT]: 1}},
    tradeIncome: tradeIncomeQuantities.map(resource => ({
        increaseProduction: {[resource]: 1},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        tilePlacements: [t(TileType.OCEAN)],
    }),
    planetColor: '#af7f76',
    borderColor: '#cabba2',
    planetSize: 72,
    planetPosition: {right: 20, top: 12},
    backgroundColor: '#bf755a',
    reverseBackground: true,
});

tradeIncomeQuantities = [0, 1, 2, 3, 4, 5, 6];

COLONIES.push({
    name: 'Ganymede',
    colonyBonus: {gainResource: {[Resource.PLANT]: 1}},
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.PLANT]: quantity},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        increaseProduction: {[Resource.PLANT]: 1},
    }),
    planetColor: '#afa7a7',
    borderColor: '#3d4a43',
    planetSize: 160,
    planetPosition: {right: 16, top: -35},
    backgroundColor: '#222',
});

tradeIncomeQuantities = [2, 3, 4, 6, 8, 10, 13];

COLONIES.push({
    name: 'Io',
    colonyBonus: {gainResource: {[Resource.HEAT]: 2}},
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.HEAT]: quantity},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        increaseProduction: {[Resource.HEAT]: 1},
    }),
    planetColor: '#afcc7a',
    borderColor: '#ecead7',
    planetSize: 96,
    planetPosition: {right: 8, top: 8},
    backgroundColor: '#a57664',
});

tradeIncomeQuantities = [1, 2, 4, 7, 10, 13, 17];

COLONIES.push({
    name: 'Luna',
    colonyBonus: {gainResource: {[Resource.MEGACREDIT]: 2}},
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.MEGACREDIT]: quantity},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        increaseProduction: {[Resource.MEGACREDIT]: 2},
    }),
    planetColor: '#b7b3b3',
    borderColor: '#62a1e8',
    backgroundColor: '#4d70d6',
    planetSize: 84,
    planetPosition: {right: 6, top: 6},
});

tradeIncomeQuantities = [0, 1, 1, 2, 2, 3, 3];

COLONIES.push({
    name: 'Miranda',
    colonyBonus: {
        gainResource: {[Resource.CARD]: 1},
    },
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.ANIMAL]: quantity},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        gainResource: {[Resource.ANIMAL]: 1},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    }),
    planetColor: 'lightgray',
    borderColor: 'lightgray',
    backgroundColor: '#4da7de',
    planetSize: 18,
    planetPosition: {
        right: 40,
        top: 40,
    },
    offlineUntilResource: Resource.ANIMAL,
});

tradeIncomeQuantities = [0, 1, 1, 2, 2, 3, 4];

COLONIES.push({
    name: 'Pluto',
    colonyBonus: {
        gainResource: {[Resource.CARD]: 1},
        removeResource: {[Resource.CARD]: 1},
    },
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.CARD]: quantity},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        gainResource: {[Resource.CARD]: 2},
    }),
    planetColor: '#845d5d',
    backgroundColor: '#b5b2b2',
    reverseBackground: true,
    borderColor: '#174256',
    planetSize: 48,
    planetPosition: {right: 40, top: 4},
});

tradeIncomeQuantities = [0, 1, 1, 2, 3, 3, 4];

COLONIES.push({
    name: 'Titan',
    colonyBonus: {
        gainResource: {[Resource.FLOATER]: 1},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    },
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.FLOATER]: quantity},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        gainResource: {[Resource.FLOATER]: 3},
        gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
    }),
    planetColor: '#ab612e',
    backgroundColor: '#222',
    borderColor: '#222',
    planetSize: 160,
    planetPosition: {right: 12, top: 0},
    blur: 2,
    offlineUntilResource: Resource.FLOATER,
});

tradeIncomeQuantities = [0, 1, 1, 2, 3, 4, 5];

COLONIES.push({
    name: 'Triton',
    colonyBonus: {gainResource: {[Resource.TITANIUM]: 1}},
    tradeIncomeQuantities,
    tradeIncome: tradeIncomeQuantities.map(quantity => ({
        gainResource: {[Resource.TITANIUM]: quantity},
    })),
    colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
        gainResource: {[Resource.TITANIUM]: 3},
    }),
    borderColor: '#5a2531',
    backgroundColor: '#222',
    planetSize: 84,
    planetColor: '#80768a',
    planetPosition: {right: 16, top: 8},
    blur: 1,
});

export function getSerializedColony(colony: Colony): SerializedColony {
    return {
        name: colony.name,
        step: colony.offlineUntilResource ? STARTING_STEP_STORABLE_RESOURCE_COLONY : STARTING_STEP,
        colonies: [],
    };
}

export function getStartingColonies(numPlayers: number): SerializedColony[] {
    const colonies = shuffle([...COLONIES]);
    return sample(colonies, numPlayers === 2 ? 5 : numPlayers + 2).map(getSerializedColony);
}

const COLONIES_BY_NAME: {[name: string]: Colony} = {};
for (const colony of COLONIES) {
    COLONIES_BY_NAME[colony.name] = colony;
}

export function getColony(serializedColony: SerializedColony): Colony {
    const colony = COLONIES_BY_NAME[serializedColony.name];
    return colony;
}
