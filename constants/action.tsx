import {Resource} from './resource';
import {TilePlacement, Parameter} from './board';
import {Tag} from './tag';
import {PropertyCounter} from './property-counter';

type ResourceCounter = PropertyCounter<Resource>;
type ParameterCounter = PropertyCounter<Parameter>;
type TagCounter = PropertyCounter<Tag>;

export interface Action {
    text?: string;
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
