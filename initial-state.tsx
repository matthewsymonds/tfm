import {Deck, CardType} from './constants/card-types';
import {GameState, PlayerState} from './reducer';
import {GameStage, MIN_PARAMETERS} from './constants/game';
import {Card, cards} from './models/card';
import {INITIAL_BOARD_STATE} from './constants/board';
import {zeroParameterRequirementAdjustments} from './constants/parameter-requirement-adjustments';
import {Resource} from './constants/resource';
import {Tag} from './constants/tag';

function shuffle(array: Card[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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

export function getInitialState(players: string[]): GameState {
    const possibleCards = cards.filter(
        card => card.deck === Deck.BASIC || card.deck === Deck.CORPORATE
    );

    shuffle(possibleCards);

    const allCorporations = possibleCards.filter(card => card.type === CardType.CORPORATION);

    const deck = possibleCards.filter(card => card.type !== CardType.CORPORATION);

    const base = {
        queuePaused: false,
        common: {
            playingPlayers: [] as number[],
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
        transaction: {
            isPending: false,
            pendingPlayers: [],
        },
    };

    for (const player of players) {
        const possibleCorporations = sampleCards(allCorporations, 2);

        base.players.push({
            // 0 for card selection, 1 / 2 for active round
            action: 0,
            username: player,
            index: base.players.length,
            terraformRating: 20,
            corporation: null,
            possibleCards: sampleCards(deck, 10),
            selectedCards: [],
            numCardsToTake: null,
            possibleCorporations,
            cards: [],
            playedCards: [],
            resources: initialResources(),
            productions: initialResources(),
            parameterRequirementAdjustments: zeroParameterRequirementAdjustments(),
            temporaryParameterRequirementAdjustments: zeroParameterRequirementAdjustments(),
            exchangeRates: {
                [Resource.STEEL]: 2,
                [Resource.TITANIUM]: 3,
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

    base.common.playingPlayers = base.players.map(player => player.index);

    return base;
}

function initialResources() {
    return {
        [Resource.MEGACREDIT]: 0,
        [Resource.STEEL]: 0,
        [Resource.TITANIUM]: 0,
        [Resource.PLANT]: 0,
        [Resource.ENERGY]: 0,
        [Resource.HEAT]: 0,
    };
}
