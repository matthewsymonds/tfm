import {GameStage} from 'constants/game';
import {Resource} from 'constants/resource';
import {convertAmountToNumber} from 'context/app-context';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';

export function getMoney(state: GameState, player: PlayerState, corporation: Card) {
    const playerMoneyAmount =
        (state.common.gameStage === GameStage.CORPORATION_SELECTION
            ? corporation.gainResource[Resource.MEGACREDIT]
            : player.resources[Resource.MEGACREDIT]) || 0;

    return convertAmountToNumber(playerMoneyAmount, state, player);
}
