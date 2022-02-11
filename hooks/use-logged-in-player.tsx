import {AppContext} from 'context/app-context';
import {useContext} from 'react';
import {useStore} from 'react-redux';

export function useLoggedInPlayer() {
    const context = useContext(AppContext);
    const store = useStore();

    return context.getLoggedInPlayer(store.getState());
}
