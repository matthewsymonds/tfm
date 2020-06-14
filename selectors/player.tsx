import {GameState} from 'reducer';

export function getForcedActionsForPlayer(state: GameState, playerIndex: number) {
    const player = state.players.find(p => p.index === playerIndex);
    return player?.forcedActions ?? [];
}
