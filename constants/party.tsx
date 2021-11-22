import {Action} from './action';
import {TileType} from './board';
import {ExchangeRates} from './card-types';
import {Effect} from './effect';
import {sum} from './operation-amount';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export enum Party {
    MARS_FIRST = 'partyMarsFirst',
    SCIENTISTS = 'partyScientists',
    UNITY = 'partyUnity',
    GREENS = 'partyGreens',
    REDS = 'partyReds',
    KELVINISTS = 'partyKelvinists',
}

type PartyConfig = {
    name: string;
    effect?: Effect;
    action?: Action;
    exchangeRates?: ExchangeRates;
    partyBonus: Action;
};

export const PARTY_CONFIGS: {[k in Party]: PartyConfig} = {
    [Party.MARS_FIRST]: {
        name: 'Mars First',
        effect: {
            trigger: {placedTile: TileType.ANY_TILE},
            action: {gainResource: {[Resource.STEEL]: 1}},
        },
        partyBonus: {
            gainResource: {[Resource.MEGACREDIT]: {tag: Tag.BUILDING}},
        },
    },
    [Party.SCIENTISTS]: {
        name: 'Scientists',
        action: {
            cost: 10,
            gainResource: {[Resource.CARD]: 3},
        },
        partyBonus: {
            gainResource: {[Resource.MEGACREDIT]: {tag: Tag.SCIENCE}},
        },
    },
    [Party.UNITY]: {
        name: 'Unity',
        exchangeRates: {
            [Resource.TITANIUM]: 1,
        },
        partyBonus: {
            gainResource: {
                [Resource.MEGACREDIT]: sum({tag: Tag.VENUS}, {tag: Tag.EARTH}, {tag: Tag.JOVIAN}),
            },
        },
    },
    [Party.GREENS]: {
        name: 'Greens',
        effect: {
            trigger: {placedTile: TileType.GREENERY},
            action: {gainResource: {[Resource.MEGACREDIT]: 4}},
        },
        partyBonus: {
            gainResource: {
                [Resource.MEGACREDIT]: sum({tag: Tag.PLANT}, {tag: Tag.MICROBE}, {tag: Tag.ANIMAL}),
            },
        },
    },
    [Party.REDS]: {
        name: 'Reds',
        effect: {
            trigger: {
                increaseTerraformRating: true,
            },
            action: {
                removeResource: {[Resource.MEGACREDIT]: 3},
            },
        },
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
    [Party.KELVINISTS]: {
        name: 'Kelvinists',
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
    },
};
