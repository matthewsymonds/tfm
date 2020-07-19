import {Action, Amount} from './action';
import {Parameter, TileType} from './board';
import {CardDiscounts, TagDiscounts} from './discounts';
import {Effect} from './effect';
import {PropertyCounter} from './property-counter';
import {Resource} from './resource';
import {Tag} from './tag';

export type RequiredTilePlacement = {
    type: TileType;
    currentPlayer?: boolean;
};

// The discounts config may include, recursively, any or none of these fields.
interface PartialDiscounts {
    card?: number;
    tags?: Partial<TagDiscounts>;
    cards?: Partial<CardDiscounts>;
    standardProjects?: number;
    standardProjectPowerPlant?: number;
    nextCardThisGeneration?: number;
    trade?: number;
}

export type ExchangeRates = {
    [Resource.TITANIUM]?: number;
    [Resource.STEEL]?: number;
    [Resource.HEAT]?: number;
};

export interface CardConfig extends Action {
    resources?: PropertyCounter<Resource>;
    action?: Action;
    effect?: Effect;
    // Use very rarely, in case we need multiple effects (e.g. Tharsis Republic).
    effects?: Effect[];
    // Corporations may required "first actions" (e.g. Tharsis).
    // In this scenario, the action is encoded into the corporation here, but unlike normal actions
    // (which are played immediately, or in this case "when the corporation gets played"),
    // this gets delayed until the first round.
    forcedAction?: Action;
    deck: Deck;
    storedResourceType?: Resource;
    name: string;
    tags: Tag[];
    type: CardType;
    victoryPoints?: Amount;
    requiredGlobalParameter?: RequiredGlobalParameter;
    requiredProduction?: Resource;
    requiredTags?: PropertyCounter<Tag>;
    requiredTilePlacements?: RequiredTilePlacement[];
    requiredResources?: PropertyCounter<Resource>;
    minColonies?: number;
    maxColonies?: number; // only for colonies expansion
    minTerraformRating?: number;
    discounts?: PartialDiscounts;
    exchangeRates?: ExchangeRates;
    // e.g. Inventrix
    parameterRequirementAdjustments?: PropertyCounter<Parameter>;
    // e.g. Special Design
    temporaryParameterRequirementAdjustments?: PropertyCounter<Parameter>;
}

type MinimumGlobalParameter = {
    type: Parameter;
    min: number;
    max?: undefined;
};

type MaximumGlobalParameter = {
    type: Parameter;
    min?: undefined;
    max: number;
};

export type RequiredGlobalParameter = MinimumGlobalParameter | MaximumGlobalParameter;

export type ReduxAction = {
    type: string;
    payload: any;
};

export enum Deck {
    BASIC,
    COLONIES,
    CORPORATE,
    PRELUDE,
    PROMO,
    VENUS,
}

export enum CardType {
    ACTIVE,
    AUTOMATED,
    CORPORATION,
    EVENT,
    PRELUDE,
}
