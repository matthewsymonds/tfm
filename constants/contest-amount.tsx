import {Amount} from './action';

export type ContestAmount = {
    contest: Amount;
    first: number;
    second: number;
    soloFirst: number;
    soloSecond?: number;
    minimum?: boolean;
};

export function isContestAmount(amount: Amount): amount is ContestAmount {
    if (typeof amount === 'string') return false;
    if (typeof amount === 'number') return false;

    return 'contest' in amount;
}
