import {CardType} from 'constants/card-types';
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

export function getVisiblePlayedCards(player: PlayerState): Card[] {
    return getPlayedCards(player).filter(card => card.type !== CardType.EVENT);
}
