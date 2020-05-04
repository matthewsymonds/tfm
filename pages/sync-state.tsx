import {useEffect, useRef} from 'react';
import {useStore} from 'react-redux';
import {RootState} from '../reducer';
import {serializeState} from '../state-serialization';

async function syncState(newState: RootState) {
    const {origin} = window.location;
    const apiURL = `${origin}/api/games`;

    await fetch(apiURL, {
        method: 'post',
        body: JSON.stringify(serializeState(newState)),
    });
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
    useEffect(() => {
        if (state !== previousState) {
            // Update the state on the server.
            syncState(state);
        }
    }, [state]);
}
