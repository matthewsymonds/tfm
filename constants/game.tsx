import {colors} from 'components/ui';
import {Parameter} from './board';
import {Resource} from './resource';

export enum GameStage {
    CORPORATION_SELECTION = 'corporationSelection',
    ACTIVE_ROUND = 'activeRound',
    DRAFTING = 'drafting',
    BUY_OR_DISCARD = 'buyOrDiscard',
    END_OF_GAME = 'endOfGame',
    GREENERY_PLACEMENT = 'greeneryPlacement',
}

export const MAX_PARAMETERS = {
    [Parameter.TEMPERATURE]: 8,
    [Parameter.OCEAN]: 9,
    [Parameter.OXYGEN]: 14,
    [Parameter.VENUS]: 30,
};

export const MIN_PARAMETERS = {
    [Parameter.TEMPERATURE]: -30,
    [Parameter.OCEAN]: 0,
    [Parameter.OXYGEN]: 0,
    [Parameter.VENUS]: 0,
};

export const PARAMETER_STEPS = {
    [Parameter.TEMPERATURE]: 2,
    [Parameter.OCEAN]: 1,
    [Parameter.OXYGEN]: 1,
    [Parameter.VENUS]: 2,
};

export const MinimumProductions = {
    [Resource.MEGACREDIT]: -5,
    [Resource.STEEL]: 0,
    [Resource.TITANIUM]: 0,
    [Resource.PLANT]: 0,
    [Resource.ENERGY]: 0,
    [Resource.HEAT]: 0,
};

export const PLAYER_COLORS = Object.values(colors.PLAYER_COLORS);

export const PLAYER_BG_COLORS = Object.values(colors.PLAYER_BG_COLORS);
