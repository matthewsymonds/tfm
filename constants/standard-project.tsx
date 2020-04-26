import {Action, VariableAmount, ActionType} from './action';
import {Resource} from './resource';
import {Parameter, TileType, PlacementRequirement} from './board';

export enum StandardProjectType {
    SELL_PATENTS = 'sellPatents',
    POWER_PLANT = 'powerPlant',
    ASTEROID = 'asteroid',
    AQUIFER = 'aquifer',
    GREENERY = 'greenery',
    CITY = 'city',
    VENUS = 'venus',
    COLONY = 'colony'
}

export interface StandardProjectAction extends Action {
    actionType: ActionType.STANDARD_PROJECT;
    cost?: number;
    type: StandardProjectType;
}

export const standardProjectActions: StandardProjectAction[] = [
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.SELL_PATENTS,
        removeResources: {
            [Resource.CARD]: VariableAmount.USER_CHOICE
        },
        gainResource: {
            [Resource.MEGACREDIT]: VariableAmount.BASED_ON_USER_CHOICE
        }
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.POWER_PLANT,
        cost: 11,
        increaseProduction: {
            [Resource.ENERGY]: 1
        }
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.ASTEROID,
        cost: 14,
        increaseParameter: {
            [Parameter.TEMPERATURE]: 1
        }
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.AQUIFER,
        cost: 18,
        tilePlacements: [
            {
                type: TileType.OCEAN,
                placementRequirement: PlacementRequirement.RESERVED_FOR_OCEAN,
                isRequired: false
            }
        ]
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.GREENERY,
        cost: 23,
        tilePlacements: [
            {
                type: TileType.GREENERY,
                placementRequirement: PlacementRequirement.GREENERY,
                isRequired: false
            }
        ]
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.CITY,
        cost: 25,
        increaseProduction: {[Resource.MEGACREDIT]: 1},
        tilePlacements: [
            {
                type: TileType.CITY,
                placementRequirement: PlacementRequirement.CITY,
                isRequired: false
            }
        ]
    }
];
