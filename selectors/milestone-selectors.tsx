import {cellHelpers, Milestone} from 'constants/board';
import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {getTags} from './variable-amount';

function getPlayerCities(player: PlayerState, state: GameState) {
    return state.common.board.flat().filter(cell => {
        return cellHelpers.containsCity(cell) && cellHelpers.isOwnedBy(cell, player.index);
    }).length;
}

function getPlayerGreeneries(player: PlayerState, state: GameState) {
    return state.common.board.flat().filter(cell => {
        return cellHelpers.containsGreenery(cell) && cellHelpers.isOwnedBy(cell, player.index);
    }).length;
}

function getPlayerBuildingTags(player: PlayerState) {
    return getTags(player).filter(tag => tag === Tag.BUILDING).length;
}

function getPlayerCards(player: PlayerState) {
    return player.cards.length;
}

function getPlayerTerraformRating(player: PlayerState) {
    return player.terraformRating;
}

export const milestoneQuantitySelectors = {
    [Milestone.MAYOR]: getPlayerCities,
    [Milestone.GARDENER]: getPlayerGreeneries,
    [Milestone.BUILDER]: getPlayerBuildingTags,
    [Milestone.PLANNER]: getPlayerCards,
    [Milestone.TERRAFORMER]: getPlayerTerraformRating,
};

export const minMilestoneQuantity = {
    [Milestone.MAYOR]: 3,
    [Milestone.GARDENER]: 3,
    [Milestone.BUILDER]: 8,
    [Milestone.PLANNER]: 16,
    [Milestone.TERRAFORMER]: 35,
};
