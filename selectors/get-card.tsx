import {Card} from 'models/card';
import {deserializeCard, SerializedCard} from 'state-serialization';

export function getCard(serializedCard: SerializedCard): Card {
    return deserializeCard(serializedCard);
}
