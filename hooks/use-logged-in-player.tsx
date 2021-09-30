import {AppContext} from 'context/app-context';
import {useContext} from 'react';
import {shallowEqual} from 'react-redux';
import {useTypedSelector} from 'reducer';

export function useLoggedInPlayer() {
    const context = useContext(AppContext);

    return useTypedSelector(state => context.getLoggedInPlayer(state), shallowEqual);
}
