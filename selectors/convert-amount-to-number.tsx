import {Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {getTags, VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import {SerializedCard} from 'state-serialization';
import {getCard} from './get-card';
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
        const tags = amount.includeOpponents
            ? state.players.flatMap(player => getTags(player))
            : getTags(player);
        const matchingTags = tags.filter(tag => tag === amount.tag || tag === Tag.WILD);
        let extraTags = 0;
        if (card) {
            const fullCard = getCard(card);
            if (fullCard.type === CardType.EVENT) {
                extraTags = fullCard.tags.filter(tag => tag === amount.tag).length;
            }
        }
        return Math.floor((matchingTags.length + extraTags) / (amount.dividedBy ?? 1));
    }
    if (!isVariableAmount(amount)) return amount;

    const amountGetter = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!amountGetter) return 0;
    return amountGetter(state, player, card) || 0;
}
