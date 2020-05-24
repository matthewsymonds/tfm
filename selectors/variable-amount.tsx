import {VariableAmount} from 'constants/variable-amount';
import {RootState, PlayerState} from 'reducer';
import {
    getCellsWithCitiesOnMars,
    getAdjacentCellsForCell,
    getCellsWithCities,
    findCellWithTile,
} from './board';
import {TileType} from 'constants/board';
import {Tag} from 'constants/tag';
import {Card} from 'models/card';
import {Resource} from 'constants/resource';
import {getLoggedInPlayer} from 'context/app-context';

type VariableAmountSelectors = {
    [k in VariableAmount]?: (state: RootState, card?: Card) => number;
};

function getTags(player: PlayerState): Tag[] {
    return player.playedCards.flatMap(card => card.tags);
}

export const VARIABLE_AMOUNT_SELECTORS: VariableAmountSelectors = {
    [VariableAmount.BASED_ON_USER_CHOICE]: (state: RootState) => state.pendingVariableAmount!,
    [VariableAmount.TRIPLE_BASED_ON_USER_CHOICE]: (state: RootState) =>
        state.pendingVariableAmount! * 3,
    [VariableAmount.ALL_EVENTS]: (state: RootState) => {
        return state.players.flatMap(player => {
            return player.playedCards.filter(card => card.tags.includes(Tag.EVENT));
        }).length;
    },
    [VariableAmount.CARDS_WITHOUT_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return player.cards.filter(card => card.tags.length === 0).length;
    },
    [VariableAmount.CITIES_ON_MARS]: (state: RootState) => {
        return getCellsWithCitiesOnMars(state).length;
    },
    [VariableAmount.CITY_TILES_ADJACENT_TO_COMMERCIAL_DISTRICT]: (state: RootState) => {
        const commercialDistrict = findCellWithTile(state, TileType.COMMERCIAL_DISTRICT);
        if (!commercialDistrict) return 0;
        return getAdjacentCellsForCell(state, commercialDistrict!).filter(cell => {
            return cell.tile?.type === TileType.CITY;
        }).length;
    },
    [VariableAmount.CITY_TILES_IN_PLAY]: (state: RootState) => {
        return getCellsWithCities(state).length;
    },
    [VariableAmount.OCEANS_ADJACENT_TO_CAPITAL]: (state: RootState) => {
        const capital = findCellWithTile(state, TileType.CAPITAL);
        if (!capital) return 0;
        return getAdjacentCellsForCell(state, capital!).filter(cell => {
            return cell.tile?.type === TileType.OCEAN;
        }).length;
    },
    [VariableAmount.MINING_AREA_CELL_HAS_STEEL_BONUS]: (state: RootState) => {
        const mining = findCellWithTile(state, TileType.MINING_AREA);
        return mining?.bonus?.includes(Resource.STEEL) ? 1 : 0;
    },
    [VariableAmount.MINING_AREA_CELL_HAS_TITANIUM_BONUS]: (state: RootState) => {
        const mining = findCellWithTile(state, TileType.MINING_AREA);
        return mining?.bonus?.includes(Resource.TITANIUM) ? 1 : 0;
    },
    [VariableAmount.MINING_RIGHTS_CELL_HAS_STEEL_BONUS]: (state: RootState) => {
        const mining = findCellWithTile(state, TileType.MINING_RIGHTS);
        return mining?.bonus?.includes(Resource.STEEL) ? 1 : 0;
    },
    [VariableAmount.MINING_RIGHTS_CELL_HAS_TITANIUM_BONUS]: (state: RootState) => {
        const mining = findCellWithTile(state, TileType.MINING_RIGHTS);
        return mining?.bonus?.includes(Resource.TITANIUM) ? 1 : 0;
    },
    [VariableAmount.EARTH_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return getTags(player).filter(tag => tag === Tag.EARTH).length;
    },
    [VariableAmount.HALF_BUILDING_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return Math.floor(getTags(player).filter(tag => tag === Tag.BUILDING).length / 2);
    },
    [VariableAmount.VENUS_AND_EARTH_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return getTags(player).filter(tag => tag === Tag.EARTH || tag === Tag.VENUS).length;
    },
    [VariableAmount.POWER_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return getTags(player).filter(tag => tag === Tag.POWER).length;
    },
    [VariableAmount.PLANT_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return getTags(player).filter(tag => tag === Tag.PLANT).length;
    },
    [VariableAmount.OPPONENTS_SPACE_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return state.players
            .filter(p => p !== player)
            .flatMap(player => player.playedCards)
            .flatMap(card => card.tags)
            .filter(tag => tag === Tag.SPACE).length;
    },
    [VariableAmount.VENUS_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return getTags(player).filter(tag => tag === Tag.VENUS).length;
    },
    [VariableAmount.SPACE_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return getTags(player).filter(tag => tag === Tag.SPACE).length;
    },
    [VariableAmount.JOVIAN_TAGS]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        return getTags(player).filter(tag => tag === Tag.JOVIAN).length;
    },
    [VariableAmount.RESOURCES_ON_CARD]: (state: RootState, card?: Card) => {
        return card?.storedResourceAmount!;
    },
    [VariableAmount.TWICE_RESOURCES_ON_CARD]: (state: RootState, card?: Card) => {
        return card?.storedResourceAmount! * 2;
    },
    [VariableAmount.HALF_RESOURCES_ON_CARD]: (state: RootState, card?: Card) => {
        return Math.floor(card?.storedResourceAmount! / 2);
    },
    [VariableAmount.THIRD_RESOURCES_ON_CARD]: (state: RootState, card?: Card) => {
        return Math.floor(card?.storedResourceAmount! / 3);
    },
    [VariableAmount.QUARTER_RESOURCES_ON_CARD]: (state: RootState, card?: Card) => {
        return Math.floor(card?.storedResourceAmount! / 4);
    },
    [VariableAmount.THREE_IF_SEARCH_FOR_LIFE_HAS_ONE_OR_MORE_RESOURCES]: (
        state: RootState,
        card?: Card
    ) => {
        if ((card?.storedResourceAmount || 0) > 0) {
            return 3;
        }

        return 0;
    },
    [VariableAmount.FOUR_IF_THREE_PLANT_TAGS_ELSE_ONE]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        const numPlantTags = player.cards
            .flatMap(card => card.tags)
            .filter(tag => tag === Tag.PLANT).length;

        if (numPlantTags >= 3) {
            return 4;
        }

        return 1;
    },
    [VariableAmount.REVEALED_CARD_MICROBE]: (state: RootState) => {
        const {revealedCards} = state.common;
        const [card] = revealedCards;
        return card.tags.includes(Tag.MICROBE) ? 1 : 0;
    },
    [VariableAmount.THIRD_ALL_CITIES]: (state: RootState) => {
        return Math.floor(getCellsWithCities(state).length / 3);
    },
};
