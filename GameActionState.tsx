import {Award, Milestone} from 'constants/board';
import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {StandardProjectType} from 'constants/standard-project';
import {Card} from 'models/card';

export enum GameActionType {
    CARD = 'card',
    CARD_ACTION = 'cardAction',
    AWARD = 'award',
    MILESTONE = 'milestone',
    STANDARD_PROJECT = 'standardProject',
    TRADE = 'trade',
    SKIP = 'skip',
    PASS = 'pass',
}

type SharedGameAction = {
    playerIndex: number;
};

export type GameActionPlayCard = SharedGameAction & {
    actionType: GameActionType.CARD;
    card: Card;
    payment?: NumericPropertyCounter<Resource> | null;
};

export type GameActionPlayCardAction = SharedGameAction & {
    actionType: GameActionType.CARD_ACTION;
    card: Card;
    payment?: NumericPropertyCounter<Resource> | null;
    choiceIndex?: number;
};

export type GameActionFundAward = SharedGameAction & {
    actionType: GameActionType.AWARD;
    award: Award;
    payment?: NumericPropertyCounter<Resource> | null;
};

export type GameActionClaimMilestone = SharedGameAction & {
    actionType: GameActionType.MILESTONE;
    milestone: Milestone;
    payment?: NumericPropertyCounter<Resource> | null;
};

export type GameActionStandardProject = SharedGameAction & {
    actionType: GameActionType.STANDARD_PROJECT;
    standardProject: StandardProjectType;
    payment?: NumericPropertyCounter<Resource> | null;
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

export type GameAction =
    | GameActionPlayCard
    | GameActionPlayCardAction
    | GameActionFundAward
    | GameActionClaimMilestone
    | GameActionStandardProject
    | GameActionTrade
    | GameActionSkip
    | GameActionPass
    | string;
