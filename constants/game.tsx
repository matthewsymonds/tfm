import {Resource} from './resource';
import {Parameter} from './board';

export enum GameStage {
    CORPORATION_SELECTION,
    ACTIVE_ROUND,
    BUY_OR_DISCARD,
    DRAFTING,
    END_OF_GAME
}

export const MAX_PARAMETERS = {
    [Parameter.TEMPERATURE]: 8,
    [Parameter.OCEAN]: 9,
    [Parameter.OXYGEN]: 14,
    [Parameter.VENUS]: 30
};

export const MIN_PARAMETERS = {
    [Parameter.TEMPERATURE]: -30,
    [Parameter.OCEAN]: 0,
    [Parameter.OXYGEN]: 0,
    [Parameter.VENUS]: 0
};

export const PARAMETER_STEPS = {
    [Parameter.TEMPERATURE]: 2,
    [Parameter.OCEAN]: 1,
    [Parameter.OXYGEN]: 2,
    [Parameter.VENUS]: 2
};

export const MinimumProductions = {
    [Resource.MEGACREDIT]: -5,
    [Resource.STEEL]: 0,
    [Resource.TITANIUM]: 0,
    [Resource.PLANT]: 0,
    [Resource.ENERGY]: 0,
    [Resource.HEAT]: 0
};
