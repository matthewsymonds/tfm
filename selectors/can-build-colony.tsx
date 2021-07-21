import {PlaceColony} from 'actions';
import {CanPlayAndReason} from 'client-server-shared/action-guard';
import {SerializedColony} from 'constants/colonies';

export function canPlaceColony(
    colony: SerializedColony,
    playerIndex: number,
    placeColony?: PlaceColony
): CanPlayAndReason {
    if (colony.colonies.length === 3) {
        return [false, '3 colonies have already been built here'];
    }

    if (!placeColony) {
        return [false, 'Cannot build a colony right now'];
    }

    if (colony.step < 0) {
        return [false, 'Cannot place a colony until this Colony Tile is online'];
    }

    if (!placeColony.mayBeRepeatColony && colony.colonies.indexOf(playerIndex) >= 0) {
        return [false, 'Player may not build another colony here'];
    }

    return [true, 'Good to go'];
}
