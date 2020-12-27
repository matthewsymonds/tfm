import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {GameState, PlayerState} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';

export function getMoney(state: GameState, player: PlayerState) {
    const {corporation} = player;
    const playerMoneyAmount =
        (state.common.gameStage === GameStage.CORPORATION_SELECTION
            ? corporation.gainResource[Resource.MEGACREDIT]
            : player.resources[Resource.MEGACREDIT]) || 0;

    return convertAmountToNumber(playerMoneyAmount, state, player);
}
