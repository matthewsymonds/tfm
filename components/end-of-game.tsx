import {useSyncState} from 'pages/sync-state';
import {useContext, useEffect} from 'react';
import {AppContext} from 'context/app-context';
import {useDispatch} from 'react-redux';

export const EndOfGame = () => {
    useSyncState();

    const context = useContext(AppContext);
    const dispatch = useDispatch();

    useEffect(() => {
        context.processQueue(dispatch);
    }, []);

    return <div>End of game reached!</div>;
};
