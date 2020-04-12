import {RootState} from '../reducer';

export const getLoggedInPlayer = (state: RootState) => state.players[state.loggedInPlayerIndex];
