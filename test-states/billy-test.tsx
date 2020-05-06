import {GameState, getInitialState} from '../reducer';
import {GameStage} from '../constants/game';
import {Parameter, INITIAL_BOARD_STATE} from '../constants/board';
import {Resource} from '../constants/resource';
import {Tag} from '../constants/tag';
import {cardConfigs} from '../constants/cards';
import {Card} from '../models/card';

const cards = cardConfigs.map(config => new Card(config));

export const BILLY_TEST = setupStateForPlayer({
    cards: cards.filter(c =>
        ['Space Elevator'].some(name => name.toLowerCase().indexOf(c.name.toLowerCase()) !== -1)
    ),
    resources: {
        [Resource.MEGACREDIT]: 1000,
        [Resource.STEEL]: 4,
        [Resource.TITANIUM]: 0,
        [Resource.PLANT]: 1000,
        [Resource.ENERGY]: 0,
        [Resource.HEAT]: 0,
    },
    productions: {
        [Resource.MEGACREDIT]: 0,
        [Resource.STEEL]: 0,
        [Resource.TITANIUM]: 0,
        [Resource.PLANT]: 0,
        [Resource.ENERGY]: 0,
        [Resource.HEAT]: 0,
    },
    exchangeRates: {
        [Resource.STEEL]: 3,
        [Resource.TITANIUM]: 4,
    },
    discounts: null,
});

function setupStateForPlayer({cards, resources, productions, discounts, exchangeRates}): GameState {
    return {
        queuePaused: false,
        loggedInPlayerIndex: 0,
        common: {
            action: 0,
            playingPlayers: [0],
            discardPile: [],
            gameStage: GameStage.ACTIVE_ROUND,
            generation: 0,
            turn: 0,
            deck: [],
            parameters: {
                [Parameter.OCEAN]: 0,
                [Parameter.OXYGEN]: 0,
                [Parameter.TEMPERATURE]: -30,
                [Parameter.VENUS]: 0,
            },
            board: INITIAL_BOARD_STATE,
            currentPlayerIndex: 0,
            firstPlayerIndex: 0,
            claimedMilestones: [],
            fundedAwards: [],
        },
        players: [
            {
                ...getInitialState(),
                index: 0,
                terraformRating: 20,
                playerIndex: 0,
                corporation: null,
                possibleCards: [],
                possibleCorporations: [],
                cards: cards,
                selectedCards: [],
                playedCards: [],
                resources: resources,
                productions: productions,
                exchangeRates: exchangeRates ?? {
                    [Resource.STEEL]: 2,
                    [Resource.TITANIUM]: 3,
                },
                discounts: discounts ?? {
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
            },
        ],
        transaction: {
            isPending: false,
            pendingPlayers: [],
        },
    };
}
