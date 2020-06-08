import {PlayerState} from 'reducer';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {Amount} from 'constants/action';
import {VariableAmount} from 'constants/variable-amount';
import {Button} from './button';
import {Card} from 'models/card';

function getCardDiscardAmountHumanName(amount: Amount) {
    if (amount === VariableAmount.USER_CHOICE) {
        return 'at least one';
    }

    if (amount === VariableAmount.USER_CHOICE_MIN_ZERO) {
        return 'any number of';
    }

    if (amount === VariableAmount.USER_CHOICE_UP_TO_ONE) {
        return '1 or 0';
    }

    return amount;
}

export function AskUserToConfirmDiscardSelection(props: {
    player: PlayerState;
    minCardsToDiscard: number;
    maxCardsToDiscard: number;
    cardsToDiscard: Card[];
    confirmDiscardSelection: Function;
}) {
    const {player, confirmDiscardSelection, minCardsToDiscard} = props;
    const {pendingDiscard} = player;

    return (
        <AskUserToMakeChoice card={pendingDiscard?.card}>
            <div>
                Please select {getCardDiscardAmountHumanName(pendingDiscard!.amount!)} card
                {minCardsToDiscard ? '' : 's'} to discard.
            </div>
            <Button
                disabled={props.cardsToDiscard.length < props.minCardsToDiscard}
                onClick={confirmDiscardSelection}
            >
                Confirm discard selection
            </Button>
        </AskUserToMakeChoice>
    );
}
