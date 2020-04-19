import {Resource} from './resource';
import {TileType, TilePlacement, Parameter} from './board';
import {MoveType} from './moves';
import {Action} from './action';
import {Effect} from './effect';
import {Tag} from './tag';
import {PropertyCounter} from './property-counter';

export interface CardConfig extends Action {
    resources?: PropertyCounter<Resource>;
    action?: Action;
    effect?: Effect;
    deck: Deck;
    storedResourceType?: Resource;
    name: string;
    tags: Tag[];
    type: CardType;
    victoryPoints?: number;
    requiredGlobalParameter?: RequiredGlobalParameter;
    requiredProduction?: Resource;
    requiredTags?: PropertyCounter<Tag>;
    requiredResources?: PropertyCounter<Resource>;
    cost?: number;
    minColonies?: number;
    maxColonies?: number; // only for colonies expansion
    minTerraformRating?: number;
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
    VENUS
}

export enum CardType {
    ACTIVE,
    AUTOMATED,
    CORPORATION,
    EVENT,
    PRELUDE
}
