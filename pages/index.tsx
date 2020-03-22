import {useSelector} from 'react-redux';
import {GameStage} from '../constants/game';
import {CorporationSelection} from '../components/corporation-selection';
import {ActiveRound} from '../components/active-round';

export default function IndexReplacement() {
    const gameStage = useSelector(state => state.gameStage);

    switch (gameStage) {
        case GameStage.CorporationSelection:
            return <CorporationSelection />;
        case GameStage.ActiveRound:
            return <ActiveRound />;
        default:
            return <span>All done!</span>;
    }
}
