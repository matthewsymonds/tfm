import {isStorableResource} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {SerializedPlayerState} from 'state-serialization';
import {getPlayedCards} from './get-played-cards';

export function getPlayerResourceAmount(player: SerializedPlayerState, resource: Resource): number {
    if (isStorableResource(resource)) {
        return getPlayedCards(player)
            .filter(card => card.storedResourceType === resource)
            .reduce((acc, card) => acc + (card.storedResourceAmount ?? 0), 0);
    }
    return player.resources[resource];
}
