import {PlayerState} from '../reducer';

function AskUserToConfirmVariableAmount({
    player,
    confirmDiscardSelection,
}: {
    player: PlayerState;
    confirmDiscardSelection: () => void;
}) {
    return <div>To be unimplmeented</div>;
    // const {pendingVariableAmount} = player;
    // if (!pendingVariableAmount) {
    //     throw new Error('expected pending variable amount');
    // }

    // if (pendingVariableAmount.resource === Resource.CARD) {
    //     return (
    //         <>
    //             <div>
    //                 Select {getResourceReductionAmountHumanName(pendingVariableAmount.amount)} card
    //                 {pendingVariableAmount.amount === 1 ? '' : 's'} to discard.
    //             </div>
    //             <button onClick={confirmDiscardSelection}>Confirm discard selection</button>
    //         </>
    //     );
    // }
}

export default AskUserToConfirmVariableAmount;
