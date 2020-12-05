import {GameState, PlayerState} from 'reducer';

export function getIsPlayerMakingDecision(state: GameState, loggedInPlayer: PlayerState): boolean {
    const pendingActions =
        loggedInPlayer.pendingTilePlacement ||
        state.common.revealedCards.length > 0 ||
        loggedInPlayer.possibleCards.length > 0 ||
        loggedInPlayer.forcedActions.length > 0 ||
        loggedInPlayer.pendingResourceActionDetails ||
        loggedInPlayer.pendingChoice ||
        loggedInPlayer.pendingDuplicateProduction ||
        loggedInPlayer.pendingDiscard;

    return Boolean(pendingActions);
}
