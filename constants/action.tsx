import {Parameter, TilePlacement} from './board';
import {PropertyCounter} from './property-counter';
import {Resource, ResourceLocationType} from './resource';
import {VariableAmount} from './variable-amount';

type ResourceCounter = PropertyCounter<Resource>;
type ParameterCounter = PropertyCounter<Parameter>;

export type Amount = number | VariableAmount;

export enum ActionType {
    CARD = 'card',
    STANDARD_PROJECT = 'standardProject',
    CARD_ACTION = 'cardAction',
}

export type LookAtCardsConfig = {
    numCards: number;
    numCardsToTake?: number;
    buyCards?: boolean;
};

export interface Action {
    text?: string;
    cost?: number;
    actionType?: ActionType; // should be required
    gainResource?: ResourceCounter;
    gainResourceOption?: ResourceCounter;
    gainResourceTargetType?: ResourceLocationType;
    removeResourceSourceType?: ResourceLocationType;
    removeResource?: ResourceCounter;
    removeResourceOption?: ResourceCounter;
    stealResource?: ResourceCounter;
    stealResourceOption?: ResourceCounter;
    increaseProduction?: ResourceCounter;
    decreaseProduction?: ResourceCounter;
    decreaseAnyProduction?: ResourceCounter;
    lookAtCards?: LookAtCardsConfig;
    tilePlacements?: TilePlacement[];
    increaseParameter?: ParameterCounter;
    increaseTerraformRating?: number;
    revealAndDiscardTopCards?: number;

    // For aquifier pumping, water import from europa, rotator impacts
    acceptedPayment?: Resource[];

    choice?: Action[];

    // For UNMI
    requiresTerraformRatingIncrease?: boolean;

    // Lets you convert plants to greeneries for x less than usual (Ecoline)
    plantDiscount?: number;
}
