import {Amount} from 'constants/action';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import {isVariableAmount} from './is-variable-amount';

export function convertAmountToNumber(
    amount: Amount,
    state: GameState,
    player: PlayerState,
    card?: Card
): number {
    if (!isVariableAmount(amount)) return amount;

    const amountGetter = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!amountGetter) return 0;
    return amountGetter(state, player, card) || 0;
}
