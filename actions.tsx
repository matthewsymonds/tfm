export const SET_CORPORATION = 'SET_CORPORATION';
export const setCorporation = corporation => ({
  type: SET_CORPORATION,
  payload: corporation
});

export const SET_CARDS = 'SET_CARDS';
export const setCards = cards => ({type: SET_CARDS, payload: cards});

export const GO_TO_GAME_STAGE = 'GO_TO_GAME_STAGE';
export const goToGameStage = stage => ({
  type: GO_TO_GAME_STAGE,
  payload: stage
});
