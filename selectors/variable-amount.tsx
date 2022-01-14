import {hasCity, TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {Delegate} from 'constants/turmoil';
import {VariableAmount} from 'constants/variable-amount';
import {getLoggedInPlayer} from 'context/app-context';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {SerializedCard} from 'state-serialization';
import {
    findCellWithTile,
    getAdjacentCellsForCell,
    getAllCellsOnMars,
    getAllCellsOwnedByCurrentPlayer,
    getCellsWithCities,
    getCellsWithCitiesOnMars,
    isOwnedByCurrentPlayerExcludingLandClaim,
} from './board';
import {getCard} from './get-card';
import {getPlayedCards} from './get-played-cards';

type VariableAmountSelectors = {
    [k in VariableAmount]?: (
        state: GameState,
        player: PlayerState,
        card: SerializedCard | undefined
    ) => number;
};

export function getTags(player: PlayerState): Tag[] {
    return getNonEventCards(player).flatMap(card => card.tags);
}

function getNonEventCards(player: PlayerState): Card[] {
    return getPlayedCards(player).filter(card => card.type !== CardType.EVENT);
}

export function getEventCards(player: PlayerState): SerializedCard[] {
    return getPlayedCards(player).filter(card => card.type === CardType.EVENT);
}

export const VARIABLE_AMOUNT_SELECTORS: VariableAmountSelectors = {
    // Must have at least one of a resource to exchange it with something else!
    [VariableAmount.USER_CHOICE]: () => 1,
    // You can play insulation just to get the card out, but not change any production.
    [VariableAmount.USER_CHOICE_MIN_ZERO]: () => 0,
    [VariableAmount.BASED_ON_USER_CHOICE]: (state: GameState) => state.pendingVariableAmount!,
    [VariableAmount.DOUBLE_BASED_ON_USER_CHOICE]: (state: GameState) =>
        state.pendingVariableAmount! * 2,
    [VariableAmount.TRIPLE_BASED_ON_USER_CHOICE]: (state: GameState) =>
        state.pendingVariableAmount! * 3,
    [VariableAmount.ALL_EVENTS]: (state: GameState) => {
        return state.players.flatMap(player => {
            return getPlayedCards(player).filter(card => card.tags.includes(Tag.EVENT));
        }).length;
    },
    [VariableAmount.PLAYER_EVENTS]: (state: GameState, player = getLoggedInPlayer(state)) => {
        return getPlayedCards(player).filter(card => card.tags.includes(Tag.EVENT)).length;
    },
    [VariableAmount.CARDS_WITHOUT_TAGS]: (state: GameState, player = getLoggedInPlayer(state)) => {
        return getPlayedCards(player).filter(
            card => card.type !== CardType.EVENT && card.tags.length === 0
        ).length;
    },
    [VariableAmount.CITIES_ON_MARS]: (state: GameState) => {
        return getCellsWithCitiesOnMars(state).length;
    },
    [VariableAmount.CITY_TILES_ADJACENT_TO_COMMERCIAL_DISTRICT]: (state: GameState) => {
        const commercialDistrict = findCellWithTile(state, TileType.COMMERCIAL_DISTRICT);
        if (!commercialDistrict) {
            return 0;
        }
        return getAdjacentCellsForCell(state, commercialDistrict).filter(hasCity).length;
    },
    [VariableAmount.PLAYER_TILES]: (state: GameState, player: PlayerState) => {
        return getAllCellsOwnedByCurrentPlayer(state, player).length;
    },
    [VariableAmount.TILES_ADJACENT_TO_OCEAN]: (
        state: GameState,
        player = getLoggedInPlayer(state)
    ) => {
        return getAllCellsOnMars(state)
            .filter(cell => isOwnedByCurrentPlayerExcludingLandClaim(cell, player))
            .filter(cell => {
                return getAdjacentCellsForCell(state, cell).some(
                    neighbor => neighbor.tile?.type === TileType.OCEAN
                );
            }).length;
    },
    [VariableAmount.CITY_TILES_IN_PLAY]: (state: GameState, player = getLoggedInPlayer(state)) => {
        return getCellsWithCities(state, player).length;
    },
    [VariableAmount.OCEANS_ADJACENT_TO_CAPITAL]: (state: GameState) => {
        const capital = findCellWithTile(state, TileType.CAPITAL);
        if (!capital) {
            return 0;
        }
        return getAdjacentCellsForCell(state, capital).filter(cell => {
            return cell.tile?.type === TileType.OCEAN;
        }).length;
    },
    [VariableAmount.EMPTY_AREAS_ADJACENT_TO_PLAYER_TILES]: (
        state: GameState,
        player = getLoggedInPlayer(state)
    ) => {
        const playerCells = getAllCellsOnMars(state).filter(cell =>
            isOwnedByCurrentPlayerExcludingLandClaim(cell, player)
        );
        const emptyNeighbors = playerCells
            .flatMap(cell => getAdjacentCellsForCell(state, cell))
            .filter(cell => !cell.tile)
            .map(cell => cell?.coords?.join(''));

        return new Set(emptyNeighbors).size;
    },
    [VariableAmount.MINING_AREA_CELL_HAS_STEEL_BONUS]: (state: GameState) => {
        const mining = findCellWithTile(state, TileType.MINING_AREA);
        return mining?.bonus?.includes(Resource.STEEL) ? 1 : 0;
    },
    [VariableAmount.MINING_AREA_CELL_HAS_TITANIUM_BONUS]: (state: GameState) => {
        const mining = findCellWithTile(state, TileType.MINING_AREA);
        return mining?.bonus?.includes(Resource.TITANIUM) ? 1 : 0;
    },
    [VariableAmount.MINING_RIGHTS_CELL_HAS_STEEL_BONUS]: (state: GameState) => {
        const mining = findCellWithTile(state, TileType.MINING_RIGHTS);
        return mining?.bonus?.includes(Resource.STEEL) ? 1 : 0;
    },
    [VariableAmount.MINING_RIGHTS_CELL_HAS_TITANIUM_BONUS]: (state: GameState) => {
        const mining = findCellWithTile(state, TileType.MINING_RIGHTS);
        return mining?.bonus?.includes(Resource.TITANIUM) ? 1 : 0;
    },
    [VariableAmount.VENUS_AND_EARTH_TAGS]: (
        state: GameState,
        player = getLoggedInPlayer(state)
    ) => {
        return getTags(player).filter(
            tag => tag === Tag.EARTH || tag === Tag.VENUS || tag === Tag.WILD
        ).length;
    },
    [VariableAmount.OPPONENTS_SPACE_TAGS]: (
        state: GameState,
        player = getLoggedInPlayer(state)
    ) => {
        return state.players
            .filter(p => p.index !== player.index)
            .flatMap(player => getTags(player))
            .filter(tag => tag === Tag.SPACE).length;
    },
    [VariableAmount.PLANT_CONVERSION_AMOUNT]: (
        state: GameState,
        player = getLoggedInPlayer(state)
    ) => {
        return 8 - (player.plantDiscount || 0);
    },
    [VariableAmount.RESOURCES_ON_CARD]: (state: GameState, player: PlayerState, card?: Card) => {
        return card?.storedResourceAmount!;
    },
    [VariableAmount.RESOURCES_ON_CARDS]: (state: GameState, player: PlayerState) => {
        return player.playedCards.reduce((acc, card) => acc + (card.storedResourceAmount ?? 0), 0);
    },
    [VariableAmount.RESOURCES_ON_CARD_MAX_4]: (
        state: GameState,
        player: PlayerState,
        card?: Card
    ) => {
        return Math.min(card?.storedResourceAmount!, 4);
    },
    [VariableAmount.TWICE_RESOURCES_ON_CARD]: (
        state: GameState,
        player: PlayerState,
        card?: Card
    ) => {
        return card?.storedResourceAmount! * 2;
    },
    [VariableAmount.HALF_RESOURCES_ON_CARD]: (
        state: GameState,
        player: PlayerState,
        card?: Card
    ) => {
        return Math.floor(card?.storedResourceAmount! / 2);
    },
    [VariableAmount.THIRD_RESOURCES_ON_CARD]: (
        state: GameState,
        player: PlayerState,
        card?: Card
    ) => {
        return Math.floor(card?.storedResourceAmount! / 3);
    },
    [VariableAmount.THIRD_FLOATERS]: (state: GameState, player: PlayerState, card?: Card) => {
        let numFloaters = 0;
        for (const card of player.playedCards) {
            const fullCard = getCard(card);
            if (fullCard.storedResourceType !== Resource.FLOATER) {
                continue;
            }
            numFloaters += card.storedResourceAmount ?? 0;
        }
        return Math.floor(numFloaters / 3);
    },
    [VariableAmount.THIRD_FLOATERS]: (state: GameState, player: PlayerState, card?: Card) =>
        Math.floor(getTotalFloaters(state, player, card) / 3),
    [VariableAmount.FLOATERS]: getTotalFloaters,
    [VariableAmount.QUARTER_RESOURCES_ON_CARD]: (
        state: GameState,
        player: PlayerState,
        card?: Card
    ) => {
        return Math.floor(card?.storedResourceAmount! / 4);
    },
    [VariableAmount.THREE_IF_ONE_OR_MORE_RESOURCES]: (
        state: GameState,
        player: PlayerState,
        card?: Card
    ) => {
        if ((card?.storedResourceAmount || 0) > 0) {
            return 3;
        }

        return 0;
    },
    [VariableAmount.FOUR_IF_THREE_PLANT_TAGS_ELSE_ONE]: (state: GameState, player: PlayerState) => {
        const numPlantTags = getTags(player).filter(
            tag => tag === Tag.PLANT || tag === Tag.WILD
        ).length;

        if (numPlantTags >= 3) {
            return 4;
        }

        return 1;
    },
    [VariableAmount.THREE_IF_THREE_VENUS_TAGS_ELSE_ONE]: (
        state: GameState,
        player: PlayerState
    ) => {
        const numVenusTags = getTags(player).filter(
            tag => tag === Tag.VENUS || tag === Tag.WILD
        ).length;

        if (numVenusTags >= 3) {
            return 3;
        }

        return 1;
    },
    [VariableAmount.REVEALED_CARD_MICROBE]: (state: GameState) => {
        const {revealedCards} = state.common;
        const card = getCard(revealedCards[0]);
        return card.tags.includes(Tag.MICROBE) ? 1 : 0;
    },
    [VariableAmount.THIRD_ALL_CITIES]: (state: GameState, player: PlayerState) => {
        return Math.floor(getCellsWithCities(state, player).length / 3);
    },
    [VariableAmount.COLONIES]: (state: GameState, player: PlayerState) => {
        const colonies = state.common.colonies ?? [];
        return colonies.flatMap(colony => colony.colonies).filter(colony => colony === player.index)
            .length;
    },
    [VariableAmount.ALL_COLONIES]: (state: GameState, player: PlayerState) => {
        const colonies = state.common.colonies ?? [];
        return colonies.flatMap(colony => colony.colonies).length;
    },
    [VariableAmount.HALF_ALL_COLONIES]: (state: GameState, player: PlayerState) => {
        const colonies = state.common.colonies ?? [];
        return Math.floor(colonies.flatMap(colony => colony.colonies).length / 2);
    },
    [VariableAmount.INFLUENCE]: (state: GameState, player: PlayerState) => {
        const {turmoil} = state.common;
        if (!turmoil) return 0;
        const {index: playerIndex, baseInfluence} = player;
        let influence = baseInfluence || 0;
        const {dominantParty} = turmoil;
        const dominantDelegation = turmoil.delegations[dominantParty];
        const [leader, ...rest] = dominantDelegation;
        if (leader.playerIndex === playerIndex) {
            influence += 1;
        }
        if (rest.some(delegate => delegate.playerIndex === playerIndex)) {
            influence += 1;
        }
        if (turmoil.chairperson.playerIndex === playerIndex) {
            influence += 1;
        }
        return influence;
    },
    [VariableAmount.EACH_PARTY_WITH_AT_LEAST_ONE_DELEGATE]: (
        state: GameState,
        player: PlayerState
    ) => {
        const {turmoil} = state.common;
        if (!turmoil) return 0;
        let count = 0;
        for (const delegation in turmoil.delegations) {
            const delegates: Delegate[] = turmoil.delegations[delegation];
            if (delegates.some(delegate => delegate.playerIndex === player.index)) {
                count += 1;
            }
        }
        return count;
    },
    [VariableAmount.UNIQUE_TAGS]: (state: GameState, player: PlayerState) => {
        return new Set(getTags(player)).size;
    },
    [VariableAmount.TERRAFORM_RATING]: (state: GameState, player: PlayerState) => {
        return player.terraformRating;
    },
    [VariableAmount.CARDS_IN_HAND]: (state: GameState, player: PlayerState) => {
        return player.cards.length;
    },
    [VariableAmount.CARDS_IN_PLAY_COSTING_AT_LEAST_20]: (state: GameState, player: PlayerState) => {
        return player.playedCards.filter(card => {
            return (getCard(card).cost ?? 0) >= 20;
        }).length;
    },
    [VariableAmount.BLUE_CARD]: (state: GameState, player: PlayerState) => {
        return player.playedCards.filter(card => getCard(card).type === CardType.ACTIVE).length;
    },
    [VariableAmount.GREEN_CARD]: (state: GameState, player: PlayerState) => {
        return player.playedCards.filter(card => getCard(card).type === CardType.AUTOMATED).length;
    },
    [VariableAmount.REQUIREMENT_CARDS]: (state: GameState, player: PlayerState) => {
        return player.playedCards
            .map(card => getCard(card))
            .filter(card => {
                const someRequirement =
                    card.requiredChairman ||
                    card.requiredPartyLeader ||
                    card.requiredGlobalParameter ||
                    card.requiredPartyOrTwoDelegates ||
                    card.requiredProduction ||
                    card.requiredTags ||
                    card.requiredTilePlacements ||
                    card.requiredResources;
                return !!someRequirement;
            }).length;
    },
    [VariableAmount.TILES_ON_BOTTOM_TWO_ROWS]: (state: GameState, player: PlayerState) => {
        return getTilesOnBottomRows(state, player, 2);
    },
    [VariableAmount.TILES_ON_BOTTOM_FOUR_ROWS]: (state: GameState, player: PlayerState) => {
        return getTilesOnBottomRows(state, player, 4);
    },
};

export function getTotalFloaters(state: GameState, player: PlayerState, card?: Card) {
    let numFloaters = 0;
    for (const card of player.playedCards) {
        const fullCard = getCard(card);
        if (fullCard.storedResourceType !== Resource.FLOATER) {
            continue;
        }
        numFloaters += card.storedResourceAmount ?? 0;
    }
    return numFloaters;
}

function getTilesOnBottomRows(state: GameState, player: PlayerState, numRows: number): number {
    const {board} = state.common;
    // Exclude bottom row which is used for off mars cities.
    const indexOfLastRow = board.length - 2;
    let relevantRowIndexes: number[] = [];
    for (let i = 0; i < numRows; i++) {
        relevantRowIndexes.push(indexOfLastRow - i);
    }
    const relevantRows = relevantRowIndexes.map(rowIndex => board[rowIndex]);

    let count = 0;
    for (const row of relevantRows) {
        for (const cell of row) {
            if (isOwnedByCurrentPlayerExcludingLandClaim(cell, player)) {
                count += 1;
            }
        }
    }
    return count;
}
