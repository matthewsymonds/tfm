import {AppContext} from 'context/app-context';
import {useContext} from 'react';
import {useStore} from 'react-redux';
import {SerializedState} from 'state-serialization';

export function useLoggedInPlayer() {
    const context = useContext(AppContext);
    const store = useStore<SerializedState>();

    return context.getLoggedInPlayer(store.getState());
}
