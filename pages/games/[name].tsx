import {setGame} from '../../actions';
import {ActiveRound} from '../../components/active-round';
import {BuyOrDiscard} from '../../components/buy-or-discard';
import {GreeneryPlacement} from '../../components/greenery-placement';
import {CorporationSelection} from '../../components/corporation-selection';
import {EndOfGame} from '../../components/end-of-game';
import {GameStage} from '../../constants/game';
import {useTypedSelector} from '../../reducer';
import {deserializeState} from '../../state-serialization';
import {makeGetCall} from '../../api-calls';
import {useSession} from '../../hooks/use-session';
import {useDispatch} from 'react-redux';
import {useEffect, useState, useContext} from 'react';
import {useRouter} from 'next/router';
import {AppContext} from '../../context/app-context';

export default function Game() {
    const {loading, session} = useSession();

    const [players, setPlayers] = useState<string[]>([]);
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

    const retrieveGame = async () => {
        const apiPath = '/api' + window.location.pathname;

        const result = await makeGetCall(apiPath);
        if (result.error) {
            router.push('/new-game');
            return;
        }
        setPlayers(result.players);
        setPlayerIndex(result.players.indexOf(session.username));
        dispatch(setGame(deserializeState(result.state)));
    };

    const gameStage = useTypedSelector(state => state?.common?.gameStage);

    if (loading) return null;
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
