import {ConditionWithOperands} from './conditional-amount';
export enum LogicalOperator {
    AND = 'logicalOperatorAnd',
    OR = 'logicalOperatorOr',
}

export interface LogicalOperatorWithConditions {
    logicalOperator: LogicalOperator;
    conditions: Array<ConditionWithOperands | LogicalOperatorWithConditions>;
}

const logicalOperatorWithConditions = (logicalOperator: LogicalOperator) => (
    conditions: Array<ConditionWithOperands | LogicalOperatorWithConditions>
): LogicalOperatorWithConditions => {
    const result: LogicalOperatorWithConditions = {
        logicalOperator,
        conditions: [],
    };

    for (const condition of conditions) {
        if ('logicalOperator' in condition) {
            const fn = LOGICAL_OPERATOR_WITH_CONDITIONS_MAP[condition.logicalOperator];

            result.conditions.push(fn(condition.conditions));
        } else {
            result.conditions.push(condition);
        }
    }

    return result;
};

export const and = logicalOperatorWithConditions(LogicalOperator.AND);
export const or = logicalOperatorWithConditions(LogicalOperator.OR);

const LOGICAL_OPERATOR_WITH_CONDITIONS_MAP = {
    [LogicalOperator.AND]: and,
    [LogicalOperator.OR]: or,
};
