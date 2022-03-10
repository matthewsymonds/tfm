import produceImmer from 'immer';
import {GameState} from 'reducer';

export function produce(
    original: GameState,
    updater: (state: GameState) => void
) {
    if (typeof window === 'undefined') {
        // Mutate the state on the server!
        // This will induce mongodb update actions
        // that only modify what needs to be changed.
        return updater(original);
    }
    // Immutably update the state on the client.
    return produceImmer(original, updater);
}
