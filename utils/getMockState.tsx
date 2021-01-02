import {Deck} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {getInitialState} from 'initial-state';
import {cards} from 'models/card';
import {GameState} from 'reducer';

export function getMockState(): GameState {
    let initialState = getInitialState(
        ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'],
        {
            decks: [Deck.BASIC],
            isDraftingEnabled: false,
        }
    );

    initialState = {
        ...initialState,
        common: {
            ...initialState.common,
            currentPlayerIndex: 0,
            gameStage: GameStage.ACTIVE_ROUND,
        },
        players: [
            ...initialState.players.map((player, i) => {
                return {
                    ...player,
                    pendingCardSelection: undefined,
                    corporation: i === 0 ? {name: 'U.N.M.I.'} : player.corporation,
                    playedCards: cards.slice(i * 20, i * 20 + 20).map(c => ({name: c.name})),
                    resources: {
                        ...player.resources,
                        [Resource.MEGACREDIT]: 10,
                        [Resource.PLANT]: 10,
                        [Resource.ENERGY]: 10,
                    },
                    productions: {
                        ...player.productions,
                        [Resource.MEGACREDIT]: 10,
                    },
                };
            }),
        ],
    };

    return initialState;
}
