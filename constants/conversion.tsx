import {Action} from './action';
import {Parameter, t, TileType} from './board';
import {PropertyCounter} from './property-counter';
import {ResourceLocationType} from './resource';
import {Resource} from './resource-enum';
import {VariableAmount} from './variable-amount';

export type ConversionName =
    | 'Plants to Greenery'
    | 'Heat to Temperature'
    | 'Heat to Megacredit (Helion)'
    | 'Floaters to Heat (Stormcraft)';
export interface Conversion extends Action {
    name: ConversionName;
    resourceToRemove: Resource;
    removeResource: PropertyCounter<Resource>;
    removeResourceSourceType?: ResourceLocationType;
    shouldIncrementActionCounter: boolean;
}

export const DEFAULT_CONVERSIONS: {[key in Resource]?: Conversion} = {
    [Resource.PLANT]: {
        name: 'Plants to Greenery',
        resourceToRemove: Resource.PLANT,
        removeResource: {
            [Resource.PLANT]: VariableAmount.PLANT_CONVERSION_AMOUNT,
        },
        tilePlacements: [t(TileType.GREENERY)],
        shouldIncrementActionCounter: true,
    },
    [Resource.HEAT]: {
        name: 'Heat to Temperature',
        resourceToRemove: Resource.HEAT,
        removeResource: {[Resource.HEAT]: 8},
        increaseParameter: {[Parameter.TEMPERATURE]: 1},
        shouldIncrementActionCounter: true,
    },
};

export const HELION_CONVERSION: Conversion = {
    name: 'Heat to Megacredit (Helion)',
    resourceToRemove: Resource.HEAT,
    removeResource: {[Resource.HEAT]: VariableAmount.USER_CHOICE},
    gainResource: {[Resource.MEGACREDIT]: VariableAmount.BASED_ON_USER_CHOICE},
    shouldIncrementActionCounter: false,
};

export const STORMCRAFT_CONVERSION: Conversion = {
    name: 'Floaters to Heat (Stormcraft)',
    resourceToRemove: Resource.FLOATER,
    removeResourceSourceType: ResourceLocationType.OWN_CORPORATION,
    removeResource: {[Resource.FLOATER]: VariableAmount.USER_CHOICE},
    gainResource: {[Resource.HEAT]: VariableAmount.DOUBLE_BASED_ON_USER_CHOICE},
    shouldIncrementActionCounter: false,
};
