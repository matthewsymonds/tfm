import {GameState, useTypedSelector} from 'reducer';

export function getWaitingMessage(playerIndex: number) {
    const playerWhoseTurnItIs = useTypedSelector(
        state => state.players[state.common.currentPlayerIndex]
    );

    if (playerWhoseTurnItIs.index === playerIndex) {
        return '';
    }

    return `Waiting for ${playerWhoseTurnItIs.username}`;
}
