import {Amount} from 'constants/action';
import {VariableAmount} from 'constants/variable-amount';

export function isVariableAmount(amount: Amount): amount is VariableAmount {
    return typeof amount === 'string';
}
