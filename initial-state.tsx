import {getStartingColonies} from 'constants/colonies';
import {INITIAL_BOARD_STATE} from './constants/board';
import {CardType, Deck} from './constants/card-types';
import {GameStage, MIN_PARAMETERS} from './constants/game';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {Resource} from './constants/resource-enum';
import {Tag} from './constants/tag';
import {cards} from './models/card';
import {GameOptions, GameState, PlayerState} from './reducer';

export function shuffle<T>(array: T[]) {
    let n = array.length;
    let i: number;
    let temp: T;
    while (n) {
        i = Math.floor(Math.random() * n--);
        temp = array[n];
        array[n] = array[i];
        array[i] = temp;
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
    const cardOverrides: Array<string> = ['Manutech'];
    return cards.filter(card => {
        return cardOverrides.includes(card.name) && card.type === CardType.CORPORATION;
    });
}

function DEV_preludeOverides() {
    const cardOverrides: Array<string> = [];
    return cards.filter(card => {
        return cardOverrides.includes(card.name) && card.type === CardType.PRELUDE;
    });
}

export function sample<T>(cards: T[], num: number) {
    const result: T[] = [];
    for (let i = result.length; i < num; i++) {
        const card = cards.shift();
        if (!card) {
            throw new Error('Out of cards to sample');
        }
        result.push(card);
    }
    return result;
}

export function getInitialState(players: string[], options: GameOptions, name: string): GameState {
    const possibleCards = cards.filter(card => options.decks.includes(card.deck));

    shuffle(possibleCards);

    const allCorporations = possibleCards
        .filter(card => card.type === CardType.CORPORATION)
        .map(card => ({name: card.name}));

    const deck = possibleCards
        .filter(card => card.type !== CardType.CORPORATION && card.type !== CardType.PRELUDE)
        .map(card => ({name: card.name}));
    const preludes = possibleCards
        .filter(card => card.type === CardType.PRELUDE)
        .map(card => ({name: card.name}));

    options.isDraftingEnabled = options.isDraftingEnabled && players.length > 1;

    const isPreludeEnabled = options.decks.includes(Deck.PRELUDE);
    const isColoniesEnabled = options.decks.includes(Deck.COLONIES);

    const base = {
        name,
        log: ['Generation 1'] as string[],
        common: {
            playerIndexOrderForGeneration: [] as number[],
            discardPile: [],
            revealedCards: [],
            gameStage: GameStage.CORPORATION_SELECTION,
            generation: 1,
            turn: 1,
            deck,
            preludes,
            parameters: MIN_PARAMETERS,
            board: INITIAL_BOARD_STATE,
            currentPlayerIndex: 0,
            firstPlayerIndex: 0,
            claimedMilestones: [],
            fundedAwards: [],
            colonies: isColoniesEnabled ? getStartingColonies(players.length) : [],
        },
        players: [] as PlayerState[],
        options,
    };

    shuffle(players);

    for (const player of players) {
        let possibleCorporations = sample(allCorporations, 2).concat(DEV_corporationOverrides());

        if (options.soloCorporationName && players.length === 1) {
            const corporationsToFind = options.soloCorporationName
                .split(',')
                .map(corp => corp.trim());
            let matchingCorporations: Array<{name: string}> = [];
            for (const corporation of corporationsToFind) {
                const matchingCorporation = allCorporations.find(
                    corp => corp.name.toLowerCase() === corporation.toLowerCase()
                );
                if (matchingCorporation) {
                    matchingCorporations.push(matchingCorporation);
                }
            }

            if (matchingCorporations.length > 0) {
                possibleCorporations = matchingCorporations;
            }
        }

        base.players.push({
            // 0 for card selection, 1 / 2 for active round
            action: 0,
            username: player,
            index: base.players.length,
            terraformRating: 20,
            corporation: possibleCorporations[0],
            pendingCardSelection: {
                possibleCards: sample(deck, 10).concat(DEV_cardOverrides()),
                isBuyingCards: true,
            },
            possibleCorporations,
            cards: [],
            forcedActions: [],
            playedCards: [],
            preludes: [],
            possiblePreludes: sample(preludes, isPreludeEnabled ? 4 : 0).concat(
                DEV_preludeOverides()
            ),
            resources: initialResources(),
            productions: initialResources(Number(options.decks.length === 1)),
            parameterRequirementAdjustments: zeroParameterRequirementAdjustments(),
            temporaryParameterRequirementAdjustments: zeroParameterRequirementAdjustments(),
            cardCost: 3,
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
            fleets: isColoniesEnabled ? 1 : 0,
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
