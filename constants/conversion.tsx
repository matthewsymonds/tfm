import {Action} from './action';
import {Parameter, t, TileType} from './board';
import {Resource} from './resource';

export interface Conversion extends Action {}

export const CONVERSIONS = {
    [Resource.PLANT]: {
        removeResource: {[Resource.PLANT]: 8},
        tilePlacements: [t(TileType.GREENERY)],
    },
    [Resource.HEAT]: {
        removeResource: {[Resource.HEAT]: 8},
        increaseParameter: {[Parameter.TEMPERATURE]: 1},
    },
};
