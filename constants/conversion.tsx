import {Action} from './action';
import {Parameter, t, TileType} from './board';
import {PropertyCounter} from './property-counter';
import {Resource} from './resource-enum';
import {VariableAmount} from './variable-amount';

export interface Conversion extends Action {
    resourceToRemove: Resource;
    removeResource: PropertyCounter<Resource>;
}

export const CONVERSIONS: {[key in Resource]?: Conversion} = {
    [Resource.PLANT]: {
        resourceToRemove: Resource.PLANT,
        removeResource: {[Resource.PLANT]: VariableAmount.PLANT_CONVERSION_AMOUNT},
        tilePlacements: [t(TileType.GREENERY)],
    },
    [Resource.HEAT]: {
        resourceToRemove: Resource.HEAT,
        removeResource: {[Resource.HEAT]: 8},
        increaseParameter: {[Parameter.TEMPERATURE]: 1},
    },
};
