import {Resource} from './resource';
import {Action} from './action';
import {t, TileType, Parameter} from './board';

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
