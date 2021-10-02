import {Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {isOperationAmount, Operation, OperationAmount} from 'constants/operation-amount';
import {Tag} from 'constants/tag';
import {GameState, PlayerState} from 'reducer';
import {getTags, VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import {SerializedCard} from 'state-serialization';
import spawnExhaustiveSwitchError from 'utils';
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
        if (card?.name) {
            const fullCard = getCard(card);
            if (fullCard.type === CardType.EVENT) {
                extraTags = fullCard.tags.filter(tag => tag === amount.tag).length;
            }
        }
        return Math.floor((matchingTags.length + extraTags) / (amount.dividedBy ?? 1));
    }
    if (isOperationAmount(amount)) {
        return convertOperationAmountToNumber(amount, state, player, card);
    }
    if (!isVariableAmount(amount)) return amount;

    const amountGetter = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!amountGetter) return 0;
    return amountGetter(state, player, card) || 0;
}

export function convertOperationAmountToNumber(
    amount: OperationAmount,
    state: GameState,
    player: PlayerState,
    card?: SerializedCard
): number {
    const {operation, operands} = amount;
    const convertedOperands: number[] = operands.map(operand =>
        convertAmountToNumber(operand, state, player, card)
    );

    switch (operation) {
        case Operation.ADD:
            return convertedOperands.reduce((acc, operand) => acc + operand, 0);
        case Operation.SUBTRACT:
            if (
                typeof convertedOperands[0] !== 'number' ||
                typeof convertedOperands[1] !== 'number'
            ) {
                return 0;
            }
            // For convenience, never go below zero.
            return Math.min(convertedOperands[0] - convertedOperands[1], 0);
        case Operation.MULTIPLY:
            return convertedOperands.reduce((acc, operand) => acc * operand, 1);
        case Operation.DIVIDE:
            if (
                typeof convertedOperands[0] !== 'number' ||
                typeof convertedOperands[1] !== 'number'
            ) {
                return 0;
            }

            if (convertedOperands[1] === 0) {
                return 0;
            }

            return Math.floor(convertedOperands[0] / convertedOperands[1]);
        case Operation.MAX:
            return Math.max(...convertedOperands);
        case Operation.MIN:
            return Math.min(...convertedOperands);
        default:
            throw new spawnExhaustiveSwitchError(operation);
    }
}
