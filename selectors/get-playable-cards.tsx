import {ActionGuard} from 'client-server-shared/action-guard';
import {PlayerState} from 'reducer';
import {SerializedCard} from 'state-serialization';
import {getCard} from './get-card';

export function getPlayableCards(player: PlayerState, actionGuard: ActionGuard): SerializedCard[] {
    return player.cards.filter(card => {
        const fullCard = getCard(card);

        return actionGuard.canPlayCard(fullCard)[0];
    });
}
