import {RootState, useTypedSelector} from '../reducer';

export const getLoggedInPlayer = (state: RootState) => state.players[state.loggedInPlayerIndex];

export const useLoggedInPlayer = () => {
    return useTypedSelector(getLoggedInPlayer);
};
