import {Action} from './action';
import {Parameter, t, TileType} from './board';
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
import {GREENS, KELVINISTS, MARS_FIRST, REDS, SCIENTISTS, UNITY} from './party';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export interface GlobalEvent {
    top: GlobalEventHalf;
    bottom: GlobalEventHalf;
    action: Action & {text: string};
    firstPlayerAction?: Action;
}

interface GlobalEventHalf {
    name: string;
    party: string;
}

interface GlobalEventHalf {
    name: string;
    party: string;
}

const triple = applyOperationAndOperand(Operation.MULTIPLY, 3);
const quadruple = applyOperationAndOperand(Operation.MULTIPLY, 4);

const MAX_GLOBAL_EVENT_QUANTITY = 5;

export const GLOBAL_EVENTS: GlobalEvent[] = [
    {
        top: {party: SCIENTISTS, name: 'AI Research'},
        bottom: {
            party: MARS_FIRST,
            name: 'Solarnet Shutdown',
        },
        action: {
            text: 'Lose 3 MC for each blue card (max 5, then reduced by influence.',
            removeResource: {
                [Resource.MEGACREDIT]: triple(
                    subtract(
                        max(VariableAmount.BLUE_CARD, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Antarctica Melts', party: KELVINISTS},
        bottom: {
            name: 'Red Influence',
            party: REDS,
        },
        action: {
            text:
                'Lose 3 MC for every 5 TR over 10 (max 5 sets). Increase MC production 1 step per influence.',
            removeResource: {
                [Resource.MEGACREDIT]: triple(
                    max(divide(subtract(VariableAmount.TERRAFORM_RATING, 10), 5), 5)
                ),
            },
            increaseProduction: {[Resource.MEGACREDIT]: VariableAmount.INFLUENCE},
        },
    },
    {
        top: {name: 'Bioengineering Boom', party: GREENS},
        bottom: {
            name: 'Spin-Off Products',
            party: SCIENTISTS,
        },
        action: {
            text: 'Gain 2 MC for each science tag (max 5) and influence.',

            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(
                        max({tag: Tag.SCIENCE}, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Charismatic WG President', party: UNITY},
        bottom: {
            name: 'Interplanetary Trade',
            party: UNITY,
        },
        action: {
            text: 'Gain 2MC for each space tag (max 5) and influence.',

            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(max({tag: Tag.SPACE}, MAX_GLOBAL_EVENT_QUANTITY), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Corporate Alliance', party: SCIENTISTS},
        bottom: {
            name: 'Sabotage',
            party: REDS,
        },
        action: {
            text: 'Decrease steel and energy production 1 step each. Gain 1 steel per influence.',

            decreaseProduction: {[Resource.ENERGY]: 1, [Resource.STEEL]: 1},
            gainResource: {
                [Resource.STEEL]: VariableAmount.INFLUENCE,
            },
        },
    },
    {
        top: {name: 'Democratic Reform', party: MARS_FIRST},
        bottom: {
            name: 'Aquifer Released By Public Council',
            party: GREENS,
        },
        action: {
            text: 'First player places an ocean tile. Gain 1 plant and 1 steel per influence.',
            gainResource: {
                [Resource.PLANT]: VariableAmount.INFLUENCE,
                [Resource.STEEL]: VariableAmount.INFLUENCE,
            },
        },
        firstPlayerAction: {
            tilePlacements: [t(TileType.OCEAN)],
            noParameterBonuses: true,
        },
    },
    {
        top: {name: 'Experimental Lifeforms', party: GREENS},
        bottom: {
            name: 'Eco Sabotage',
            party: REDS,
        },
        action: {
            text: 'Lose all plants except 3 + influence.',
            removeResource: {
                [Resource.PLANT]: subtract(
                    {resource: Resource.PLANT},
                    sum(3, VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Explore First Directive', party: REDS},
        bottom: {
            name: 'Scientific Community',
            party: SCIENTISTS,
        },
        action: {
            text: 'Gain 1 MC for each card in hand (no limit) and influence.',
            gainResource: {
                [Resource.MEGACREDIT]: sum(VariableAmount.CARDS_IN_HAND, VariableAmount.INFLUENCE),
            },
        },
    },
    {
        top: {name: 'Free Academia Treaty', party: SCIENTISTS},
        bottom: {
            name: 'Diversity',
            party: SCIENTISTS,
        },
        action: {
            text:
                'Gain 10 MC if you have 9 or more different tags. Influence counts as unique tags.',
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
        top: {name: 'Heat First Policy', party: KELVINISTS},
        bottom: {
            name: 'Global Dust Storm',
            party: GREENS,
        },
        action: {
            text:
                'Lose all heat. Lose 2 MC for each building tag (max 5, then reduced by influnece.',
            removeResource: {
                [Resource.HEAT]: {resource: Resource.HEAT},
                [Resource.MEGACREDIT]: double(
                    subtract(
                        max({tag: Tag.BUILDING}, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Increased Interplanetary Trade', party: SCIENTISTS},
        bottom: {
            name: 'Solar Flare',
            party: KELVINISTS,
        },
        action: {
            text: 'Lose 3 MC for each space tag (max 5, then reduced by influence).',
            removeResource: {
                [Resource.MEGACREDIT]: triple(
                    subtract(
                        max({tag: Tag.SPACE}, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Independence Movement', party: MARS_FIRST},
        bottom: {
            name: 'Riots',
            party: REDS,
        },
        action: {
            text: 'Lose 4MC for each city tile (max 5, then reduced by influence).',
            removeResource: {
                [Resource.MEGACREDIT]: quadruple(
                    subtract(
                        max(VariableAmount.CITY_TILES_IN_PLAY, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Local Terraforming Support', party: GREENS},
        bottom: {
            name: 'Successful Organisms',
            party: SCIENTISTS,
        },
        action: {
            text: 'Gain 1 plant per plant production (max 5) and influence.',
            gainResource: {
                [Resource.PLANT]: sum(
                    max({production: Resource.PLANT}, MAX_GLOBAL_EVENT_QUANTITY),
                    VariableAmount.INFLUENCE
                ),
            },
        },
    },
    {
        top: {name: 'Minimal Impact Policy', party: REDS},
        bottom: {
            name: 'Dry Deserts',
            party: UNITY,
        },
        action: {
            text:
                'First player removes 1 ocean tile from the gameboard. Gain 1 standard resource per influence.',
            gainStandardResources: VariableAmount.INFLUENCE,
        },
        firstPlayerAction: {
            removeTile: TileType.OCEAN,
        },
    },
    {
        top: {name: 'Mining Restrictions', party: REDS},
        bottom: {
            name: 'Asteroid Mining',
            party: UNITY,
        },
        action: {
            text: 'Gain 1 titanium for each Jovian tag (max 5) and influence.',
            gainResource: {
                [Resource.TITANIUM]: sum(
                    max({tag: Tag.JOVIAN}, MAX_GLOBAL_EVENT_QUANTITY),
                    VariableAmount.INFLUENCE
                ),
            },
        },
    },
    {
        top: {name: 'Mohole Lake', party: KELVINISTS},
        bottom: {
            name: 'Snow Cover',
            party: KELVINISTS,
        },
        action: {
            text: 'Decrease temperature 2 steps. Draw 1 card per influence.',
            gainResource: {
                [Resource.CARD]: VariableAmount.INFLUENCE,
            },
            decreaseParameter: {[Parameter.TEMPERATURE]: 2},
        },
    },
    {
        top: {name: 'Moral Movement', party: REDS},
        bottom: {
            name: 'Strong Society',
            party: MARS_FIRST,
        },
        action: {
            text: 'Gain 2 MC for each city tile (max 5) and influence.',
            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(
                        max(VariableAmount.CITY_TILES_IN_PLAY, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Patera Boring', party: SCIENTISTS},
        bottom: {
            name: 'Volcanic Eruptions',
            party: KELVINISTS,
        },
        action: {
            text: 'Increase temperature 2 steps. Increase heat production 1 step per influence.',
            increaseProduction: {
                [Resource.HEAT]: VariableAmount.INFLUENCE,
            },
        },
        firstPlayerAction: {
            increaseParameter: {[Parameter.TEMPERATURE]: 2},
            noParameterBonuses: true,
        },
    },
    {
        top: {name: 'Red Resistance', party: REDS},
        bottom: {
            name: 'Homeworld Support',
            party: KELVINISTS,
        },
        action: {
            text: 'Gain 2 MC for each Earth tag (max 5) and influence.',
            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(max({tag: Tag.EARTH}, MAX_GLOBAL_EVENT_QUANTITY), VariableAmount.INFLUENCE)
                ),
            },
        },
    },
    {
        top: {name: 'Rising Alloy Demand', party: MARS_FIRST},
        bottom: {
            name: 'Miners on Strike',
            party: GREENS,
        },
        action: {
            text: 'Lose 1 titanium for each Jovian tag (max 5, then reduced by influence).',
            removeResource: {
                [Resource.TITANIUM]: subtract(
                    max({tag: Tag.JOVIAN}, MAX_GLOBAL_EVENT_QUANTITY),
                    VariableAmount.INFLUENCE
                ),
            },
        },
    },
    {
        top: {name: 'Science Summit', party: SCIENTISTS},
        bottom: {
            name: 'Sponsored Products',
            party: GREENS,
        },
        action: {
            text:
                'All cards with resources on them gain 1 resource. Draw 1 card for each influence.',
            increaseStoredResourceAmount: 1,
            gainResource: {[Resource.CARD]: VariableAmount.INFLUENCE},
        },
    },
    {
        top: {name: 'Scientific Consensus', party: KELVINISTS},
        bottom: {name: 'Paradigm Breakdown', party: REDS},
        action: {
            text: 'Discard 2 cards from hand. Gain 2 MC per influence.',
            removeResource: {
                [Resource.CARD]: 2,
            },
            gainResource: {
                [Resource.MEGACREDIT]: double(VariableAmount.INFLUENCE),
            },
        },
    },
    {
        top: {name: 'Scientific Progress', party: SCIENTISTS},
        bottom: {name: 'Productivity', party: MARS_FIRST},
        action: {
            text: 'Gain 1 steel for each steel production (max 5) and influence.',
            gainResource: {
                [Resource.STEEL]: sum({production: Resource.STEEL}, VariableAmount.INFLUENCE),
            },
        },
    },
    {
        top: {name: 'Second Energy Crisis', party: SCIENTISTS},
        bottom: {name: 'Improved Energy Templates', party: KELVINISTS},
        action: {
            text:
                'Increase energy production 1 step per 2 power tags (no limit). Influence counts as power tags.',
            increaseProduction: {
                [Resource.ENERGY]: divide(sum({tag: Tag.POWER}, VariableAmount.INFLUENCE), 2),
            },
        },
    },
    {
        top: {name: 'Self-Sufficiency Program', party: GREENS},
        bottom: {
            name: 'Election',
            party: MARS_FIRST,
        },
        action: {
            text:
                'Count your influence plus building tags and city tiles (no limits). The player with the most (or 10 in solo) gains 2 TR, the 2nd (or counting 5 in solo) gains 1 TR (ties are friendly).',
            increaseTerraformRating: {
                contest: sum(
                    VariableAmount.CITY_TILES_IN_PLAY,
                    {tag: Tag.BUILDING},
                    VariableAmount.INFLUENCE
                ),
                first: 2,
                second: 1,
                soloFirst: 10,
                soloSecond: 5,
            },
        },
    },
    {
        top: {name: 'Separatist Movement', party: MARS_FIRST},
        bottom: {name: 'War on Earth', party: KELVINISTS},
        action: {
            decreaseTerraformRating: subtract(4, VariableAmount.INFLUENCE),
            text: 'Reduce TR 4 steps. Each influence prevents 1 step.',
        },
    },
    {
        top: {name: 'Solarnet', party: SCIENTISTS},
        bottom: {name: 'Celebrity Leaders', party: GREENS},
        action: {
            text: 'Gain 2 MC for each event played (max 5) and influence.',
            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(
                        max(VariableAmount.PLAYER_EVENTS, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Terraforming Lobbying', party: KELVINISTS},
        bottom: {name: 'Generous Funding', party: UNITY},
        action: {
            text:
                'Gain 2 MC for each influence and each complete set of 5 TR over 15 (max 5 sets).',
            gainResource: {
                [Resource.MEGACREDIT]: double(
                    sum(
                        max(divide(subtract(VariableAmount.TERRAFORM_RATING, 15), 5), 5),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Thaw Mining', party: KELVINISTS},
        bottom: {name: 'Mud Slides', party: GREENS},
        action: {
            text: 'Lose 4 MC for each tile adjacent to ocean (max 5, then reduced by influence).',
            removeResource: {
                [Resource.MEGACREDIT]: quadruple(
                    subtract(
                        max(VariableAmount.TILES_ADJACENT_TO_OCEAN, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'Viral Modifications Approved', party: GREENS},
        bottom: {name: 'Pandemic', party: MARS_FIRST},
        action: {
            text: 'Lose 3 MC for each building tag (max 5, then reduced by influence).',
            removeResource: {
                [Resource.MEGACREDIT]: triple(
                    subtract(
                        max({tag: Tag.BUILDING}, MAX_GLOBAL_EVENT_QUANTITY),
                        VariableAmount.INFLUENCE
                    )
                ),
            },
        },
    },
    {
        top: {name: 'World Government Directives', party: UNITY},
        bottom: {name: 'Revolution', party: MARS_FIRST},
        action: {
            text:
                'Count Earth tags and ADD(!) influence. The player(s) with the most (at least 1) loses 2 TR, and 2nd most (at least 1) loses 1 TR. SOLO: Lose 2 TR if the sum is 4 or more.',
            decreaseTerraformRating: {
                contest: sum({tag: Tag.EARTH}, VariableAmount.INFLUENCE),
                first: 2,
                second: 1,
                soloFirst: 4,
            },
        },
    },
];

export function getGlobalEvent(name: string) {
    return GLOBAL_EVENTS.find(event => event.top.name === name);
}
