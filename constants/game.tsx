import {Resource} from './resource';

export enum GameStage {
    CORPORATION_SELECTION,
    ACTIVE_ROUND,
    BUY_OR_DISCARD,
    DISCARD_THEN_DRAW,
    DRAFTING,
    END_OF_GAME
}

export const MIN_TEMP = -30;
export const MAX_TEMP = 8;

export const MIN_OCEAN = 0;
export const MAX_OCEAN = 9;

export const MIN_OXYGEN = 0;
export const MAX_OXYGEN = 14;

export const MinimumProductions = {
    [Resource.MEGACREDIT]: -5,
    [Resource.STEEL]: 0,
    [Resource.TITANIUM]: 0,
    [Resource.PLANT]: 0,
    [Resource.ENERGY]: 0,
    [Resource.HEAT]: 0
};
