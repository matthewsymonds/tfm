import {useEffect, useRef} from 'react';
import {useStore} from 'react-redux';
import {RootState} from 'reducer';
import {serializeState} from 'state-serialization';
import {makePostCall} from 'api-calls';
import {useRouter} from 'next/router';

async function syncState(newState: RootState, router) {
    const {origin} = window.location;
    const urlParts = window.location.href.split('/');
    const gameName = urlParts[urlParts.length - 1];
    const apiPath = '/api/games/' + gameName;

    const body = {
        state: serializeState(newState),
    };

    const result = await makePostCall(apiPath, body);
    if (result.error) {
        router.push('/new-game');
    }
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export function useSyncState() {
    const store = useStore();
    const state = store.getState();
    const previousState = usePrevious(state);
    const router = useRouter();

    useEffect(() => {
        if (state !== previousState) {
            // Update the state on the server.
            syncState(state, router);
        }
    }, [state]);
}
