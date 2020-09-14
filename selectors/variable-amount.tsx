import {TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {getLoggedInPlayer} from 'context/app-context';
import {Card} from 'models/card';
import {PlayerState, RootState} from 'reducer';
import {
    findCellWithTile,
    getAdjacentCellsForCell,
    getCellsWithCities,
    getCellsWithCitiesOnMars,
} from './board';

type VariableAmountSelectors = {
    [k in VariableAmount]?: (
        state: RootState,
        player: PlayerState,
        card: Card | undefined
    ) => number;
};

export function getTags(player: PlayerState): Tag[] {
    return getNonEventCards(player).flatMap(card => card.tags);
}

function getNonEventCards(player: PlayerState): Card[] {
    return player.playedCards.filter(card => card.type !== CardType.EVENT);
}

export function getEventCards(player: PlayerState): Card[] {
    return player.playedCards.filter(card => card.type === CardType.EVENT);
}

export const VARIABLE_AMOUNT_SELECTORS: VariableAmountSelectors = {
    // Must have at least one of a resource to exchange it with something else!
    [VariableAmount.USER_CHOICE]: () => 1,
    // You can play insulation just to get the card out, but not change any production.
    [VariableAmount.USER_CHOICE_MIN_ZERO]: () => 0,
    [VariableAmount.BASED_ON_USER_CHOICE]: (state: RootState) => state.pendingVariableAmount!,
    [VariableAmount.TRIPLE_BASED_ON_USER_CHOICE]: (state: RootState) =>
        state.pendingVariableAmount! * 3,
    [VariableAmount.ALL_EVENTS]: (state: RootState) => {
        return state.players.flatMap(player => {
            return player.playedCards.filter(card => card.tags.includes(Tag.EVENT));
        }).length;
    },
    [VariableAmount.CARDS_WITHOUT_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return player.playedCards.filter(
            card => card.type !== CardType.EVENT && card.tags.length === 0
        ).length;
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
    [VariableAmount.CITY_TILES_IN_PLAY]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return getCellsWithCities(state, player).length;
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
    [VariableAmount.EARTH_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return getTags(player).filter(tag => tag === Tag.EARTH).length;
    },
    [VariableAmount.HALF_BUILDING_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return Math.floor(getTags(player).filter(tag => tag === Tag.BUILDING).length / 2);
    },
    [VariableAmount.VENUS_AND_EARTH_TAGS]: (
        state: RootState,
        player = getLoggedInPlayer(state)
    ) => {
        return getTags(player).filter(tag => tag === Tag.EARTH || tag === Tag.VENUS).length;
    },
    [VariableAmount.POWER_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return getTags(player).filter(tag => tag === Tag.POWER).length;
    },
    [VariableAmount.PLANT_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return getTags(player).filter(tag => tag === Tag.PLANT).length;
    },
    [VariableAmount.OPPONENTS_SPACE_TAGS]: (
        state: RootState,
        player = getLoggedInPlayer(state)
    ) => {
        return state.players
            .filter(p => p !== player)
            .flatMap(player => getTags(player))
            .filter(tag => tag === Tag.SPACE).length;
    },
    [VariableAmount.VENUS_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return getTags(player).filter(tag => tag === Tag.VENUS).length;
    },
    [VariableAmount.SPACE_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return getTags(player).filter(tag => tag === Tag.SPACE).length;
    },
    [VariableAmount.JOVIAN_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return getTags(player).filter(tag => tag === Tag.JOVIAN).length;
    },
    [VariableAmount.HALF_MICROBE_TAGS]: (state: RootState, player = getLoggedInPlayer(state)) => {
        return Math.floor(getTags(player).filter(tag => tag === Tag.MICROBE).length / 2);
    },
    [VariableAmount.PLANT_CONVERSION_AMOUNT]: (
        state: RootState,
        player = getLoggedInPlayer(state)
    ) => {
        return 8 - (player.plantDiscount || 0);
    },
    [VariableAmount.RESOURCES_ON_CARD]: (state: RootState, player: PlayerState, card?: Card) => {
        return card?.storedResourceAmount!;
    },
    [VariableAmount.TWICE_RESOURCES_ON_CARD]: (
        state: RootState,
        player: PlayerState,
        card?: Card
    ) => {
        return card?.storedResourceAmount! * 2;
    },
    [VariableAmount.HALF_RESOURCES_ON_CARD]: (
        state: RootState,
        player: PlayerState,
        card?: Card
    ) => {
        return Math.floor(card?.storedResourceAmount! / 2);
    },
    [VariableAmount.THIRD_RESOURCES_ON_CARD]: (
        state: RootState,
        player: PlayerState,
        card?: Card
    ) => {
        return Math.floor(card?.storedResourceAmount! / 3);
    },
    [VariableAmount.QUARTER_RESOURCES_ON_CARD]: (
        state: RootState,
        player: PlayerState,
        card?: Card
    ) => {
        return Math.floor(card?.storedResourceAmount! / 4);
    },
    [VariableAmount.THREE_IF_ONE_OR_MORE_RESOURCES]: (
        state: RootState,
        player: PlayerState,
        card?: Card
    ) => {
        if ((card?.storedResourceAmount || 0) > 0) {
            return 3;
        }

        return 0;
    },
    [VariableAmount.FOUR_IF_THREE_PLANT_TAGS_ELSE_ONE]: (state: RootState) => {
        const player = getLoggedInPlayer(state);
        const numPlantTags = getTags(player).filter(tag => tag === Tag.PLANT).length;

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
        const player = getLoggedInPlayer(state);
        return Math.floor(getCellsWithCities(state, player).length / 3);
    },
};
