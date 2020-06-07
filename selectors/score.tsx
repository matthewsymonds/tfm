import {
    getGreeneriesForPlayer,
    getCellsWithCitiesOnMars,
    getAdjacentCellsForCell,
    getAllCellsOwnedByCurrentPlayer,
} from 'selectors/board';
import {RootState, GameState, PlayerState} from 'reducer';
import {TileType, Award} from 'constants/board';
import {Resource} from 'constants/resource';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';

export function getGreeneryScore(state: RootState, playerIndex: number) {
    return getGreeneriesForPlayer(state, playerIndex).length;
}

export function getCityScore(state: GameState, playerIndex: number) {
    const playerCitiesOnMars = getCellsWithCitiesOnMars(state).filter(
        cell => cell.tile.ownerPlayerIndex === playerIndex
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
        ).length * 8
    );
}

export function getAwardScore(state: GameState, playerIndex: number) {
    let awardScoreTotal = 0;
    state.common.fundedAwards.forEach(fundedAward => {
        let mappingFn: (
            player: PlayerState
        ) => {playerIndex: number; quantity: number; score: number};
        switch (fundedAward.award) {
            case Award.BANKER:
                mappingFn = player => ({
                    playerIndex: player.index,
                    quantity: player.productions[Resource.MEGACREDIT],
                    score: 0,
                });
                break;
            case Award.THERMALIST:
                mappingFn = player => ({
                    playerIndex: player.index,
                    quantity: player.resources[Resource.HEAT],
                    score: 0,
                });
                break;
            case Award.SCIENTIST:
                mappingFn = player => ({
                    playerIndex: player.index,
                    quantity: player.playedCards
                        .filter(card => card.type !== CardType.EVENT)
                        .map(card => card.tags)
                        .flat()
                        .filter(tag => tag === Tag.SCIENCE).length,
                    score: 0,
                });
                break;
            case Award.LANDLORD:
                mappingFn = player => ({
                    playerIndex: player.index,
                    quantity: getAllCellsOwnedByCurrentPlayer(state).length,
                    score: 0,
                });
                break;
            case Award.MINER:
                mappingFn = player => ({
                    playerIndex: player.index,
                    quantity:
                        player.resources[Resource.STEEL] + player.resources[Resource.TITANIUM],
                    score: 0,
                });
                break;
        }
        const awardScores = state.players.map(mappingFn).sort((a, b) => a.quantity - b.quantity);

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
