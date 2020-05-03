import {GameStage} from '../constants/game';
import {CorporationSelection} from '../components/corporation-selection';
import {BuyOrDiscard} from '../components/buy-or-discard';
import {ActiveRound} from '../components/active-round';
import {useTypedSelector} from '../reducer';

export default function Index() {
    const gameStage = useTypedSelector(state => state.common.gameStage);

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
