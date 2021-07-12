import {Deck} from 'constants/card-types';
import {GameState} from 'reducer';

export function isPlayingVenus(state: GameState) {
    return (state.options?.decks ?? []).includes(Deck.VENUS);
}
