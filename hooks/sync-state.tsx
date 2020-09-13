import {setGame} from 'actions';
import {makePostCall} from 'api-calls';
import {AppContext} from 'context/app-context';
import {useRouter} from 'next/router';
import {useContext, useEffect, useRef} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {RootState} from 'reducer';
import {deserializeState, serializeState} from 'state-serialization';

async function syncState(newState: RootState | null, queue: Object[], router, dispatch) {
    if (!newState) return;
    const {origin} = window.location;
    const urlParts = window.location.href.split('/');
    const gameName = urlParts[urlParts.length - 1];
    const apiPath = '/api/games/' + gameName;

    const serializedState = serializeState(newState);

    const body = {
        state: serializedState,
        queue,
    };

    const result = await makePostCall(apiPath, body);
    if (result.error) {
        router.push('/new-game');
    } else if (result.state) {
        if (JSON.stringify(result.state) !== JSON.stringify(serializedState)) {
            dispatch(setGame(deserializeState(result.state)));
        }
    }
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export let isSyncing: boolean = false;

export function useSyncState() {
    const store = useStore();
    const state = store.getState();
    const previousState = usePrevious(state);
    const router = useRouter();

    const context = useContext(AppContext);
    const {queue} = context;
    const dispatch = useDispatch();

    async function trackSyncState() {
        isSyncing = true;
        await syncState(state, queue, router, dispatch);
        isSyncing = false;
    }

    useEffect(() => {
        if (JSON.stringify(state) !== JSON.stringify(previousState) && !state.set) {
            // Update the state on the server.
            trackSyncState();
        }
    }, [state]);

    return isSyncing;
}
