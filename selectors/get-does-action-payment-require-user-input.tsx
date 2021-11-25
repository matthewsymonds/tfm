import {Action} from 'constants/action';
import {Resource} from 'constants/resource-enum';
import {PlayerState} from 'reducer';

export function getDoesActionPaymentRequireUserInput(loggedInPlayer: PlayerState, action: Action) {
    return (
        (action.acceptedPayment &&
            action.acceptedPayment.some(
                resource => (loggedInPlayer?.resources[resource] ?? 0) > 0
            )) ||
        (loggedInPlayer?.corporation.name === 'Helion' &&
            loggedInPlayer?.resources[Resource.HEAT] > 0)
    );
}
