import {Action} from './action';
import {TileType} from './board';
import {ExchangeRates} from './card-types';
import {Effect} from './effect';
import {sum} from './operation-amount';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export const MARS_FIRST = 'Mars First';
export const SCIENTISTS = 'Scientists';
export const UNITY = 'Unity';
export const GREENS = 'Greens';
export const REDS = 'Reds';
export const KELVINISTS = 'Kelvinists';

export type PartyConfig = {
    name: string;
    effect?: Effect;
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
            trigger: {placedTile: TileType.ANY_TILE},
            action: {gainResource: {[Resource.STEEL]: 1}},
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
                [Resource.MEGACREDIT]: sum({tag: Tag.VENUS}, {tag: Tag.EARTH}, {tag: Tag.JOVIAN}),
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
        },
        partyBonus: {
            gainResource: {
                [Resource.MEGACREDIT]: sum({tag: Tag.PLANT}, {tag: Tag.MICROBE}, {tag: Tag.ANIMAL}),
            },
        },
        symbol: '🌲',
        color: '#229522',
    },
    {
        name: REDS,
        effect: {
            trigger: {
                increaseTerraformRating: true,
            },
            action: {
                removeResource: {[Resource.MEGACREDIT]: 3},
            },
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

const PARTY_CONFIGS_BY_NAME: {[key: string]: PartyConfig} = {};
for (const partyConfig of PARTY_CONFIGS) {
    PARTY_CONFIGS_BY_NAME[partyConfig.name] = partyConfig;
}

export function getParty(name: string) {
    return PARTY_CONFIGS_BY_NAME[name];
}
