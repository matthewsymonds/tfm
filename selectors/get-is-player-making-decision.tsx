import {GameState, PlayerState} from 'reducer';

export function getIsPlayerMakingDecision(state: GameState, loggedInPlayer: PlayerState): boolean {
    try {
        const pendingActions =
            state.common.revealedCards.length > 0 ||
            loggedInPlayer.forcedActions.length > 0 ||
            loggedInPlayer.pendingTilePlacement ||
            loggedInPlayer.pendingCardSelection ||
            loggedInPlayer.pendingResourceActionDetails ||
            loggedInPlayer.pendingChoice ||
            loggedInPlayer.pendingDuplicateProduction ||
            loggedInPlayer.pendingDiscard;

        return Boolean(pendingActions);
    } catch (error) {
        return false;
    }
}
