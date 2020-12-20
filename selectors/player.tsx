import {NumericPropertyCounter} from 'constants/property-counter';
import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';

export function getForcedActionsForPlayer(state: GameState, playerIndex: number) {
    const player = state.players.find(p => p.index === playerIndex);
    return player?.forcedActions ?? [];
}

export function getTagCountsByName(player: PlayerState) {
    return player.playedCards.reduce<NumericPropertyCounter<Tag>>((tagCountsByName, card) => {
        card.tags.forEach(tag => {
            if (card.tags.includes(Tag.EVENT) && tag !== Tag.EVENT) {
                // Don't count a space event toward space tags.
                return;
            }
            if (!tagCountsByName[tag]) {
                tagCountsByName[tag] = 0;
            }
            // @ts-ignore-next-line not sure why this doesnt type refine
            tagCountsByName[tag] += 1;
        });
        return tagCountsByName;
    }, {});
}
