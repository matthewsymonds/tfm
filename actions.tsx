import {GameStage} from './constants/game';

export const SET_CORPORATION = 'SET_CORPORATION';
export const setCorporation = corporation => ({
    type: SET_CORPORATION,
    payload: corporation
});

export const SET_CARDS = 'SET_CARDS';
export const setCards = cards => ({type: SET_CARDS, payload: cards});

export const GO_TO_GAME_STAGE = 'GO_TO_GAME_STAGE';
export const goToGameStage = (stage: GameStage) => ({
    type: GO_TO_GAME_STAGE,
    payload: stage
});

export const CONFIRM_CORPORATION_AND_CARDS = 'CONFIRM_CORPORATION_AND_CARDS';
export const confirmCorporationAndCards = () => ({type: CONFIRM_CORPORATION_AND_CARDS});
