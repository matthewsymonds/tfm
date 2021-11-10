import {Amount} from './action';

export enum Condition {
    GREATER_THAN_OR_EQUAL_TO = 'conditionGreaterThanOrEqualTo',
}

export type ConditionWithOperands = {
    condition: Condition | LogicalOperatorWithConditions;
    operands?: Amount[];
};

export enum LogicalOperator {
    AND = 'logicalOperatorAnd',
    OR = 'logicalOperatorOr',
}

export interface LogicalOperatorWithConditions {
    logicalOperator: LogicalOperator;
    conditions: Array<ConditionWithOperands | LogicalOperatorWithConditions>;
}

/* Equal to 1 if the condition passes, else 0 */
export type IndicatorAmount = ConditionWithOperands;

export function isIndicatorAmount(amount: Amount): amount is IndicatorAmount {
    if (typeof amount === 'number') return false;
    // Variable amount is string enum
    if (typeof amount === 'string') return false;
    return 'condition' in amount;
}
