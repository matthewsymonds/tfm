import {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {setGame} from '../../actions';
import {ActiveRound} from '../../components/active-round';
import {BuyOrDiscard} from '../../components/buy-or-discard';
import {CorporationSelection} from '../../components/corporation-selection';
import {GameStage} from '../../constants/game';
import {useTypedSelector} from '../../reducer';
import {deserializeState} from '../../state-serialization';
import {useRouter} from 'next/router';

export default function Game() {
    const router = useRouter();
    const {name} = router.query;

    const gameStage = useTypedSelector(state => state.common.gameStage);

    const dispatch = useDispatch();

    const [gameState, setGameState] = useState(null);
    const [isLoading, setLoading] = useState(true);

    async function retrieveState() {
        if (typeof window === 'undefined') return;
        if (gameState) {
            return;
        }

        const {origin} = window.location;
        const apiURL = `${origin}/api/games/` + name;

        const result = await fetch(apiURL);
        try {
            const json = await result.json();
            setGameState(deserializeState(JSON.parse(json.state)));
        } catch (error) {
            setLoading(false);
            // Todo: handle deserialization error cases.
            // Todo, move this retrieveState to getServerSideProps
        }
    }

    function initializeGameState() {
        if (gameState) {
            dispatch(setGame(gameState));
            setLoading(false);
        }
    }

    useEffect(() => {
        retrieveState();
        initializeGameState();
    }, [gameState]);

    if (isLoading) return 'loading';

    switch (gameStage) {
        case GameStage.CORPORATION_SELECTION:
            return <CorporationSelection playerIndex={0} />;
        case GameStage.ACTIVE_ROUND:
            return <ActiveRound playerIndex={0} />;
        case GameStage.BUY_OR_DISCARD:
            return <BuyOrDiscard playerIndex={0} />;
        default:
            return <div>Unkown game state</div>;
    }
}
