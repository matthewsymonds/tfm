import {Resource} from './resource';
import {Action} from './action';
import {t, TileType, Parameter} from './board';

export interface Conversion extends Action {
    cost: number;
    resource: Resource;
    name: string;
}

export const CONVERSIONS = {
    [Resource.PLANT]: {
        removeResources: {[Resource.PLANT]: 8},
        tilePlacements: [t(TileType.GREENERY)],
    },
    [Resource.HEAT]: {
        removeResources: {[Resource.HEAT]: 8},
        increaseParameter: {[Parameter.TEMPERATURE]: 1},
    },
};
