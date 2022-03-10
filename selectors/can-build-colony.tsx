import {PlaceColony} from 'actions';
import {CanPlayAndReason} from 'client-server-shared/action-guard';
import {MAX_NUM_COLONIES, SerializedColony} from 'constants/colonies';

export function canPlaceColony(
    colony: SerializedColony,
    playerIndex: number,
    placeColony?: PlaceColony
): CanPlayAndReason {
    if (colony.colonies.length === MAX_NUM_COLONIES) {
        return [
            false,
            `${MAX_NUM_COLONIES} colonies have already been built here`,
        ];
    }

    if (!placeColony) {
        return [false, 'Cannot build a colony right now'];
    }

    if (colony.step < 0) {
        return [
            false,
            'Cannot place a colony until this Colony Tile is online',
        ];
    }

    if (
        !placeColony.mayBeRepeatColony &&
        colony.colonies.indexOf(playerIndex) >= 0
    ) {
        return [false, 'Player may not build another colony here'];
    }

    return [true, 'Good to go'];
}
