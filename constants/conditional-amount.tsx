import {Amount} from './action';

export enum Condition {
    GREATER_THAN_OR_EQUAL_TO = 'conditionGreaterThanOrEqualTo',
}

export type ConditionAmount = {
    condition: Condition;
    operands: Amount[];
    pass: Amount;
    fail: Amount;
};

export function isConditionAmount(amount: Amount): amount is ConditionAmount {
    if (typeof amount === 'number') return false;
    // Variable amount is string enum
    if (typeof amount === 'string') return false;
    return 'condition' in amount;
}
