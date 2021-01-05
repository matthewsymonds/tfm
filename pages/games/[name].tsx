import {setGame} from 'actions';
import {makeGetCall} from 'api-calls';
import {ActiveRound} from 'components/active-round';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import Router, {useRouter} from 'next/router';
import {PROTOCOL_HOST_DELIMITER} from 'pages/_app';
import {useContext, useEffect} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {useTypedSelector} from 'reducer';

export default function Game(props) {
    const {game, session} = props;
    const router = useRouter();
    const dispatch = useDispatch();
    const store = useStore();
    const context = useContext(AppContext);

    const handleRetrievedGame = game => {
        if (game.error) {
            router.push('/new-game');
            return;
        }
        dispatch(setGame(game.state));
    };
    useEffect(() => {
        handleRetrievedGame(game);
    }, []);
    const loggedInPlayerIndex = game.state.players.findIndex(
        player => player.username === session.username
    );
    if (loggedInPlayerIndex < 0) {
        useEffect(() => {
            router.push('/');
        }, []);
        return null;
    }
    context.setLoggedInPlayerIndex(loggedInPlayerIndex);

    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const currentPlayerIndex = useTypedSelector(state => state?.common?.currentPlayerIndex);
    const numPlayers = useTypedSelector(state => state?.players?.length ?? 0);

    const getPendingCardSelection = state =>
        state.players[loggedInPlayerIndex]?.pendingCardSelection;

    const draftPicks = useTypedSelector(state => getPendingCardSelection(state)?.draftPicks ?? []);
    const possibleCards = useTypedSelector(
        state => getPendingCardSelection(state)?.possibleCards ?? []
    );
    const isWaitingInDraft = draftPicks.length + possibleCards.length === 5;
    const isSyncing = useTypedSelector(state => state.syncing);

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

    const retrieveGame = async () => {
        const apiPath = '/api' + window.location.pathname;

        const result = await makeGetCall(apiPath);
        if (!store.getState().syncing) {
            // Make sure that we are not syncing (ie, playing an action),
            // which would mean we are about to get a more up to date state.
            handleRetrievedGame(result);
        }
    };

    return <ActiveRound loggedInPlayerIndex={loggedInPlayerIndex} />;
}

Game.getInitialProps = async ctx => {
    const {isServer, req, res, query} = ctx;

    // To start, clear out the old game if any is present.
    ctx.store.dispatch(setGame(null));

    const headers = isServer ? req.headers : {};

    try {
        const response = await fetch(getGamePath(isServer, query, headers), {
            headers,
        });

        const game = await response.json();
        ctx.store.dispatch(setGame(game.state));
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
