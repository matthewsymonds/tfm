import {Parameter, TilePlacement} from './board';
import {PropertyCounter, NumericPropertyCounter} from './property-counter';
import {Resource, ResourceLocationType} from './resource';
import {VariableAmount} from './variable-amount';
import {Tag} from './tag';

type ResourceCounter = PropertyCounter<Resource>;

// Exclude oceans from this configuration.
// We'll use the tilePlacement property to place oceans instead.
// This lets us specify placement requirements (like on an area not reserved for ocean)
type ParameterExcludingOcean = Parameter.OXYGEN | Parameter.TEMPERATURE | Parameter.VENUS;

// Only allow parameter increases by numeric amounts.
// This simplifies implementation of parameter bonus interactions e.g. Giant Ice Asteroid.
export type ParameterCounter = NumericPropertyCounter<ParameterExcludingOcean>;

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
    increaseProduction?: ResourceCounter;
    increaseProductionOption?: PropertyCounter<Resource>;
    duplicateProduction?: Tag;
    decreaseProduction?: ResourceCounter;
    decreaseAnyProduction?: ResourceCounter;
    lookAtCards?: LookAtCardsConfig;
    tilePlacements?: TilePlacement[];
    increaseParameter?: ParameterCounter;
    increaseTerraformRating?: Amount;
    revealAndDiscardTopCards?: number;

    // For aquifier pumping, water import from europa, rotator impacts
    acceptedPayment?: Resource[];

    choice?: Action[];

    // For UNMI
    requiresTerraformRatingIncrease?: boolean;

    // Lets you convert plants to greeneries for x less than usual (Ecoline)
    plantDiscount?: number;
}
