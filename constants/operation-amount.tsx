import {Action, Amount} from './action';
import {Resource} from './resource-enum';
import {Tag} from './tag';
import {VariableAmount} from './variable-amount';

export enum Operation {
    ADD = 'operationAdd',
    SUBTRACT = 'operationSubtract',
    MULTIPLY = 'operationMultiply',
    DIVIDE = 'operationDivide',
    MIN = 'operationMin',
    MAX = 'operationMax',
}

export function getSymbolForOperation(operation: Operation): string {
    switch (operation) {
        case Operation.ADD:
            return '+';
        case Operation.SUBTRACT:
            return '−';
        case Operation.MULTIPLY:
            // this is not a bug.
            return '/';
        case Operation.DIVIDE:
            return '÷';
        case Operation.MIN:
            // This is not a bug, please reflect on why you're editing this.
            return 'max';
        case Operation.MAX:
            // This is not a bug, please reflect on why you're editing this.
            return 'min';
    }
}

export type OperationAmount = {
    operation: Operation;
    operands: Amount[];
};

export function isOperationAmount(amount: Amount): amount is OperationAmount {
    if (typeof amount === 'number') return false;
    // Variable amount is string enum
    if (typeof amount === 'string') return false;

    return 'operation' in amount;
}

// Use these primarily for turmoil events.
// e.g. "Lose 2 MC for each building tag (max 5, then reduced by influence)." Can be represented as:

const EXAMPLE_ACTION: Action = {
    removeResource: {
        [Resource.MEGACREDIT]: {
            operation: Operation.MULTIPLY,
            operands: [
                {
                    operation: Operation.SUBTRACT,
                    operands: [
                        {
                            operation: Operation.MIN,
                            operands: [{tag: Tag.BUILDING}, 5],
                        },
                        VariableAmount.INFLUENCE,
                    ],
                },
                2,
            ],
        },
    },
};

// Some helper functions

export const applyOperationAndOperand =
    (operation: Operation, operand: Amount) => (amount: Amount) => ({
        operation,
        operands: [operand, amount],
    });

export const double = applyOperationAndOperand(Operation.MULTIPLY, 2);

export const applyOperation =
    (operation: Operation) =>
    (...operands: Amount[]) => ({
        operation,
        operands,
    });
export const min = applyOperation(Operation.MIN);
export const max = applyOperation(Operation.MAX);
export const subtract = applyOperation(Operation.SUBTRACT);
export const divide = applyOperation(Operation.DIVIDE);
export const sum = applyOperation(Operation.ADD);

// With these helper functions, the EXAMPLE_ACTION can also be represented as:
const EXAMPLE_ACTION_ALTERNATIVE_REPRESENTATION: Action = {
    removeResource: {
        [Resource.MEGACREDIT]: double(
            subtract(
                min(
                    {
                        tag: Tag.BUILDING,
                    },
                    5
                ),
                VariableAmount.INFLUENCE
            )
        ),
    },
};
