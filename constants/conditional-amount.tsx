import {Amount} from './action';

export enum Condition {
    GREATER_THAN_OR_EQUAL_TO = 'conditionGreaterThanOrEqualTo',
}

export type ConditionWithOperands = {
    condition: Condition;
    operands?: Amount[];
};

export type ConditionAmount = ConditionWithOperands & {
    pass: number;
    fail: number;
};

export function isConditionAmount(amount: Amount): amount is ConditionAmount {
    if (typeof amount === 'number') return false;
    // Variable amount is string enum
    if (typeof amount === 'string') return false;
    return 'condition' in amount;
}

export function condition(condition: Condition, ...operands: Amount[]): ConditionWithOperands {
    return {
        condition,
        operands,
    };
}
