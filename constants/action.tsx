import {PlaceColony} from 'actions';
import {Parameter, TilePlacement, TileType} from './board';
import {CardSelectionCriteria} from './card-selection-criteria';
import {ConditionAmount} from './conditional-amount';
import {ContestAmount} from './contest-amount';
import {OperationAmount} from './operation-amount';
import {ProductionAmount} from './production-amount';
import {NumericPropertyCounter, PropertyCounter} from './property-counter';
import {ResourceLocationType} from './resource';
import {ResourceAmount} from './resource-amount';
import {Resource} from './resource-enum';
import {Tag, TagAmount} from './tag';
import {VariableAmount} from './variable-amount';

export type ResourceCounter = PropertyCounter<Resource>;

// Exclude oceans from this configuration.
// We'll use the tilePlacement property to place oceans instead.
// This lets us specify placement requirements (like on an area not reserved for ocean)
type ParameterExcludingOcean = Parameter.OXYGEN | Parameter.TEMPERATURE | Parameter.VENUS;

// Only allow parameter increases by numeric amounts.
// This simplifies implementation of parameter bonus interactions e.g. Giant Ice Asteroid.
export type ParameterCounter = NumericPropertyCounter<ParameterExcludingOcean>;

export type Payment = NumericPropertyCounter<Resource>;

export type Amount =
    | number
    | VariableAmount
    | TagAmount
    | OperationAmount
    | ConditionAmount
    | ResourceAmount
    | ProductionAmount
    | ContestAmount;

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

export type PlayCardParams = {
    ignoreGlobalRequirements?: boolean;
    discount?: number;
};

export interface ActionWithoutSteps {
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
    increaseProductionOption?: ResourceCounter;
    duplicateProduction?: Tag;
    decreaseProduction?: ResourceCounter;
    decreaseAnyProduction?: ResourceCounter;
    lookAtCards?: LookAtCardsConfig;
    tilePlacements?: TilePlacement[];
    increaseParameter?: ParameterCounter;
    decreaseParameter?: ParameterCounter;
    increaseTerraformRating?: Amount;
    decreaseTerraformRating?: Amount;
    revealAndDiscardTopCards?: number;

    // For aquifier pumping, water import from europa, rotator impacts
    acceptedPayment?: Resource[];

    choice?: Action[];

    // For UNMI
    requiresTerraformRatingIncrease?: boolean;

    // Lets you convert plants to greeneries for x less than usual (Ecoline)
    plantDiscount?: number;

    // For sponsored academies
    opponentsGainResource?: ResourceCounter;

    revealTakeAndDiscard?: PropertyCounter<CardSelectionCriteria>;

    // For manutech
    gainResourceWhenIncreaseProduction?: number;

    // For viron
    useBlueCardActionAlreadyUsedThisGeneration?: boolean;

    // for robinson industries
    increaseLowestProduction?: number;

    // See Valley Trust
    choosePrelude?: number;

    // Vitor
    fundAward?: boolean;

    placeColony?: PlaceColony;

    // When you trade, you may first increase that Colony Tile Track 1 step,
    increaseColonyTileTrackRange?: number;

    increaseAndDecreaseColonyTileTracks?: number;

    tradeForFree?: boolean;
    gainTradeFleet?: boolean;

    putAdditionalColonyTileIntoPlay?: boolean;
    gainAllColonyBonuses?: boolean;

    // From turmoil Global Event: "Sponsored Products" (All cards with resources on them gain 1 resource.)
    increaseStoredResourceAmount?: number;

    // Used for lobbying (1), cultural metropolis (2)
    placeDelegatesInOneParty?: number;

    // Extra influence.
    increasedInfluence?: number;

    // Recruitment
    exchangeNeutralNonLeaderDelegate?: boolean;

    // Banned Delegate
    removeNonLeaderDelegate?: boolean;

    // vote of no confidence
    exchangeChairman?: boolean;

    oceanAdjacencyBonus?: number;

    gainStandardResources?: Amount;

    removeTile?: TileType;
}

export interface Action extends ActionWithoutSteps {
    steps?: ActionWithoutSteps[];
}
