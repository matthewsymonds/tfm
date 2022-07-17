import {getAward} from 'constants/awards';
import {TileType} from 'constants/board';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {
    getAdjacentCellsForCell,
    getCellsWithCitiesOnMars,
    getGreeneriesForPlayer,
} from 'selectors/board';
import {convertAmountToNumber} from './convert-amount-to-number';
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

export function getTurmoilEndOfGameScore(
    state: GameState,
    playerIndex: number
) {
    const {turmoil} = state.common;
    if (!turmoil) return 0;

    let score = 0;
    const {chairperson} = turmoil;
    if (chairperson?.playerIndex === playerIndex) score += 1;

    for (const delegation in turmoil.delegations) {
        const [leader] = turmoil.delegations[delegation];
        if (leader?.playerIndex === playerIndex) {
            score += 1;
        }
    }
    return score;
}

export function getMilestoneScore(state: GameState, playerIndex: number) {
    return (
        state.common.claimedMilestones.filter(
            claimedMilestone =>
                claimedMilestone.claimedByPlayerIndex === playerIndex
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
    return (
        player.resources[Resource.STEEL] + player.resources[Resource.TITANIUM]
    );
}

export function getAwardScore(state: GameState, playerIndex: number) {
    let awardScoreTotal = 0;

    state.common.fundedAwards.forEach(fundedAward => {
        const awardConfig = getAward(fundedAward.award);
        const getQuantity = (player: PlayerState, state: GameState) =>
            convertAmountToNumber(awardConfig.amount, state, player);

        const mappingFn: (player: PlayerState) => {
            playerIndex: number;
            quantity: number;
            score: number;
        } = player => ({
            playerIndex: player.index,
            quantity: getQuantity(player, state),
            score: 0,
        });

        const awardScores = state.players
            .map(player => mappingFn(player))
            .sort((a, b) => b.quantity - a.quantity);

        // assign points
        const firstPlaceQuantity = awardScores[0].quantity;
        if (firstPlaceQuantity === 0) {
            return;
        }
        const numWinners = awardScores.filter(
            a => a.quantity === firstPlaceQuantity
        ).length;
        const secondPlaceQuantity = awardScores
            .map(a => (a.quantity === firstPlaceQuantity ? 0 : a.quantity))
            .sort((a, b) => b - a)[0];
        const shouldScoreFirstPlace = firstPlaceQuantity > 0;
        const shouldScoreSecondPlace =
            numWinners === 1 &&
            state.players.length > 2 &&
            secondPlaceQuantity > 0;
        awardScores.forEach(awardScore => {
            if (
                awardScore.quantity === firstPlaceQuantity &&
                shouldScoreFirstPlace
            ) {
                awardScore.score = 5;
            }
            if (
                awardScore.quantity === secondPlaceQuantity &&
                shouldScoreSecondPlace
            ) {
                awardScore.score = 2;
            }
        });

        const awardScore = awardScores.find(a => a.playerIndex === playerIndex);
        if (!awardScore) {
            throw new Error(
                'could not find player when calculating award score'
            );
        }
        awardScoreTotal += awardScore.score;
    });

    return awardScoreTotal;
}
