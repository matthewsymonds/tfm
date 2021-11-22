import {Amount} from './action';
import {Resource} from './resource-enum';

export type ResourceAmount = {
    resource: Resource;
};

export function isResourceAmount(amount: Amount): amount is ResourceAmount {
    if (typeof amount === 'string') return false;
    if (typeof amount === 'number') return false;

    return 'resource' in amount;
}
