import {Card} from 'models/card';
import {PlayerState} from 'reducer';
import {getCard} from './get-card';

export function getPlayedCards(player: PlayerState): Card[] {
    const cards: Card[] = [];
    for (const card of player.playedCards) {
        cards.push(getCard(card));
    }

    return cards;
}
