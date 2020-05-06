import {Parameter, TilePlacement} from './board';
import {PropertyCounter} from './property-counter';
import {Resource, ResourceLocationType} from './resource';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

type ResourceCounter = PropertyCounter<Resource>;
type ParameterCounter = PropertyCounter<Parameter>;
type TagCounter = PropertyCounter<Tag>;

export type Amount = number | VariableAmount;

export enum ActionType {
    CARD = 'card',
    STANDARD_PROJECT = 'standardProject',
    CARD_ACTION = 'cardAction',
}

export interface Action {
    text?: string;
    cost?: number;
    actionType?: ActionType; // should be required
    gainResource?: ResourceCounter;
    gainResourceOption?: ResourceCounter;
    gainResourceTargetType?: ResourceLocationType;
    removeResourceSourceType?: ResourceLocationType;
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
    revealTopCards?: number;

    choice?: Action[];

    // For UNMI
    requiresTerraformRatingIncrease?: boolean;
}
