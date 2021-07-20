import {CanPlayAndReason} from 'client-server-shared/action-guard';
import {SerializedColony} from 'constants/colonies';
import {PlayerState} from 'reducer';

export function canBuildColony(colony: SerializedColony, player: PlayerState): CanPlayAndReason {
    if (colony.colonies.length === 3) {
        return [false, '3 colonies have already been built here'];
    }

    if (!player.buildColony) {
        return [false, 'Cannot build a colony right now'];
    }

    if (!player.buildColony.mayBeRepeatColony && colony.colonies.indexOf(player.index) >= 0) {
        return [false, 'Player may not build another colony here'];
    }

    return [true, 'Good to go'];
}
