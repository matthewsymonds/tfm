import {ResourceCounter} from 'constants/action';
import {Award, Milestone} from 'constants/board';
import {ColonyType} from 'constants/colonies';
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
    payment?: NumericPropertyCounter<Resource>;
};

export type GameActionPlayCardAction = SharedGameAction & {
    actionType: GameActionType.CARD_ACTION;
    card: Card;
    payment?: NumericPropertyCounter<Resource>;
    choiceIndex?: number;
};

export type GameActionFundAward = SharedGameAction & {
    actionType: GameActionType.AWARD;
    award: Award;
    payment?: NumericPropertyCounter<Resource>;
};

export type GameActionClaimMilestone = SharedGameAction & {
    actionType: GameActionType.MILESTONE;
    milestone: Milestone;
    payment?: NumericPropertyCounter<Resource>;
};

export type GameActionStandardProject = SharedGameAction & {
    actionType: GameActionType.STANDARD_PROJECT;
    standardProject: StandardProjectType;
    payment?: NumericPropertyCounter<Resource>;
};

export type GameActionTrade = SharedGameAction & {
    actionType: GameActionType.TRADE;
    colony: ColonyType;
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
