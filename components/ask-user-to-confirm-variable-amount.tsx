import {PlayerState} from '../reducer';
import {Resource} from '../constants/resource';

function getResourceReductionAmountHumanName(amount: Amount) {
    if (typeof amount !== 'number') {
        return 'any number of';
    } else {
        return amount;
    }
}

function AskUserToConfirmVariableAmount({
    player,
    confirmDiscardSelection,
}: {
    player: PlayerState;
    confirmDiscardSelection: () => void;
}) {
    const {pendingVariableAmount} = player;
    if (!pendingVariableAmount) {
        throw new Error('expected pending variable amount');
    }

    if (pendingVariableAmount.resource === Resource.CARD) {
        return (
            <>
                <div>
                    Select {getResourceReductionAmountHumanName(pendingVariableAmount.amount)} card
                    {pendingVariableAmount.amount === 1 ? '' : 's'} to discard.
                </div>
                <button onClick={confirmDiscardSelection}>Confirm discard selection</button>
            </>
        );
    }
}

export default AskUserToConfirmVariableAmount;
