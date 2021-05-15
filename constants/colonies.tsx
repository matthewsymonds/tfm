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
    startingStep: number;
    // What you get for establishing a colony (length 3)
    colonyPlacementBonus: Action[];
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
        startingStep: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.ENERGY]: 1},
        }),
    },
    {
        name: 'Ceres',
        colonyBonus: {gainResource: {[Resource.STEEL]: 2}},
        tradeIncome: [1, 2, 3, 4, 6, 8, 10].map(quantity => ({
            gainResource: {[Resource.STEEL]: quantity},
        })),
        startingStep: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.STEEL]: 1},
        }),
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
        startingStep: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.MICROBE]: 3},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
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
        startingStep: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            tilePlacements: [t(TileType.OCEAN)],
        }),
    },
    {
        name: 'Ganymede',
        colonyBonus: {gainResource: {[Resource.PLANT]: 1}},
        tradeIncome: [0, 1, 2, 3, 4, 5, 6].map(quantity => ({
            gainResource: {[Resource.PLANT]: quantity},
        })),
        startingStep: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.PLANT]: 1},
        }),
    },
    {
        name: 'Io',
        colonyBonus: {gainResource: {[Resource.HEAT]: 2}},
        tradeIncome: [2, 3, 4, 6, 8, 10, 13].map(quantity => ({
            gainResource: {[Resource.HEAT]: quantity},
        })),
        startingStep: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.HEAT]: 1},
        }),
    },
    {
        name: 'Luna',
        colonyBonus: {gainResource: {[Resource.MEGACREDIT]: 2}},
        tradeIncome: [1, 2, 4, 7, 10, 13, 17].map(quantity => ({
            gainResource: {[Resource.MEGACREDIT]: quantity},
        })),
        startingStep: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            increaseProduction: {[Resource.MEGACREDIT]: 2},
        }),
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
        startingStep: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.ANIMAL]: 1},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
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
        startingStep: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.ANIMAL]: 1},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
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
        startingStep: STARTING_STEP_STORABLE_RESOURCE_COLONY,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.FLOATER]: 3},
            gainResourceTargetType: ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
        }),
    },
    {
        name: 'Triton',
        colonyBonus: {gainResource: {[Resource.TITANIUM]: 1}},
        tradeIncome: [0, 1, 1, 2, 3, 4, 5].map(quantity => ({
            gainResource: {[Resource.TITANIUM]: quantity},
        })),
        startingStep: STARTING_STEP,
        colonyPlacementBonus: new Array<Action>(MAX_NUM_COLONIES).fill({
            gainResource: {[Resource.TITANIUM]: 3},
        }),
    },
];
