import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {StandardProjectType} from 'constants/standard-project';

export enum GameActionType {
    CARD = 'card',
    CARD_ACTION = 'cardAction',
    AWARD = 'award',
    MILESTONE = 'milestone',
    CONVERSION = 'conversion',
    STANDARD_PROJECT = 'standardProject',
    TRADE = 'trade',
    SKIP = 'skip',
    PASS = 'pass',
    GAME_UPDATE = 'gameUpdate', // e.g. "Generation 1, Turn 2"
    PLAYER_RESOURCE_UPDATE = 'playerResourceUpdate', // e.g. "Helion now has 92 MC, 12 heat" etc.
    GENERIC_PLAYER_EFFECT = 'genericPlayerEffect',
}

type SharedGameAction = {
    playerIndex: number;
};

export type GameActionPlayCard = SharedGameAction & {
    actionType: GameActionType.CARD;
    card: {name: string};
    payment: NumericPropertyCounter<Resource>;
};

export type GameActionPlayCardAction = SharedGameAction & {
    actionType: GameActionType.CARD_ACTION;
    card: {name: string};
    payment?: NumericPropertyCounter<Resource> | null;
    choiceIndex?: number;
};

export type GameActionFundAward = SharedGameAction & {
    actionType: GameActionType.AWARD;
    award: string;
    payment: NumericPropertyCounter<Resource>;
};

export type GameActionConvertResources = SharedGameAction & {
    actionType: GameActionType.CONVERSION;
    conversionType: 'heat' | 'plants';
};

export type GameActionClaimMilestone = SharedGameAction & {
    actionType: GameActionType.MILESTONE;
    milestone: string;
    payment: NumericPropertyCounter<Resource>;
};

export type GameActionStandardProject = SharedGameAction & {
    actionType: GameActionType.STANDARD_PROJECT;
    standardProject: StandardProjectType;
    payment: NumericPropertyCounter<Resource>;
};

export type GameActionTrade = SharedGameAction & {
    actionType: GameActionType.TRADE;
    colonyName: string;
    payment: NumericPropertyCounter<Resource>;
};

export type GameActionSkip = SharedGameAction & {
    actionType: GameActionType.SKIP;
};

export type GameActionPass = SharedGameAction & {
    actionType: GameActionType.PASS;
};

export type GameActionGameUpdate = {
    actionType: GameActionType.GAME_UPDATE;
    text: string;
};

export type GameActionPlayerResourceUpdate = SharedGameAction & {
    actionType: GameActionType.PLAYER_RESOURCE_UPDATE;
    resource: NumericPropertyCounter<Resource>;
};

export type GameAction =
    | GameActionPlayCard
    | GameActionPlayCardAction
    | GameActionFundAward
    | GameActionClaimMilestone
    | GameActionConvertResources
    | GameActionStandardProject
    | GameActionTrade
    | GameActionSkip
    | GameActionPass
    | GameActionGameUpdate
    | GameActionPlayerResourceUpdate
    | string;
