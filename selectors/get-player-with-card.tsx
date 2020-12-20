import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';

export function getPlayerWithCard(state: GameState, parent: Card): PlayerState {
    return state.players.find(player =>
        player.playedCards.find(theCard => theCard.name === parent.name)
    )!;
}
