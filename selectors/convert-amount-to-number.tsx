import {Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {
    Condition,
    ConditionAmount,
    ConditionWithOperands,
    isConditionAmount,
} from 'constants/conditional-amount';
import {ContestAmount, isContestAmount} from 'constants/contest-amount';
import {LogicalOperator, LogicalOperatorWithConditions} from 'constants/logical-operator';
import {isOperationAmount, Operation, OperationAmount} from 'constants/operation-amount';
import {isProductionAmount, ProductionAmount} from 'constants/production-amount';
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
            // Martian Survey
            if (fullCard.type === CardType.EVENT) {
                extraTags = fullCard.tags.filter(tag => tag === amount.tag).length;
            }
        }
        return Math.floor((matchingTags.length + extraTags) / (amount.dividedBy ?? 1));
    }
    if (isProductionAmount(amount)) {
        return convertProductionAmountToNumber(amount, state, player, card);
    }
    if (isOperationAmount(amount)) {
        return convertOperationAmountToNumber(amount, state, player, card);
    }
    if (isConditionAmount(amount)) {
        return convertConditionAmountToNumber(amount, state, player, card);
    }
    if (isContestAmount(amount)) {
        return convertContestAmountToNumber(amount, state, player, card);
    }
    if (!isVariableAmount(amount)) return amount;

    const amountGetter = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!amountGetter) return 0;
    return amountGetter(state, player, card) || 0;
}

export function convertProductionAmountToNumber(
    amount: ProductionAmount,
    state: GameState,
    player: PlayerState,
    card?: SerializedCard
) {
    return Math.min(player.productions[amount.production], 0) ?? 0;
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

export function convertConditionAmountToNumber(
    amount: ConditionAmount,
    state: GameState,
    player: PlayerState,
    card?: SerializedCard
): number {
    const {pass, fail} = amount;
    const passed = isConditionPassed(amount, state, player, card);
    if (passed) {
        return convertAmountToNumber(pass, state, player, card);
    } else {
        return convertAmountToNumber(fail, state, player, card);
    }
}

export function isConditionPassed(
    conditionWithOperands: ConditionWithOperands,
    state: GameState,
    player: PlayerState,
    card?: SerializedCard
): boolean {
    let {condition, operands} = conditionWithOperands;
    operands = operands ?? [];

    switch (condition) {
        case Condition.GREATER_THAN_OR_EQUAL_TO:
            const [first, second] = operands.map(operand =>
                convertAmountToNumber(operand, state, player, card)
            );
            return first >= second;
        default:
            return isLogicalOperatorPassed(condition, state, player, card);
    }
}

export function isLogicalOperatorPassed(
    amount: LogicalOperatorWithConditions,
    state: GameState,
    player: PlayerState,
    card?: SerializedCard
): boolean {
    const {logicalOperator, conditions} = amount;

    return (logicalOperator === LogicalOperator.OR ? conditions.some : conditions.every).bind(
        conditions
    )(condition => {
        if ('logicalOperator' in condition) {
            return isLogicalOperatorPassed(condition, state, player, card);
        } else {
            return isConditionPassed(condition, state, player, card);
        }
    });
}

export function convertContestAmountToNumber(
    amount: ContestAmount,
    state: GameState,
    player: PlayerState,
    card?: SerializedCard
): number {
    if (state.players.length === 1) {
        const contest = convertAmountToNumber(amount.contest, state, player, card);
        if (contest >= convertAmountToNumber(amount.soloFirst, state, player, card)) {
            return convertAmountToNumber(amount.first, state, player, card);
        }
        if (
            typeof amount.soloSecond !== 'undefined' &&
            contest >= convertAmountToNumber(amount.soloSecond, state, player, card)
        ) {
            return convertAmountToNumber(amount.second, state, player, card);
        }
        return 0;
    }
    const playerResults: number[] = state.players.map(player => {
        return convertAmountToNumber(amount.contest, state, player, card);
    });

    const firstPlace = Math.max(...playerResults);

    if (playerResults[player.index] === firstPlace) {
        return convertAmountToNumber(amount.first, state, player, card);
    }

    const secondPlace = Math.max(...playerResults.filter(result => result !== firstPlace));

    if (playerResults[player.index] === secondPlace) {
        return convertAmountToNumber(amount.second, state, player, card);
    }

    return 0;
}
