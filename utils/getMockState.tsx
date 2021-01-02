import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {getInitialState} from 'initial-state';
import {cards} from 'models/card';
import {GameOptions, GameState} from 'reducer';

export function getMockState(players: string[], options: GameOptions): GameState {
    let initialState = getInitialState(players, options);

    initialState = {
        ...initialState,
        common: {
            ...initialState.common,
            currentPlayerIndex: 0,
            gameStage: GameStage.ACTIVE_ROUND,
        },
        players: [
            ...initialState.players.map(player => {
                if (player.index === 0) {
                    return {
                        ...player,
                        pendingCardSelection: null,
                        playedCards: cards.slice(0, 10).map(c => ({name: c.name})),
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
                }
                return player;
            }),
        ],
    };

    return initialState;
}
