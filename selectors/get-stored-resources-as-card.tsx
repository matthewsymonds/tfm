import {Card} from 'models/card';
import {PlayerState} from 'reducer';
import {getCard} from './get-card';

export function getUseStoredResourcesAsHeatCard(player: PlayerState | null): Card | undefined {
    const card = player?.playedCards.find(card => getCard(card).useStoredResourceAsHeat);
    if (card) {
        return getCard(card);
    }
    return undefined;
}
