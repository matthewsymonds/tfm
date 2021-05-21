import {sample, shuffle} from 'initial-state';
import {serialize} from 'v8';
import {Action} from './action';
import {t, TileType} from './board';
import {Resource, ResourceLocationType} from './resource';

export type Colony = {
    name: string;
    // What a colony gets when anyone trades
    colonyBonus: Action;
    // What the trade fleet gets for visiting the colony (length 7)
    tradeIncome: Action[];
    // Indicates where you are on the tradeIncome track.
    // -1 initially for animals and other storable resources.
    step: number;
    // What you get for establishing a colony (length 3)
    colonyPlacementBonus: Action[];
    // Player indices
    colonies: number[];
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
};

export type SerializedColony = {
    name: string;
    step: number;
    colonies: number[];
    lastTrade?: Trade;
};

type Trade = {
    player: string;
    round: number;
};

const STARTING_STEP = 1;
const STARTING_STEP_STORABLE_RESOURCE_COLONY = -1;
const MAX_NUM_COLONIES = 3;

export const COLONIES: Colony[] = [
    {
        name: 'Callisto',
        colonyBonus: {gainResource: {[Resource.ENERGY]: 3}},
        tradeIncome: [0, 2, 3, 5, 7, 10, 13].map(quantity => ({
            gainResource: {[Resource.ENERGY]: quantity},
        })),
        step: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.ENERGY]: 1},
        }),
        colonies: [],
        planetColor: '#cc9ad0',
        borderColor: '#61244b',
        planetSize: 116,
        planetPosition: {right: 8, top: -10},
        backgroundColor: '#333',
    },
    {
        name: 'Ceres',
        colonyBonus: {gainResource: {[Resource.STEEL]: 2}},
        tradeIncome: [1, 2, 3, 4, 6, 8, 10].map(quantity => ({
            gainResource: {[Resource.STEEL]: quantity},
        })),
        step: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.STEEL]: 1},
        }),
        colonies: [],
        planetColor: '#cbcade',
        borderColor: '#34375f',
        planetSize: 24,
        planetPosition: {right: 40, top: 24},
        backgroundColor: '#333',
    },
    {
        name: 'Enceladus',
        colonyBonus: {
            gainResource: {[Resource.MICROBE]: 1},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        },
        tradeIncome: [0, 1, 2, 3, 4, 4, 5].map(quantity => ({
            gainResource: {[Resource.MICROBE]: quantity},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        })),
        step: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.MICROBE]: 3},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
        colonies: [],
        planetColor: 'moccasin',
        borderColor: 'gray',
        planetSize: 16,
        planetPosition: {right: 20, top: 20},
        backgroundColor: 'moccasin',
    },
    {
        name: 'Europa',
        colonyBonus: {gainResource: {[Resource.MEGACREDIT]: 1}},
        tradeIncome: [
            Resource.MEGACREDIT,
            Resource.MEGACREDIT,
            Resource.ENERGY,
            Resource.ENERGY,
            Resource.PLANT,
            Resource.PLANT,
            Resource.PLANT,
        ].map(resource => ({
            increaseProduction: {[resource]: 1},
        })),
        step: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            tilePlacements: [t(TileType.OCEAN)],
        }),
        colonies: [],
        planetColor: '#af7f76',
        borderColor: '#cabba2',
        planetSize: 72,
        planetPosition: {right: 20, top: 12},
        backgroundColor: '#c1815b',
        reverseBackground: true,
    },
    {
        name: 'Ganymede',
        colonyBonus: {gainResource: {[Resource.PLANT]: 1}},
        tradeIncome: [0, 1, 2, 3, 4, 5, 6].map(quantity => ({
            gainResource: {[Resource.PLANT]: quantity},
        })),
        step: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.PLANT]: 1},
        }),
        colonies: [],
        planetColor: '#afa7a7',
        borderColor: '#3d4a43',
        planetSize: 160,
        planetPosition: {right: 16, top: -35},
        backgroundColor: '#222',
    },
    {
        name: 'Io',
        colonyBonus: {gainResource: {[Resource.HEAT]: 2}},
        tradeIncome: [2, 3, 4, 6, 8, 10, 13].map(quantity => ({
            gainResource: {[Resource.HEAT]: quantity},
        })),
        step: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.HEAT]: 1},
        }),
        colonies: [],
        planetColor: '#afcc7a',
        borderColor: '#ecead7',
        planetSize: 96,
        planetPosition: {right: 8, top: 8},
        backgroundColor: '#a57664',
    },
    {
        name: 'Luna',
        colonyBonus: {gainResource: {[Resource.MEGACREDIT]: 2}},
        tradeIncome: [1, 2, 4, 7, 10, 13, 17].map(quantity => ({
            gainResource: {[Resource.MEGACREDIT]: quantity},
        })),
        step: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.MEGACREDIT]: 2},
        }),
        colonies: [],
        planetColor: '#b7b3b3',
        borderColor: '#62a1e8',
        backgroundColor: '#4d70d6',
        planetSize: 84,
        planetPosition: {right: 6, top: 6},
    },
    {
        name: 'Miranda',
        colonyBonus: {
            gainResource: {[Resource.CARD]: 1},
        },
        tradeIncome: [0, 1, 1, 2, 2, 3, 3].map(quantity => ({
            gainResource: {[Resource.ANIMAL]: quantity},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        })),
        step: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.ANIMAL]: 1},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
        colonies: [],
        planetColor: 'lightgray',
        borderColor: 'lightgray',
        backgroundColor: '#4da7de',
        planetSize: 18,
        planetPosition: {
            right: 40,
            top: 40,
        },
    },
    {
        name: 'Pluto',
        colonyBonus: {
            gainResource: {[Resource.CARD]: 1},
            removeResource: {[Resource.CARD]: 1},
        },
        tradeIncome: [0, 1, 1, 2, 2, 3, 3].map(quantity => ({
            gainResource: {[Resource.ANIMAL]: quantity},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        })),
        step: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.ANIMAL]: 1},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
        colonies: [],
        planetColor: '#845d5d',
        backgroundColor: '#b5b2b2',
        reverseBackground: true,
        borderColor: '#174256',
        planetSize: 48,
        planetPosition: {right: 40, top: 4},
    },
    {
        name: 'Titan',
        colonyBonus: {
            gainResource: {[Resource.FLOATER]: 1},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        },
        tradeIncome: [0, 1, 1, 2, 3, 3, 4].map(quantity => ({
            gainResource: {[Resource.FLOATER]: quantity},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        })),
        step: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.FLOATER]: 3},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
        colonies: [],
        planetColor: '#ab612e',
        backgroundColor: '#222',
        borderColor: '#222',
        planetSize: 160,
        planetPosition: {right: 12, top: 0},
        blur: 2,
    },
    {
        name: 'Triton',
        colonyBonus: {gainResource: {[Resource.TITANIUM]: 1}},
        tradeIncome: [0, 1, 1, 2, 3, 4, 5].map(quantity => ({
            gainResource: {[Resource.TITANIUM]: quantity},
        })),
        step: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.TITANIUM]: 3},
        }),
        colonies: [],
        borderColor: '#5a2531',
        backgroundColor: '#222',
        planetSize: 84,
        planetColor: '#80768a',
        planetPosition: {right: 16, top: 8},
        blur: 1,
    },
];
export function getStartingColonies(numPlayers: number): SerializedColony[] {
    const colonies = shuffle([...COLONIES]);
    return sample(colonies, numPlayers === 2 ? 5 : numPlayers + 2).map(colony => ({
        name: colony.name,
        step: colony.step,
        colonies: [],
    }));
}

const COLONIES_BY_NAME: {[name: string]: Colony} = {};
for (const colony of COLONIES) {
    COLONIES_BY_NAME[colony.name] = colony;
}

export function getColony(serializedColony: SerializedColony): Colony {
    const colony = COLONIES_BY_NAME[serializedColony.name];
    colony.colonies = serializedColony.colonies;
    colony.step = serializedColony.step;
    colony.lastTrade = serializedColony.lastTrade;
    return colony;
}
