import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {getPlayedCards} from './get-played-cards';

export function getForcedActionsForPlayer(state: GameState, playerIndex: number) {
    const player = state.players.find(p => p.index === playerIndex);
    if (player?.preludes?.length ?? 0 > 0) return [];
    return player?.forcedActions ?? [];
}

export function getTagCountsByName(player: PlayerState): {[tag in Tag]?: number} {
    const tagCountsByName: {[tag in Tag]?: number} = {};
    for (const card of getPlayedCards(player)) {
        if (card.tags.length === 0) {
            tagCountsByName[Tag.NONE] = (tagCountsByName[Tag.NONE] ?? 0) + 1;
        }
        for (const tag of card.tags) {
            if (card.tags.includes(Tag.EVENT) && tag !== Tag.EVENT) {
                // only count event tags on event cards
                continue;
            }
            tagCountsByName[tag] = (tagCountsByName[tag] ?? 0) + 1;
        }
    }

    return tagCountsByName;
}
