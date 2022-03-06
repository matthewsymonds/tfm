import {GameState} from 'reducer';
import {isPlayingVenus} from 'selectors/is-playing-expansion';
import {Amount} from './action';
import {TileType} from './board';
import {sum} from './operation-amount';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export interface AwardConfig {
    name: string;
    description: string;
    amount: Amount;
}

export const AWARD_CONFIGS: AwardConfig[] = [
    {
        name: 'Banker',
        description: 'Highest MC production wins',
        amount: {production: Resource.MEGACREDIT},
    },
    {
        name: 'Landlord',
        description: 'Most tiles (on or off Mars) wins',
        amount: VariableAmount.PLAYER_TILES,
    },
    {
        name: 'Miner',
        description: 'Most titanium and steel resources wins',
        amount: sum({resource: Resource.STEEL}, {resource: Resource.TITANIUM}),
    },
    {
        name: 'Scientist',
        description: 'Most science tags wins',
        amount: {tag: Tag.SCIENCE, includeWildcard: false},
    },
    {
        name: 'Thermalist',
        description: 'Most heat resources wins',
        amount: {resource: Resource.HEAT},
    },
    {
        name: 'Venuphile',
        description: 'Most Venus tags wins',
        amount: {tag: Tag.VENUS, includeWildcard: false},
    },
    // Hellas
    {
        name: 'Cultivator',
        description: 'Most greenery tiles wins',
        amount: {tile: TileType.GREENERY},
    },
    {
        name: 'Magnate',
        description: 'Most automated (green) cards wins',
        amount: VariableAmount.GREEN_CARD,
    },
    {
        name: 'Space Baron',
        description: 'Most space tags wins',
        amount: {tag: Tag.SPACE, includeWildcard: false},
    },
    {
        name: 'Excentric',
        description: 'Most resources on cards wins',
        amount: VariableAmount.RESOURCES_ON_CARDS,
    },
    {
        name: 'Contractor',
        description: 'Player with the most building tags wins',
        amount: {tag: Tag.BUILDING, includeWildcard: false},
    },
    // Elysium
    {
        name: 'Celebrity',
        description: 'Most cards in play costing at least 20 MC wins',
        amount: VariableAmount.CARDS_IN_PLAY_COSTING_AT_LEAST_20,
    },
    {
        name: 'Industrialist',
        description: 'Most steel and energy resources wins',
        amount: sum({resource: Resource.STEEL}, {resource: Resource.ENERGY}),
    },
    {
        name: 'Desert Settler',
        description: 'Most tiles in bottom 4 rows wins',
        amount: VariableAmount.TILES_ON_BOTTOM_FOUR_ROWS,
    },
    {
        name: 'Estate Dealer',
        description: 'Most tiles adjacent to oceans wins',
        amount: VariableAmount.TILES_ADJACENT_TO_OCEAN,
    },
    {
        name: 'Benefactor',
        description: 'Highest TR at end of final round wins',
        amount: VariableAmount.TERRAFORM_RATING,
    },
];

const AWARD_CONFIGS_BY_NAME: {[name: string]: AwardConfig} = {};
for (const award of AWARD_CONFIGS) {
    AWARD_CONFIGS_BY_NAME[award.name.toLowerCase()] = award;
}

export function getAward(name: string): AwardConfig {
    const found = AWARD_CONFIGS_BY_NAME[name.toLowerCase()];
    if (!found) throw new Error('award not found');
    return found;
}

export const DEFAULT_AWARDS = ['Banker', 'Landlord', 'Miner', 'Scientist', 'Thermalist'];

const HELLAS_AWARDS = ['Cultivator', 'Magnate', 'Space Baron', 'Excentric', 'Contractor'];

const ELYSIUM_AWARDS = [
    'Celebrity',
    'Industrialist',
    'Desert Settler',
    'Estate Dealer',
    'Benefactor',
];

export function getAwards(state: GameState) {
    const venuphile = isPlayingVenus(state) ? ['Venuphile'] : [];

    if (state?.boardName === 'Tharsis') {
        return [...DEFAULT_AWARDS, ...venuphile];
    }
    if (state?.boardName === 'Hellas') {
        return [...HELLAS_AWARDS, ...venuphile];
    }
    if (state?.boardName === 'Elysium') {
        return [...ELYSIUM_AWARDS, ...venuphile];
    }

    return [...DEFAULT_AWARDS, ...venuphile];
}
