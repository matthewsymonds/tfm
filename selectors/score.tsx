import {Award, TileType} from 'constants/board';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {
    getAdjacentCellsForCell,
    getAllCellsOwnedByCurrentPlayer,
    getCellsWithCitiesOnMars,
    getGreeneriesForPlayer,
} from 'selectors/board';
import {getTags} from './variable-amount';

export function getGreeneryScore(state: GameState, playerIndex: number) {
    return getGreeneriesForPlayer(state, playerIndex).length;
}

export function getCityScore(state: GameState, playerIndex: number) {
    const playerCitiesOnMars = getCellsWithCitiesOnMars(state).filter(
        cell => cell.tile?.ownerPlayerIndex === playerIndex
    );
    return playerCitiesOnMars.reduce((cityScore, cell) => {
        const adjacentGreeneries = getAdjacentCellsForCell(state, cell).filter(
            adjCell => adjCell.tile?.type === TileType.GREENERY
        );
        return cityScore + adjacentGreeneries.length;
    }, 0);
}

export function getMilestoneScore(state: GameState, playerIndex: number) {
    return (
        state.common.claimedMilestones.filter(
            claimedMilestone => claimedMilestone.claimedByPlayerIndex === playerIndex
        ).length * 5
    );
}

export function getPlayerMegacreditProduction(player: PlayerState) {
    return player.productions[Resource.MEGACREDIT];
}

export function getPlayerHeat(player: PlayerState) {
    return player.resources[Resource.HEAT];
}

export function getPlayerScienceTags(player: PlayerState) {
    return getTags(player).filter(tag => tag === Tag.SCIENCE).length;
}

export function getPlayerVenusTags(player: PlayerState) {
    return getTags(player).filter(tag => tag === Tag.VENUS).length;
}

export function getPlayerSteelAndTitanium(player: PlayerState) {
    return player.resources[Resource.STEEL] + player.resources[Resource.TITANIUM];
}

export const awardToQuantity = {
    [Award.BANKER]: getPlayerMegacreditProduction,
    [Award.THERMALIST]: getPlayerHeat,
    [Award.SCIENTIST]: getPlayerScienceTags,
    [Award.LANDLORD]: (player: PlayerState, state: GameState) =>
        getAllCellsOwnedByCurrentPlayer(state, player).length,
    [Award.MINER]: getPlayerSteelAndTitanium,
    [Award.VENUPHILE]: getPlayerVenusTags,
};

export function getAwardScore(state: GameState, playerIndex: number) {
    let awardScoreTotal = 0;
    state.common.fundedAwards.forEach(fundedAward => {
        const getQuantity = awardToQuantity[fundedAward.award];

        const mappingFn: (
            player: PlayerState
        ) => {playerIndex: number; quantity: number; score: number} = player => ({
            playerIndex: player.index,
            quantity: getQuantity(player, state),
            score: 0,
        });

        const awardScores = state.players
            .map(player => mappingFn(player))
            .sort((a, b) => b.quantity - a.quantity);

        // assign points
        let currentQuantity = awardScores[0].quantity;
        let currentPointValue = 5;
        for (const awardScore of awardScores) {
            if (awardScore.quantity === 0) continue;
            if (awardScore.quantity === currentQuantity) {
                awardScore.score = currentPointValue;
            } else if (awardScore.quantity < currentQuantity) {
                currentQuantity = awardScore.quantity;
                if ((currentPointValue = 5)) {
                    currentPointValue = 2;
                } else if ((currentPointValue = 2)) {
                    currentPointValue = 0;
                }
                awardScore.score = currentPointValue;
            } else {
                throw new Error('Sorting error when calculating award score');
            }
        }
        const awardScore = awardScores.find(a => a.playerIndex === playerIndex);
        if (!awardScore) {
            throw new Error('could not find player when calculating award score');
        }
        awardScoreTotal += awardScore.score;
    });

    return awardScoreTotal;
}
