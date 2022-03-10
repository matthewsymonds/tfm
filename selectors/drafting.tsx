import {GameStage} from 'constants/game';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {GameState} from 'reducer';

export function isDrafting(state: GameState) {
    return state.common.gameStage === GameStage.DRAFTING;
}

export function isWaitingOnOthersToDraft(state: GameState) {
    const player = useLoggedInPlayer();

    if (!isDrafting(state)) return false;

    const {pendingCardSelection} = player;
    if (!pendingCardSelection) return false;

    return (
        pendingCardSelection.possibleCards.length +
            (pendingCardSelection.draftPicks?.length ?? 0) >
        4
    );
}
