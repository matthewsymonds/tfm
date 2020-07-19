import {setGame} from 'actions';
import {makeGetCall} from 'api-calls';
import {ActiveRound} from 'components/active-round';
import {EndOfGame} from 'components/end-of-game';
import {GreeneryPlacement} from 'components/greenery-placement';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
import {isSyncing} from 'hooks/sync-state';
import {useSession} from 'hooks/use-session';
import {useRouter} from 'next/router';
import {useContext, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useTypedSelector} from 'reducer';
import {deserializeState} from 'state-serialization';

function GameComponent() {
    const {loading, session} = useSession();
    const [playerIndex, setPlayerIndex] = useState<number>(-1);
    const router = useRouter();
    const context = useContext(AppContext);
    context.setLoggedInPlayerIndex(playerIndex);

    const dispatch = useDispatch();

    useEffect(() => {
        if (session.username) {
            retrieveGame();
        }
    }, [session.username]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isSyncing) {
                retrieveGame();
            }
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const retrieveGame = async () => {
        const apiPath = '/api' + window.location.pathname;

        const result = await makeGetCall(apiPath);
        if (isSyncing) {
            return;
        }
        if (result.error) {
            router.push('/new-game');
            return;
        }
        context.queue = result.queue;
        setPlayerIndex(result.players.indexOf(session.username));
        result.state.log = result.state.log || [];
        dispatch(setGame(deserializeState(result.state)));
    };

    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    if (loading) return <div />;
    if (playerIndex < 0) return null;

    switch (gameStage) {
        case GameStage.CORPORATION_SELECTION:
        case GameStage.ACTIVE_ROUND:
        case GameStage.BUY_OR_DISCARD:
            return <ActiveRound playerIndex={playerIndex} />;
        case GameStage.GREENERY_PLACEMENT:
            return <GreeneryPlacement playerIndex={playerIndex} />;
        case GameStage.END_OF_GAME:
            return <EndOfGame />;
        default:
            return null;
    }
}

export default function Game() {
    return (
        <>
            <GameComponent />
        </>
    );
}
