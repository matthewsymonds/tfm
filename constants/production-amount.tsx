import {Amount} from './action';
import {Resource} from './resource-enum';

export type ProductionAmount = {
    production: Resource;
};

export function isProductionAmount(amount: Amount): amount is ProductionAmount {
    if (typeof amount === 'string') return false;
    if (typeof amount === 'number') return false;

    return 'production' in amount;
}
