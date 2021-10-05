import {Action} from './action';
import {t, TileType} from './board';
import {Condition} from './conditional-amount';
import {
    applyOperationAndOperand,
    divide,
    double,
    max,
    Operation,
    subtract,
    sum,
} from './operation-amount';
import {Party} from './party';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export interface GlobalEvent {
    top: GlobalEventTop;
    bottom: GlobalEventBottom;
    action: Action;
}

interface GlobalEventTop {
    name: string;
    party: Party;
}

interface GlobalEventBottom {
    name: string;
    party: Party;
    text: string;
}

const triple = applyOperationAndOperand(Operation.MULTIPLY, 3);
const quadruple = applyOperationAndOperand(Operation.MULTIPLY, 4);

export const GLOBAL_EVENTS: GlobalEvent[] = [
    {
        top: {party: Party.SCIENTISTS, name: 'AI Research'},
        bottom: {
            party: Party.MARS_FIRST,
            name: 'Solarnet Shutdown',
            text: 'Lose 3 MC for each blue card (max 5, then reduced by influence.',
        },
        action: {
            removeResource: {
                [Resource.MEGACREDIT]: triple(
                    subtract(max(VariableAmount.BLUE_CARD, 5), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Antarctica Melts', party: Party.KELVINISTS},
        bottom: {
            name: 'Red Influence',
            text:
                'Lose 3 MC for every 5 TR over 10 (max 5 sets). Increase MC production 1 step per influence.',
            party: Party.REDS,
        },
        action: {
            removeResource: {
                [Resource.MEGACREDIT]: triple(
                    max(divide(subtract(VariableAmount.TERRAFORM_RATING, 10), 5), 5)
                ),
            },
            increaseProduction: {[Resource.MEGACREDIT]: VariableAmount.INFLUENCE},
        },
    },
    {
        top: {name: 'Bioengineering Boom', party: Party.GREENS},
        bottom: {
            name: 'Spin-Off Products',
            party: Party.SCIENTISTS,
            text: 'Gain 2 MC for each science tag (max 5) and influence.',
        },
        action: {
            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(max({tag: Tag.SCIENCE}, 5), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Charismatic WG President', party: Party.SCIENTISTS},
        bottom: {
            name: 'Interplanetary Trade',
            party: Party.SCIENTISTS,
            text: 'Gain 2MC for each space tag (max 5) and influence.',
        },
        action: {
            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(max({tag: Tag.SPACE}, 5), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Corporate Alliance', party: Party.SCIENTISTS},
        bottom: {
            name: 'Sabotage',
            party: Party.REDS,
            text: 'Decrease steel and energy production 1 step each. Gain 1 steel per influence.',
        },
        action: {
            decreaseProduction: {[Resource.ENERGY]: 1, [Resource.STEEL]: 1},
            gainResource: {
                [Resource.STEEL]: VariableAmount.INFLUENCE,
            },
        },
    },
    {
        top: {name: 'Democratic Reform', party: Party.MARS_FIRST},
        bottom: {
            name: 'Aquifer Released By Public Council',
            party: Party.GREENS,
            text: 'First player places an ocean tile. Gain 1 plant and 1 steel per influence.',
        },
        action: {
            tilePlacements: [t(TileType.OCEAN)],
            gainResource: {
                [Resource.PLANT]: VariableAmount.INFLUENCE,
                [Resource.STEEL]: VariableAmount.INFLUENCE,
            },
        },
    },
    {
        top: {name: 'Experimental Lifeforms', party: Party.GREENS},
        bottom: {
            name: 'Eco Sabotage',
            party: Party.REDS,
            text: 'Lose all plants except 3 + influence.',
        },
        action: {
            removeResource: {
                [Resource.PLANT]: subtract(
                    VariableAmount.PLAYER_PLANTS,
                    sum(3, VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Explore First Directive', party: Party.REDS},
        bottom: {
            name: 'Scientific Community',
            party: Party.SCIENTISTS,
            text: 'Gain 1 MC for each card in hand (no limit) and influence.',
        },
        action: {
            gainResource: {
                [Resource.MEGACREDIT]: sum(VariableAmount.CARDS_IN_HAND, VariableAmount.INFLUENCE),
            },
        },
    },
    {
        top: {name: 'Free Academia Treaty', party: Party.SCIENTISTS},
        bottom: {
            name: 'Diversity',
            party: Party.SCIENTISTS,
            text:
                'Gain 10 MC if you have 9 or more different tags. Influence counts as unique tags.',
        },
        action: {
            gainResource: {
                [Resource.MEGACREDIT]: {
                    condition: Condition.GREATER_THAN_OR_EQUAL_TO,
                    operands: [VariableAmount.UNIQUE_TAGS, 9],
                    pass: 10,
                    fail: 0,
                },
            },
        },
    },
    {
        top: {name: 'Heat First Policy', party: Party.KELVINISTS},
        bottom: {
            name: 'Global Dust Storm',
            party: Party.GREENS,
            text:
                'Lose all heat. Lose 2 MC for each building tag (max 5, then reduced by influnece.',
        },
        action: {
            removeResource: {
                [Resource.HEAT]: VariableAmount.PLAYER_HEAT,
                [Resource.MEGACREDIT]: double(
                    subtract(max({tag: Tag.BUILDING}, 5), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Increased Interplanetary Trade', party: Party.SCIENTISTS},
        bottom: {
            name: 'Solar Flare',
            party: Party.KELVINISTS,
            text: 'Lose 3 MC for each space tag (max 5, then reduced by influence).',
        },
        action: {
            removeResource: {
                [Resource.MEGACREDIT]: triple(
                    subtract(max({tag: Tag.SPACE}, 5), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Independence Movement', party: Party.MARS_FIRST},
        bottom: {
            name: 'Riots',
            party: Party.REDS,
            text: 'Lose 4MC for each city Tile (max 5, then reduced by influence).',
        },
        action: {
            removeResource: {
                [Resource.MEGACREDIT]: quadruple(
                    subtract(max(VariableAmount.CITY_TILES, 5), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Local Terraforming Support', party: Party.GREENS},
        bottom: {
            name: 'Successful Organisms',
            party: Party.SCIENTISTS,
            text: 'Gain 1 plant per plant production (max 5) and influence.',
        },
        action: {
            gainResource: {
                [Resource.PLANT]: sum(
                    max(VariableAmount.PLANT_PRODUCTION, 5),
                    VariableAmount.INFLUENCE
                ),
            },
        },
    },
    {
        top: {name: 'Minimal Impact Policy', party: Party.REDS},
        bottom: {
            name: 'Dry Deserts',
            party: Party.UNITY,
            text:
                'First player removes 1 ocean tile from the gameboard. Gain 1 standard resource per influence.',
        },
        action: {
            // TODO: remove 1 ocean, gain 1 standard resource per influence.
        },
    },
    {
        top: {name: 'Minimal Impact Policy', party: Party.REDS},
        bottom: {
            name: 'Dry Deserts',
            party: Party.UNITY,
            text:
                'First player removes 1 ocean tile from the gameboard. Gain 1 standard resource per influence.',
        },
        action: {
            // TODO: remove 1 ocean, gain 1 standard resource per influence.
        },
    },
];
