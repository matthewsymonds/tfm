import {Action} from './action';
import {TileType} from './board';
import {ExchangeRates} from './card-types';
import {CompleteEffect} from './effect';
import {sum} from './operation-amount';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export const MARS_FIRST = 'Mars First' as const;
export const SCIENTISTS = 'Scientists' as const;
export const UNITY = 'Unity' as const;
export const GREENS = 'Greens' as const;
export const REDS = 'Reds' as const;
export const KELVINISTS = 'Kelvinists' as const;

export type TurmoilParty =
    | typeof MARS_FIRST
    | typeof SCIENTISTS
    | typeof UNITY
    | typeof GREENS
    | typeof REDS
    | typeof KELVINISTS;

export type PartyConfig = {
    name: TurmoilParty;
    effect?: CompleteEffect;
    action?: Action;
    exchangeRates?: ExchangeRates;
    partyBonus: Action;
    symbol: string;
    color: string;
};

export const PARTY_CONFIGS: PartyConfig[] = [
    {
        name: MARS_FIRST,
        effect: {
            trigger: {placedTile: TileType.ANY_TILE, onMars: true},
            action: {gainResource: {[Resource.STEEL]: 1}},
            text: 'When you place a tile on Mars, gain 1 steel.',
        },
        partyBonus: {
            gainResource: {[Resource.MEGACREDIT]: {tag: Tag.BUILDING}},
        },
        symbol: '♂',
        color: '#853e0c',
    },
    {
        name: SCIENTISTS,
        action: {
            cost: 10,
            gainResource: {[Resource.CARD]: 3},
        },
        partyBonus: {
            gainResource: {[Resource.MEGACREDIT]: {tag: Tag.SCIENCE}},
        },
        symbol: '🧪',
        color: 'white',
    },
    {
        name: UNITY,
        exchangeRates: {
            [Resource.TITANIUM]: 1,
        },
        partyBonus: {
            gainResource: {
                [Resource.MEGACREDIT]: sum(
                    {tag: Tag.VENUS},
                    {tag: Tag.EARTH},
                    {tag: Tag.JOVIAN}
                ),
            },
        },
        symbol: '◯◯◯',
        color: 'linear-gradient(to right,#38388f,#3ca4c7,#38388f)',
    },
    {
        name: GREENS,
        effect: {
            trigger: {placedTile: TileType.GREENERY},
            action: {gainResource: {[Resource.MEGACREDIT]: 4}},
            text: 'When you place a greenery, gain 4 MC.',
        },
        partyBonus: {
            gainResource: {
                [Resource.MEGACREDIT]: sum(
                    {tag: Tag.PLANT},
                    {tag: Tag.MICROBE},
                    {tag: Tag.ANIMAL}
                ),
            },
        },
        symbol: '🌲',
        color: '#a3f9a3',
    },
    {
        name: REDS,
        effect: {
            trigger: {
                increasedTerraformRating: true,
            },
            action: {
                removeResource: {[Resource.MEGACREDIT]: 3},
            },
            text: 'When you increase your terraform rating, lose 3 MC for each step increased.',
        },
        symbol: '🚩',
        color: '#2a0e00',
        partyBonus: {
            increaseTerraformRating: {
                contest: VariableAmount.TERRAFORM_RATING,
                minimum: true,
                first: 1,
                second: 0,
                soloFirst: 20,
            },
        },
    },
    {
        name: KELVINISTS,
        action: {
            cost: 10,
            increaseProduction: {
                [Resource.ENERGY]: 1,
                [Resource.HEAT]: 1,
            },
        },
        partyBonus: {
            gainResource: {
                [Resource.MEGACREDIT]: {production: Resource.HEAT},
            },
        },
        symbol: '🔥',
        color: '#363636',
    },
];

const PARTY_CONFIGS_BY_NAME = PARTY_CONFIGS.reduce<{
    [key in TurmoilParty]: PartyConfig;
}>((acc, config) => {
    return {
        ...acc,
        [config.name]: config,
    };
}, {} as {[key in TurmoilParty]: PartyConfig});

export function getPartyConfig(name: TurmoilParty): PartyConfig {
    return PARTY_CONFIGS_BY_NAME[name];
}
