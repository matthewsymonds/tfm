import {useSelector} from 'react-redux';
import {GameStage} from '../constants/game';
import {CorporationSelection} from '../components/corporation-selection';

export default function IndexReplacement() {
  const gameStage = useSelector(state => state.gameStage);

  switch (gameStage) {
    case GameStage.CorporationSelection:
      return <CorporationSelection />;
    default:
      return <span>All done!</span>;
  }
}
