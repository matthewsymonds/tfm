import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {getPlayedCards} from './get-played-cards';

export function getForcedActionsForPlayer(state: GameState, playerIndex: number) {
    const player = state.players.find(p => p.index === playerIndex);
    return player?.forcedActions ?? [];
}

export function getTagCountsByName(player: PlayerState) {
    const tagCountsByName: Array<[Tag, number]> = [];
    for (const card of getPlayedCards(player)) {
        for (const tag of card.tags) {
            let tagCount = tagCountsByName.find(tagCount => tagCount[0] === tag);
            if (!tagCount) {
                tagCount = [tag, 0];
                tagCountsByName.push(tagCount);
            }

            tagCount[1]++;
        }
    }

    tagCountsByName.sort((alpha, beta) => {
        // show biggest tag count first.
        return beta[1] - alpha[1];
    });

    return tagCountsByName;
}
