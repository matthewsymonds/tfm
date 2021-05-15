import {TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {getLoggedInPlayer} from 'context/app-context';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {SerializedCard} from 'state-serialization';
import {
    findCellWithTile,
    getAdjacentCellsForCell,
    getCellsWithCities,
    getCellsWithCitiesOnMars,
} from './board';
import {hasCity} from 'constants/board';
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
    [VariableAmount.TRIPLE_BASED_ON_USER_CHOICE]: (state: GameState) =>
        state.pendingVariableAmount! * 3,
    [VariableAmount.ALL_EVENTS]: (state: GameState) => {
        return state.players.flatMap(player => {
            return getPlayedCards(player).filter(card => card.tags.includes(Tag.EVENT));
        }).length;
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
        const numPlantTags = getTags(player).filter(tag => tag === Tag.PLANT || tag === Tag.WILD)
            .length;

        if (numPlantTags >= 3) {
            return 4;
        }

        return 1;
    },
    [VariableAmount.THREE_IF_THREE_VENUS_TAGS_ELSE_ONE]: (
        state: GameState,
        player: PlayerState
    ) => {
        const numVenusTags = getTags(player).filter(tag => tag === Tag.VENUS || tag === Tag.WILD)
            .length;

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
};
