import {setGame} from 'actions';
import {makeGetCall} from 'api-calls';
import {GameCore} from 'components/game-core';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {NextRouter, useRouter} from 'next/router';
import {ParsedUrlQuery} from 'querystring';
import {useContext, useEffect, useState} from 'react';
import {batch, useDispatch, useStore} from 'react-redux';
import {GameState, useTypedSelector} from 'reducer';

async function retrieveYourTurnGames(callback: Function) {
    if (typeof window === 'undefined') {
        return;
    }
    const apiPath = '/api/your-turn';

    const result = await makeGetCall(apiPath);
    if (result.games) {
        callback(result);
    }
}

function GameMiddle(props) {
    const state = useTypedSelector(state => state);
    const context = useContext(AppContext);
    const loggedInPlayer = useTypedSelector(
        state =>
            state?.players?.find(
                player => player.username === context.getUsername()
            ) ?? null
    );

    if (!state) return null;
    if (!loggedInPlayer) return null;

    return <GameInner {...props} />;
}

function GameInner() {
    const router = useRouter();
    const dispatch = useDispatch();
    const store = useStore<GameState>();

    const handleRetrievedGame = game => {
        if (game.error) {
            router.push('/new-game');
            return;
        }
        batch(() => {
            const existingTimestamp = store.getState()?.timestamp ?? 0;
            const newTimestamp = game.state?.timestamp ?? 0;
            if (newTimestamp > existingTimestamp) {
                // So...we've seen examples of the state going one step backward in time.
                // We generally don't want that.
                // While the root cause is being fleshed out and squashed,
                // we can alleviate a lot of the pain with this check.
                context.setLastSeenTimestamp(game.state.timestamp);
                dispatch(setGame(game.state));
            }
            if (game.lastSeenLogItem > context.getLastSeenLogItem()) {
                context.setLastSeenLogItem(game.lastSeenLogItem);
            }
        });
    };
    function handleRetrievedYourTurnGames(result: {
        games: Array<{name: string}>;
    }) {
        setYourTurnGames(result.games.map(game => game.name));
    }

    const [yourTurnGames, setYourTurnGames] = useState<string[]>([]);

    const gameStage = useTypedSelector(state => state.common.gameStage);
    const numPlayers = useTypedSelector(state => state.players.length ?? 0);
    const gameName = useTypedSelector(state => state.name);
    const context = useContext(AppContext);
    const loggedInPlayerIndex = useTypedSelector(state =>
        state.players.findIndex(
            player => player.username === context.getUsername()
        )
    );

    const {pendingCardSelection} = useLoggedInPlayer();

    const draftPicks = pendingCardSelection?.draftPicks ?? [];
    const possibleCards = pendingCardSelection?.possibleCards ?? [];
    const isWaitingInDraft = draftPicks.length + possibleCards.length === 5;
    const isSyncing = useTypedSelector(state => state.syncing);
    const timestamp = useTypedSelector(state => state.timestamp);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        // Sync when the user looks at an old tab
        window.addEventListener('focus', retrieveGame);
        return () => window.removeEventListener('focus', retrieveGame);
    }, []);

    useEffect(() => {
        // Do not sync if you're the only player!
        if (
            numPlayers === 1 ||
            gameStage === GameStage.END_OF_GAME ||
            isSyncing
        ) {
            // Don't retrieve server state while only you can play!
            // Can lead the game to de-sync:
            // a) the interval calls retrieve game api
            // b) the user plays an action
            // c) b completes
            // d) a completes, jerking the UI back in time
            // Simply avoid these tricky race condition scenarios whenever possible.
            return;
        }
        // Only sync in draft stage if you're waiting for other players.
        if (gameStage === GameStage.DRAFTING && !isWaitingInDraft) {
            return;
        }
        // Only sync if you're ready to play.
        if (
            (gameStage === GameStage.BUY_OR_DISCARD ||
                gameStage === GameStage.CORPORATION_SELECTION) &&
            possibleCards.length
        ) {
            return;
        }
        const interval = setInterval(() => {
            retrieveGame();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [
        gameStage,
        loggedInPlayerIndex,
        isWaitingInDraft,
        isSyncing,
        possibleCards.length,
        gameName,
    ]);

    useEffect(() => {
        let isActive = true;
        const interval = setInterval(() => {
            retrieveYourTurnGames(result => {
                if (isActive) {
                    handleRetrievedYourTurnGames(result);
                }
            });
        }, 10000);

        return () => {
            isActive = false;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        retrieveYourTurnGames(result => {
            if (isActive) {
                handleRetrievedYourTurnGames(result);
            }
        });
        return () => {
            isActive = false;
        };
    }, [timestamp]);

    const retrieveGame = async () => {
        const apiPath = '/api' + window.location.pathname;

        const result = await makeGetCall(apiPath);
        const currentState = store.getState();
        if (!currentState?.syncing && !currentState?.isMakingPlayRequest) {
            // Make sure that we are not syncing (ie, playing an action),
            // which would mean we are about to get a more up to date state.
            handleRetrievedGame(result);
        }
    };

    return <GameCore key={gameName} yourTurnGames={yourTurnGames} />;
}

type ServerGame = {
    state: GameState;
    username: string;
    lastSeenLogItem: number;
    error?: string;
};

export default function Game(props) {
    const isServer = typeof window === 'undefined';
    if (isServer) return null;
    const router = useRouter();
    const store = useStore();
    const context = useContext(AppContext);

    const setGameDispatch = (game: ServerGame) => {
        if (game.error) {
            router.push('/new-game');
            return;
        }
        batch(() => {
            context.setLastSeenLogItem(game.lastSeenLogItem);
            store.dispatch(setGame(game.state));
            context.setUsername(game.username);
        });
    };

    const {query} = router;
    useEffect(() => {
        getInitialProps({query, setGame: setGameDispatch, router});
    }, [query?.name]);

    return <GameMiddle />;
}

type GetInitialPropsParam = {
    query: ParsedUrlQuery;
    setGame: (game: ServerGame) => void;
    router: NextRouter;
};

const getInitialProps = async (ctx: GetInitialPropsParam) => {
    const {query, setGame, router} = ctx;

    try {
        const response = await fetch(getGamePath(query), {
            headers: {'cache-control': 'no-store'},
        });

        const game = await response.json();
        setGame(game);
    } catch (error) {
        router.push('/login');
    }
};

function getGamePath(query: ParsedUrlQuery) {
    const path = '/api/games/';
    const gameId = query['name'];
    return path + gameId;
}
