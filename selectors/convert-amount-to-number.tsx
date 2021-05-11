import {Amount} from 'constants/action';
import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {getTags, VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import {SerializedCard} from 'state-serialization';
import {isTagAmount} from './is-tag-amount';
import {isVariableAmount} from './is-variable-amount';

/* This function should NOT be used for victory point calculation as wild tags do not count. */
export function convertAmountToNumber(
    amount: Amount,
    state: GameState,
    player: PlayerState,
    card?: SerializedCard
): number {
    if (isTagAmount(amount)) {
        const tags = getTags(player);
        const matchingTags = tags.filter(tag => tag === amount.tag || tag === Tag.WILD);
        return Math.floor(matchingTags.length / (amount.dividedBy ?? 1));
    }
    if (!isVariableAmount(amount)) return amount;

    const amountGetter = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!amountGetter) return 0;
    return amountGetter(state, player, card) || 0;
}
