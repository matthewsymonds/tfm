import {Resource} from './resource';
import {TileType, TilePlacement, Parameter} from './board';
import {MoveType} from './moves';
import {Action, ActionType, Amount} from './action';
import {Effect} from './effect';
import {Tag} from './tag';
import {PropertyCounter} from './property-counter';
import {Discounts, CardDiscounts, TagDiscounts} from './discounts';

export type RequiredTilePlacements = {
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

export interface CardConfig extends Action {
    resources?: PropertyCounter<Resource>;
    action?: Action;
    effect?: Effect;
    // Use very rarely, in case we need multiple effects (e.g. Tharsis Republic).
    effects?: Effect[];
    // With corporations, ensures that we count the first forced action of the game.
    forcedAction?: boolean;
    deck: Deck;
    storedResourceType?: Resource;
    name: string;
    tags: Tag[];
    type: CardType;
    victoryPoints?: Amount;
    requiredGlobalParameter?: RequiredGlobalParameter;
    requiredProduction?: Resource;
    requiredTags?: PropertyCounter<Tag>;
    requiredTilePlacements?: RequiredTilePlacements[];
    requiredResources?: PropertyCounter<Resource>;
    minColonies?: number;
    maxColonies?: number; // only for colonies expansion
    minTerraformRating?: number;
    discounts?: PartialDiscounts;
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
