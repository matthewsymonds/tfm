import {Colony} from 'constants/colonies';
import {Turmoil} from 'constants/turmoil';
import {Award, Board, Cell, Parameter} from './constants/board';
import {GameStage} from './constants/game';
import {Card} from './models/card';

export type BaseCommonState = {
    // List of indices of playing players.
    playerIndexOrderForGeneration: number[];
    deck: Card[];
    discardPile: Card[];
    preludes: Card[];
    revealedCards: Card[];
    gameStage: GameStage;
    generation: number;
    claimedMilestones: {claimedByPlayerIndex: number; milestone: string}[];
    fundedAwards: {fundedByPlayerIndex: number; award: Award}[];
    turn: number;
    firstPlayerIndex: number;
    currentPlayerIndex: number;
    controllingPlayerIndex?: number;
    parameters: {
        [Parameter.OCEAN]: number;
        [Parameter.OXYGEN]: number;
        [Parameter.TEMPERATURE]: number;
        [Parameter.VENUS]: number;
    };
    // Used for Flooding.
    mostRecentTilePlacementCell?: Cell;
    board: Board;
    colonies?: Colony[];
    turmoil?: Turmoil;
};
