import {Resource} from './resource';
import {TilePlacement, Parameter} from './board';
import {Tag} from './tag';
import {PropertyCounter} from './property-counter';

type ResourceCounter = PropertyCounter<Resource>;
type ParameterCounter = PropertyCounter<Parameter>;
type TagCounter = PropertyCounter<Tag>;

export enum VariableAmount {
    USER_CHOICE = 'userChoice',
    BASED_ON_USER_CHOICE = 'basedOnUserChoice',
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
    removeAnyResource?: ResourceCounter;
    removeAnyResourceOption?: ResourceCounter;
    increaseProduction?: ResourceCounter;
    increaseProductionOption?: ResourceCounter;
    decreaseProduction?: ResourceCounter;
    decreaseAnyProduction?: ResourceCounter;

    tilePlacements?: TilePlacement[];
    increaseParameter?: ParameterCounter;
    increaseTerraformRating?: number;
}
