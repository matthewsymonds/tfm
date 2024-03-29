import {GameState} from 'reducer';
import {Action, ActionType} from './action';
import {Parameter, PlacementRequirement, TileType} from './board';
import {Deck} from './card-types';
import {Resource} from './resource-enum';
import {VariableAmount} from './variable-amount';

export enum StandardProjectType {
    SELL_PATENTS = 'sellPatents',
    POWER_PLANT = 'powerPlant',
    ASTEROID = 'asteroid',
    AQUIFER = 'aquifer',
    GREENERY = 'greenery',
    CITY = 'city',
    VENUS = 'venus',
    COLONY = 'colony',
}

export interface NonSellPatentsStandardProjectAction extends Action {
    actionType: ActionType.STANDARD_PROJECT;
    cost: number;
    type: Exclude<StandardProjectType, StandardProjectType.SELL_PATENTS>;
}

export interface SellPatentsStandardProjectAction extends Action {
    actionType: ActionType.STANDARD_PROJECT;
    type: StandardProjectType.SELL_PATENTS;
}

export type StandardProjectAction =
    | NonSellPatentsStandardProjectAction
    | SellPatentsStandardProjectAction;

export const standardProjectActions: StandardProjectAction[] = [
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.SELL_PATENTS,
        removeResource: {
            [Resource.CARD]: VariableAmount.USER_CHOICE,
        },
        gainResource: {
            [Resource.MEGACREDIT]: VariableAmount.BASED_ON_USER_CHOICE,
        },
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.POWER_PLANT,
        cost: 11,
        increaseProduction: {
            [Resource.ENERGY]: 1,
        },
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.ASTEROID,
        cost: 14,
        increaseParameter: {
            [Parameter.TEMPERATURE]: 1,
        },
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.AQUIFER,
        cost: 18,
        tilePlacements: [
            {
                type: TileType.OCEAN,
                placementRequirement: PlacementRequirement.RESERVED_FOR_OCEAN,
                isRequired: false,
            },
        ],
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.GREENERY,
        cost: 23,
        tilePlacements: [
            {
                type: TileType.GREENERY,
                placementRequirement: PlacementRequirement.GREENERY,
                isRequired: true,
            },
        ],
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
                isRequired: true,
            },
        ],
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.VENUS,
        cost: 15,
        increaseParameter: {[Parameter.VENUS]: 1},
    },
    {
        actionType: ActionType.STANDARD_PROJECT,
        type: StandardProjectType.COLONY,
        cost: 17,
        placeColony: {mayBeRepeatColony: false},
    },
];

export function getStandardProjects(
    state: GameState
): Array<StandardProjectAction> {
    const venus = state.options?.decks.includes(Deck.VENUS);
    const colonies = state.options?.decks.includes(Deck.VENUS);

    let actions = [...standardProjectActions];

    if (!venus) {
        actions = actions.filter(
            action => action.type !== StandardProjectType.VENUS
        );
    }

    if (!colonies) {
        actions = actions.filter(
            action => action.type !== StandardProjectType.COLONY
        );
    }

    return actions;
}
