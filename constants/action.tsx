import {Parameter, TilePlacement} from './board';
import {PropertyCounter} from './property-counter';
import {Resource} from './resource';
import {Tag} from './tag';

type ResourceCounter = PropertyCounter<Resource>;
type ParameterCounter = PropertyCounter<Parameter>;
type TagCounter = PropertyCounter<Tag>;

export enum VariableAmount {
    USER_CHOICE = 'userChoice',
    BASED_ON_USER_CHOICE = 'basedOnUserChoice',
    CITIES_ON_MARS = 'CITIES_ON_MARS',
    CITY_TILES_IN_PLAY = 'CITY_TILES_IN_PLAY'
}

export type Amount = number | VariableAmount;

export enum ActionType {
    CARD = 'card',
    STANDARD_PROJECT = 'standardProject',
    CARD_ACTION = 'cardAction'
}

export interface Action {
    text?: string;
    cost?: number;
    actionType?: ActionType; // should be required
    gainResource?: ResourceCounter;
    gainResourceOption?: ResourceCounter;
    removeResources?: ResourceCounter;
    removeResourceOption?: ResourceCounter;
    removeAnyResource?: ResourceCounter;
    removeAnyResourceOption?: ResourceCounter;
    increaseProduction?: ResourceCounter;
    increaseProductionOption?: ResourceCounter;
    decreaseProduction?: ResourceCounter;
    decreaseAnyProduction?: ResourceCounter;

    tilePlacements?: TilePlacement[];
    increaseParameter?: ParameterCounter;
    increaseTerraformRating?: number;

    choice?: Action[];

    // For UNMI
    requiresTerraformRatingIncrease?: boolean;
}
