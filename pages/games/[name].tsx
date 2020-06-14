import {setGame} from 'actions';
import {makeGetCall} from 'api-calls';
import {ActiveRound} from 'components/active-round';
import {BuyOrDiscard} from 'components/buy-or-discard';
import {CorporationSelection} from 'components/corporation-selection';
import {EndOfGame} from 'components/end-of-game';
import {GreeneryPlacement} from 'components/greenery-placement';
import {GameStage} from 'constants/game';
import {AppContext} from 'context/app-context';
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
            retrieveGame();
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const retrieveGame = async () => {
        const apiPath = '/api' + window.location.pathname;

        const result = await makeGetCall(apiPath);
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
            return <CorporationSelection playerIndex={playerIndex} />;
        case GameStage.ACTIVE_ROUND:
            return <ActiveRound playerIndex={playerIndex} />;
        case GameStage.BUY_OR_DISCARD:
            return <BuyOrDiscard playerIndex={playerIndex} />;
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
