import {GameState} from 'reducer';

export function getHasPlayerPassed(playerIndex: number, state: GameState): boolean {
    const player = state.players[playerIndex];
    return player.action === 0;
}
