import {GameStage} from 'constants/game';
import {GameState, PlayerState} from 'reducer';

export function getIsPlayerMakingDecision(state: GameState, loggedInPlayer: PlayerState): boolean {
    try {
        const pendingActions =
            state.common.revealedCards.length > 0 ||
            loggedInPlayer.pendingTilePlacement ||
            loggedInPlayer.pendingCardSelection ||
            loggedInPlayer.pendingResourceActionDetails ||
            loggedInPlayer.pendingChoice ||
            loggedInPlayer.fundAward ||
            loggedInPlayer.pendingDuplicateProduction ||
            loggedInPlayer.pendingIncreaseLowestProduction ||
            loggedInPlayer.pendingActionReplay ||
            loggedInPlayer.pendingPlayCardFromHand ||
            loggedInPlayer.placeColony ||
            loggedInPlayer.increaseAndDecreaseColonyTileTracks ||
            loggedInPlayer.tradeForFree ||
            ((loggedInPlayer?.preludes?.length ?? 0) > 0 &&
                state.common.currentPlayerIndex === loggedInPlayer.index &&
                state.common.gameStage === GameStage.ACTIVE_ROUND) ||
            state.common.gameStage === GameStage.END_OF_GAME ||
            loggedInPlayer.pendingDiscard;

        return Boolean(pendingActions);
    } catch (error) {
        return false;
    }
}
