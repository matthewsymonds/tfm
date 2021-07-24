import {setGame} from 'actions';
import {makeGetCall} from 'api-calls';
import {ActiveRound} from 'components/active-round';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import Router, {useRouter} from 'next/router';
import {PROTOCOL_HOST_DELIMITER} from 'pages/_app';
import {useContext, useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {useTypedSelector} from 'reducer';

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

export default function Game(props) {
    const {game, session} = props;
    const {lastSeenLogItem} = game;
    const router = useRouter();
    const dispatch = useDispatch();
    const store = useStore();
    const context = useContext(AppContext);
    useEffect(() => {
        store.dispatch(setGame(game.state));
    }, [game.state.name, lastSeenLogItem]);

    const state = useTypedSelector(state => state);
    const logLength = useTypedSelector(state => state?.log?.length);

    const handleRetrievedGame = game => {
        if (game.error) {
            router.push('/new-game');
            return;
        }
        const existingTimestamp = store.getState().timestamp ?? 0;
        const newTimestamp = game.state.timestamp ?? 0;
        if (newTimestamp > existingTimestamp) {
            // So...we've seen examples of the state going one step backward in time.
            // We generally don't want that.
            // While the root cause is being fleshed out and squashed,
            // we can alleviate a lot of the pain with this check.
            dispatch(setGame(game.state));
        }
    };
    function handleRetrievedYourTurnGames(result: {games: Array<{name: string}>}) {
        setYourTurnGames(result.games.map(game => game.name));
    }

    const [yourTurnGames, setYourTurnGames] = useState<string[]>([]);

    useEffect(() => {
        handleRetrievedGame(game);
    }, []);
    const players = useTypedSelector(state => state?.players ?? game.state.players);
    let loggedInPlayerIndex = players.findIndex(player => player.username === session.username);
    if (loggedInPlayerIndex < 0 && players.length !== 1) {
        useEffect(() => {
            router.push('/');
        }, []);
        return null;
    } else if (loggedInPlayerIndex < 0) {
        loggedInPlayerIndex = 0;
    }
    context.setLoggedInPlayerIndex(loggedInPlayerIndex);
    useEffect(() => {
        context.setLoggedInPlayerIndex(loggedInPlayerIndex);
    }, [game.name, loggedInPlayerIndex]);

    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const currentPlayerIndex = useTypedSelector(state => state?.common?.currentPlayerIndex);
    const numPlayers = useTypedSelector(state => state?.players?.length ?? 0);

    const getPendingCardSelection = state =>
        state?.players[loggedInPlayerIndex]?.pendingCardSelection;

    const draftPicks = useTypedSelector(state => getPendingCardSelection(state)?.draftPicks ?? []);
    const possibleCards = useTypedSelector(
        state => getPendingCardSelection(state)?.possibleCards ?? []
    );
    const isWaitingInDraft = draftPicks.length + possibleCards.length === 5;
    const isSyncing = useTypedSelector(state => state?.syncing);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        // Sync when the user looks at an old tab
        window.addEventListener('focus', retrieveGame);
        return () => window.removeEventListener('focus', retrieveGame);
    }, []);

    useEffect(() => {
        // Do not sync if you're the only one who can play!
        if (
            (gameStage !== GameStage.CORPORATION_SELECTION &&
                gameStage !== GameStage.BUY_OR_DISCARD &&
                gameStage !== GameStage.DRAFTING &&
                currentPlayerIndex == loggedInPlayerIndex) ||
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
        currentPlayerIndex,
        isWaitingInDraft,
        isSyncing,
        possibleCards.length,
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            retrieveYourTurnGames(handleRetrievedYourTurnGames);
        }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        retrieveYourTurnGames(handleRetrievedYourTurnGames);
    }, [logLength]);

    const retrieveGame = async () => {
        const apiPath = '/api' + window.location.pathname;

        const result = await makeGetCall(apiPath);
        if (!store.getState().syncing) {
            // Make sure that we are not syncing (ie, playing an action),
            // which would mean we are about to get a more up to date state.
            handleRetrievedGame(result);
        }
    };

    if (!state) return null;

    return (
        <ActiveRound
            lastSeenLogItem={lastSeenLogItem}
            loggedInPlayerIndex={loggedInPlayerIndex}
            yourTurnGames={yourTurnGames}
        />
    );
}

Game.getInitialProps = async ctx => {
    const {isServer, req, res, query} = ctx;

    // To start, clear out the old game if any is present.
    ctx.store.dispatch(setGame(null));

    const headers = isServer ? req.headers : {};

    try {
        const response = await fetch(getGamePath(isServer, query, headers), {
            headers: {...headers, 'cache-control': 'no-store'},
        });

        const game = await response.json();
        return {game};
    } catch (error) {
        if (isServer) {
            res.writeHead(302, {
                Location: '/login',
            });
            res.end();
        } else {
            Router.push('/login');
            return {};
        }
    }
};

function getGamePath(isServer, query, headers) {
    const path = '/api/games/';
    const gameId = query['name'];
    if (!isServer) {
        return path + gameId;
    }

    const {host} = headers;
    const protocol = /^localhost(:\d+)?$/.test(host) ? 'http' : 'https';
    return protocol + PROTOCOL_HOST_DELIMITER + host + path + gameId;
}
