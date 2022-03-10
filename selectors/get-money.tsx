import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {GameState, PlayerState} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {SerializedCard} from 'state-serialization';
import {getCard} from './get-card';

// We need to explicitly pass corporation instead of pulling from player.corporation
// when calling this before corp selection has been finalized. This is because the corp
// is only selected on the client until that action is complete.
export function getMoney(
    state: GameState,
    player: PlayerState,
    corporation?: SerializedCard
) {
    const playerMoneyAmount =
        (state.common.gameStage === GameStage.CORPORATION_SELECTION
            ? getCard(corporation ?? player.corporation).gainResource?.[
                  Resource.MEGACREDIT
              ]
            : player.resources[Resource.MEGACREDIT]) || 0;

    return convertAmountToNumber(playerMoneyAmount, state, player);
}
