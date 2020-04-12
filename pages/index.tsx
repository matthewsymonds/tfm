import {GameStage} from '../constants/game';
import {CORPORATION_SELECTION} from '../components/corporation-selection';
import {ActiveRound} from '../components/active-round';
import {useTypedSelector} from '../reducer';

export default function IndexReplacement() {
    const gameStage = useTypedSelector(state => state.common.gameStage);

    switch (gameStage) {
        case GameStage.CORPORATION_SELECTION:
            return <CORPORATION_SELECTION playerId={0} />;
        case GameStage.ACTIVE_ROUND:
            return <ActiveRound playerId={0} />;
        default:
            return <span>All done!</span>;
    }
}
