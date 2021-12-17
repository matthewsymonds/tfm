import {GameState} from 'reducer';
import {isPlayingVenus} from 'selectors/is-playing-venus';
import {Amount} from './action';
import {TileType} from './board';
import {Condition} from './conditional-amount';
import {max, sum} from './operation-amount';
import {STANDARD_RESOURCES} from './resource';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export interface MilestoneConfig {
    name: string;
    requirementText: string;
    amount: Amount;
    quantity: Amount;
}

export const MILESTONE_CONFIGS: MilestoneConfig[] = [
    {
        name: 'Terraformer',
        requirementText: 'Requires 35 terraform rating (26 with Turmoil)',
        amount: VariableAmount.TERRAFORM_RATING,
        quantity: {condition: Condition.TURMOIL, operands: [], pass: 26, fail: 35},
    },
    {
        name: 'Mayor',
        requirementText: 'Requires 3 cities',
        amount: {tile: TileType.CITY},
        quantity: 3,
    },
    {
        name: 'Gardener',
        requirementText: 'Requires 3 greeneries',
        amount: {tile: TileType.GREENERY},
        quantity: 3,
    },
    {
        name: 'Builder',
        requirementText: 'Requires 8 building tags',
        amount: {tag: Tag.BUILDING},
        quantity: 8,
    },
    {
        name: 'Planner',
        requirementText: 'Requires 16 cards in hand',
        amount: VariableAmount.CARDS_IN_HAND,
        quantity: 16,
    },
    {
        name: 'Hoverlord',
        requirementText: 'Requires 7 floaters',
        amount: VariableAmount.FLOATERS,
        quantity: 7,
    },
    // Hellas
    {
        name: 'Diversifier',
        requirementText: 'Requires 10 unique tags in play',
        amount: VariableAmount.UNIQUE_TAGS,
        quantity: 10,
    },
    {
        name: 'Tactician',
        requirementText: 'Requires 5 requirement cards',
        amount: VariableAmount.REQUIREMENT_CARDS,
        quantity: 5,
    },
    {
        name: 'Polar Explorer',
        requirementText: 'Requires 3 tiles on the bottom 2 rows',
        amount: VariableAmount.TILES_ON_BOTTOM_TWO_ROWS,
        quantity: 3,
    },
    {
        name: 'Energizer',
        requirementText: 'Requires 6 energy production',
        amount: {production: Resource.ENERGY},
        quantity: 6,
    },
    {
        name: 'Rim Settler',
        requirementText: 'Requires 3 jovian tags',
        amount: {tag: Tag.JOVIAN},
        quantity: 3,
    },
    // Elysium
    {
        name: 'Generalist',
        requirementText: 'Requires all 6 productions increased by 1 step',
        amount: sum(
            ...STANDARD_RESOURCES.map(resource => ({
                condition: Condition.GREATER_THAN_OR_EQUAL_TO,
                operands: [{production: resource}, 1],
                pass: 1,
                fail: 0,
            }))
        ),
        quantity: 6,
    },
    {
        name: 'Specialist',
        requirementText: 'Requires 10 production of 1 resource',
        amount: max(...STANDARD_RESOURCES.map(resource => ({production: resource}))),
        quantity: 10,
    },
    {
        name: 'Ecologist',
        requirementText: 'Requires 4 bio-tags (plant, animal, or microbe)',
        amount: sum(
            {tag: Tag.PLANT, includeWildcard: true},
            {tag: Tag.ANIMAL, includeWildcard: false},
            {tag: Tag.MICROBE, includeWildcard: false}
        ),
        quantity: 4,
    },
    {
        name: 'Tycoon',
        requirementText: 'Requires 15 project cards in play (blue or green)',
        amount: sum(VariableAmount.BLUE_CARD, VariableAmount.GREEN_CARD),
        quantity: 15,
    },
    {
        name: 'Legend',
        requirementText: 'Requires 5 played event cards',
        amount: VariableAmount.PLAYER_EVENTS,
        quantity: 5,
    },
];

const MILESTONE_CONFIGS_BY_NAME: {[name: string]: MilestoneConfig} = {};
for (const milestone of MILESTONE_CONFIGS) {
    MILESTONE_CONFIGS_BY_NAME[milestone.name.toLowerCase()] = milestone;
}

export function getMilestone(name: string): MilestoneConfig {
    const found = MILESTONE_CONFIGS_BY_NAME[name.toLowerCase()];
    if (!found) throw new Error('milestone not found');
    return found;
}

const DEFAULT_MILESTONES = ['Terraformer', 'Mayor', 'Gardener', 'Builder', 'Planner'];

const HELLAS_MILESTONES = [
    'Diversifier',
    'Tactician',
    'Polar Explorer',
    'Energizer',
    'Rim Settler',
];

const ELYSIUM_MILESTONES = ['Generalist', 'Specialist', 'Ecologist', 'Tycoon', 'Legend'];

export function getMilestones(state: GameState) {
    const hoverlord = isPlayingVenus(state) ? ['Hoverlord'] : [];

    if (state?.boardName === 'Tharsis') {
        return [...DEFAULT_MILESTONES, ...hoverlord];
    }
    if (state?.boardName === 'Hellas') {
        return [...HELLAS_MILESTONES, ...hoverlord];
    }
    if (state?.boardName === 'Elysium') {
        return [...ELYSIUM_MILESTONES, ...hoverlord];
    }

    return [...DEFAULT_MILESTONES, ...hoverlord];
}
