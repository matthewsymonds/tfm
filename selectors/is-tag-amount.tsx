import {Amount} from 'constants/action';
import {TagAmount} from 'constants/tag';

export function isTagAmount(amount: Amount): amount is TagAmount {
    if (typeof amount === 'number') return false;
    // Variable amount is string enum
    if (typeof amount === 'string') return false;
    return true;
}
