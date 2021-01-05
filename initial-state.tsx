import {INITIAL_BOARD_STATE} from './constants/board';
import {CardType} from './constants/card-types';
import {GameStage, MIN_PARAMETERS} from './constants/game';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {Resource} from './constants/resource';
import {Tag} from './constants/tag';
import {Card, cards} from './models/card';
import {GameOptions, GameState, PlayerState} from './reducer';

export function shuffle<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function DEV_cardOverrides() {
    const cardOverrides: Array<string> = [];
    return cards.filter(card => {
        return cardOverrides.includes(card.name);
    });
}

function DEV_corporationOverrides() {
    const cardOverrides: Array<string> = [];
    return cards.filter(card => {
        return cardOverrides.includes(card.name) && card.type === CardType.CORPORATION;
    });
}

function sampleCards(cards: Card[], num: number) {
    const result: Card[] = [];
    for (let i = 0; i < num; i++) {
        const card = cards.shift();
        if (!card) {
            throw new Error('Out of cards to sample');
        }
        result.push(card);
    }
    return result;
}

export function getInitialState(players: string[], options: GameOptions): GameState {
    const possibleCards = cards.filter(card => options.decks.includes(card.deck));

    shuffle(possibleCards);

    const allCorporations = possibleCards.filter(card => card.type === CardType.CORPORATION);

    const deck = possibleCards.filter(card => card.type !== CardType.CORPORATION);

    options.isDraftingEnabled = options.isDraftingEnabled && players.length > 1;

    const base = {
        log: ['Generation 1'] as string[],
        common: {
            playerIndexOrderForGeneration: [] as number[],
            discardPile: [],
            revealedCards: [],
            gameStage: GameStage.CORPORATION_SELECTION,
            generation: 1,
            turn: 1,
            deck,
            parameters: MIN_PARAMETERS,
            board: INITIAL_BOARD_STATE,
            currentPlayerIndex: 0,
            firstPlayerIndex: 0,
            claimedMilestones: [],
            fundedAwards: [],
        },
        players: [] as PlayerState[],
        options,
    };

    for (const player of players) {
        const possibleCorporations = sampleCards(allCorporations, 2).concat(
            DEV_corporationOverrides()
        );

        base.players.push({
            // 0 for card selection, 1 / 2 for active round
            action: 0,
            username: player,
            index: base.players.length,
            terraformRating: 20,
            corporation: possibleCorporations[0],
            pendingCardSelection: {
                possibleCards: sampleCards(deck, 10).concat(DEV_cardOverrides()),
                isBuyingCards: true,
            },
            possibleCorporations,
            cards: [],
            forcedActions: [],
            playedCards: [],
            resources: initialResources(),
            productions: initialResources(Number(options.decks.length === 1)),
            parameterRequirementAdjustments: zeroParameterRequirementAdjustments(),
            temporaryParameterRequirementAdjustments: zeroParameterRequirementAdjustments(),
            exchangeRates: {
                [Resource.STEEL]: 2,
                [Resource.TITANIUM]: 3,
                [Resource.HEAT]: 0,
            },
            discounts: {
                card: 0,
                tags: {
                    [Tag.SPACE]: 0,
                    [Tag.VENUS]: 0,
                    [Tag.BUILDING]: 0,
                    [Tag.SCIENCE]: 0,
                    [Tag.EARTH]: 0,
                    [Tag.POWER]: 0,
                },
                cards: {
                    [Tag.SPACE]: 0,
                    [Tag.EARTH]: 0,
                },
                standardProjects: 0,
                standardProjectPowerPlant: 0,
                nextCardThisGeneration: 0,
                trade: 0,
            },
        });
    }

    base.common.playerIndexOrderForGeneration = base.players.map(player => player.index);

    return base;
}

function initialResources(startingAmount: number = 0) {
    return {
        [Resource.MEGACREDIT]: startingAmount,
        [Resource.STEEL]: startingAmount,
        [Resource.TITANIUM]: startingAmount,
        [Resource.PLANT]: startingAmount,
        [Resource.ENERGY]: startingAmount,
        [Resource.HEAT]: startingAmount,
    };
}
