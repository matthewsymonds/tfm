import {Deck} from 'constants/card-types';
import {GameState} from 'reducer';

export function getAvailableFleets(
    playerIndex: number,
    state: GameState
): number {
    const isColoniesEnabled = state.options?.decks.includes(Deck.COLONIES);
    if (!isColoniesEnabled) {
        return 0;
    }

    const player = state.players[playerIndex];
    const totalFleets = player.fleets;
    const usedFleets = (state.common.colonies ?? []).filter(
        colony =>
            colony.lastTrade?.round === state.common.generation &&
            colony.lastTrade?.player === player.username
    ).length;

    return totalFleets - usedFleets;
}
