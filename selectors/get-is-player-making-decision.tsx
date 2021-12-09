import {GameStage} from 'constants/game';
import {GameState, PlayerState} from 'reducer';

export function getIsPlayerMakingDecision(state: GameState, loggedInPlayer: PlayerState): boolean {
    try {
        return (
            getIsPlayerMakingDecisionExceptForNextActionChoice(state, loggedInPlayer) ||
            !!loggedInPlayer.pendingNextActionChoice ||
            ((loggedInPlayer?.preludes?.length ?? 0) > 0 &&
                state.common.currentPlayerIndex === loggedInPlayer.index &&
                state.common.gameStage === GameStage.ACTIVE_ROUND)
        );
    } catch (error) {
        return false;
    }
}

export function getIsPlayerMakingDecisionExceptForNextActionChoice(
    state: GameState,
    loggedInPlayer: PlayerState
): boolean {
    try {
        const pendingActions =
            (state.common.revealedCards.length > 0 &&
                (state.common.controllingPlayerIndex ?? state.common.currentPlayerIndex) ===
                    loggedInPlayer.index) ||
            loggedInPlayer.pendingTilePlacement ||
            loggedInPlayer.pendingTileRemoval ||
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
            loggedInPlayer.putAdditionalColonyTileIntoPlay ||
            loggedInPlayer.placeDelegatesInOneParty ||
            loggedInPlayer.removeNonLeaderDelegate ||
            loggedInPlayer.exchangeNeutralNonLeaderDelegate ||
            state.common.gameStage === GameStage.END_OF_GAME ||
            loggedInPlayer.pendingDiscard;

        return Boolean(pendingActions);
    } catch (error) {
        return false;
    }
}
