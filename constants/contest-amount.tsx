import {Amount} from './action';

export type ContestAmount = {
    contest: Amount;
    first: Amount;
    second: Amount;
    soloFirst: Amount;
    soloSecond?: Amount;
};

export function isContestAmount(amount: Amount): amount is ContestAmount {
    if (typeof amount === 'string') return false;
    if (typeof amount === 'number') return false;

    return 'contest' in amount;
}
