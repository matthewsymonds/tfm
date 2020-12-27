import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';

// We need to explicitly pass corporation instead of pulling from player.corporation
// when calling this before corp selection has been finalized. This is because the corp
// is only selected on the client until that action is complete.
export function getMoney(state: GameState, player: PlayerState, corporation?: Card) {
    const playerMoneyAmount =
        (state.common.gameStage === GameStage.CORPORATION_SELECTION
            ? (corporation ?? player.corporation).gainResource[Resource.MEGACREDIT]
            : player.resources[Resource.MEGACREDIT]) || 0;

    return convertAmountToNumber(playerMoneyAmount, state, player);
}
