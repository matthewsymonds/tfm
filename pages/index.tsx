import {GameStage} from '../constants/game';
import {CorporationSelection} from '../components/corporation-selection';
import {ActiveRound} from '../components/active-round';
import {useTypedSelector} from '../reducer';

export default function IndexReplacement() {
    const gameStage = useTypedSelector(state => state.common.gameStage);

    switch (gameStage) {
        case GameStage.CorporationSelection:
            return <CorporationSelection playerId={0} />;
        case GameStage.ActiveRound:
            return <ActiveRound playerId={0} />;
        default:
            return <span>All done!</span>;
    }
}
