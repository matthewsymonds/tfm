import {setGame} from 'actions';
import {makeGetCall} from 'api-calls';
import {ActiveRound} from 'components/active-round';
import {EndOfGame} from 'components/end-of-game';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import Router, {useRouter} from 'next/router';
import {PROTOCOL_HOST_DELIMITER} from 'pages/_app';
import {useContext, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {useTypedSelector} from 'reducer';
import {deserializeState} from 'state-serialization';

export default function Game(props) {
    const {game, session} = props;
    const router = useRouter();
    const dispatch = useDispatch();

    const context = useContext(AppContext);

    const handleRetrievedGame = game => {
        if (game.error) {
            router.push('/new-game');
            return;
        }
        context.queue = game.queue;
        dispatch(setGame(deserializeState(game.state)));
    };
    useEffect(() => {
        handleRetrievedGame(game);
    }, []);

    const loggedInPlayerIndex = game.players.indexOf(session.username);
    context.setLoggedInPlayerIndex(loggedInPlayerIndex);

    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const currentPlayerIndex = useTypedSelector(state => state?.common?.currentPlayerIndex);

    useEffect(() => {
        if (
            gameStage !== GameStage.CORPORATION_SELECTION &&
            gameStage !== GameStage.BUY_OR_DISCARD &&
            currentPlayerIndex == loggedInPlayerIndex
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
        const interval = setInterval(() => {
            retrieveGame();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [gameStage, loggedInPlayerIndex]);

    const retrieveGame = async () => {
        const apiPath = '/api' + window.location.pathname;

        const result = await makeGetCall(apiPath);
        handleRetrievedGame(result);
    };

    switch (gameStage) {
        case GameStage.CORPORATION_SELECTION:
        case GameStage.ACTIVE_ROUND:
        case GameStage.BUY_OR_DISCARD:
        case GameStage.GREENERY_PLACEMENT:
            return <ActiveRound loggedInPlayerIndex={loggedInPlayerIndex} />;
        case GameStage.END_OF_GAME:
            return <EndOfGame />;
        default:
            return null;
    }
}

Game.getInitialProps = async ctx => {
    const {isServer, req, res, query} = ctx;

    const headers = isServer ? req.headers : {};

    try {
        const response = await fetch(getGamePath(isServer, query, headers), {
            headers,
        });

        const game = await response.json();
        ctx.store.dispatch(setGame(deserializeState(game.state)));

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
