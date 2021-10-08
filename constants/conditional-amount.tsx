import {Amount} from './action';
import {LogicalOperatorWithConditions} from './logical-operator';

export enum Condition {
    GREATER_THAN_OR_EQUAL_TO = 'conditionGreaterThanOrEqualTo',
}

export type ConditionWithOperands = {
    condition: Condition | LogicalOperatorWithConditions;
    operands?: Amount[];
};

export type ConditionAmount = ConditionWithOperands & {
    pass: Amount;
    fail: Amount;
};

export function isConditionAmount(amount: Amount): amount is ConditionAmount {
    if (typeof amount === 'number') return false;
    // Variable amount is string enum
    if (typeof amount === 'string') return false;
    return 'condition' in amount;
}

export function condition(
    condition: Condition | LogicalOperatorWithConditions,
    ...operands: Amount[]
): ConditionWithOperands {
    return {
        condition,
        operands,
    };
}
