import {GameAction} from 'GameActionState';
import {deserializeGameAction, SerializedGameAction} from 'state-serialization';

export function getGameAction(gameAction: SerializedGameAction): GameAction {
    return deserializeGameAction(gameAction);
}
