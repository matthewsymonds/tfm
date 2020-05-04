import {ChangeEvent} from 'react';
import {Popover} from 'reactstrap';
import styled from 'styled-components';
import {Card} from '../../models/card';
import {useLoggedInPlayer} from '../../selectors/players';
import {Tag} from '../../constants/tag';
import {Resource} from '../../constants/resource';
import {useState} from 'react';
import {getDiscountedCardCost} from '../../context/app-context';
import {PropertyCounter} from '../../constants/property-counter';

type Props = {
    isOpen: boolean;
    target: string | null;
    card: Card;
    toggle: () => void;
    onConfirmPayment: (payment: PropertyCounter<Resource>) => void;
};

const CardPaymentBase = styled.div`
    padding: 16px;
    border-radius: 3px;
    border: 2px solid #eee;
    background: white;
`;

const CardPaymentRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    input {
        width: 40px;
        margin-left: 16px;
    }
    .payment-row-right {
        display: flex;
        align-items: center;
    }
    .payment-row-input-container {
        display: flex;
        align-items: center;
        margin: 4px 8px;
        > button {
            padding: 8px;
            min-width: 0;
        }
        > span {
            display: flex;
            justify-content: center;
            width: 32px;
        }
    }
`;

const CardConfirmationRow = styled.div<{isValidPayment: boolean}>`
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-top: 1px solid black;
    font-weight: 600;
    justify-content: space-between;
    .running-total {
        color: ${props => (props.isValidPayment ? 'black' : 'red')};
    }
`;

export default function CardPaymentPopover({
    isOpen,
    target,
    toggle,
    card,
    onConfirmPayment,
}: Props) {
    const player = useLoggedInPlayer();
    const {resources, exchangeRates} = player;
    const cardCost = getDiscountedCardCost(card, player);
    const [numMC, setNumMC] = useState(Math.min(resources[Resource.MEGACREDIT], cardCost || 0));
    const [numSteel, setNumSteel] = useState(0);
    const [numTitanium, setNumTitanium] = useState(0);

    function handleDecrease(resource: Resource) {
        const runningTotal = calculateRunningTotal();
        switch (resource) {
            case Resource.MEGACREDIT:
                const proposedValue = Math.max(0, numMC - 1);
                setNumMC(proposedValue);
                return;
            case Resource.TITANIUM:
                if (numTitanium > 0) {
                    setNumTitanium(numTitanium - 1);
                    const newDelta = cardCost - (runningTotal + exchangeRates[Resource.TITANIUM]);
                    setNumMC(
                        Math.max(0, Math.min(numMC + newDelta, resources[Resource.MEGACREDIT]))
                    );
                }
                return;
            case Resource.STEEL:
                if (numSteel > 0) {
                    setNumSteel(numSteel - 1);
                    const newDelta = cardCost - (runningTotal - exchangeRates[Resource.STEEL]);
                    setNumMC(
                        Math.max(0, Math.min(numMC + newDelta, resources[Resource.MEGACREDIT]))
                    );
                }
                return;
        }
    }

    function handleIncrease(resource: Resource) {
        const runningTotal = calculateRunningTotal();
        switch (resource) {
            case Resource.MEGACREDIT:
                if (runningTotal >= cardCost) return;
                const proposedValue = Math.min(numMC + 1, resources[Resource.MEGACREDIT]);
                setNumMC(proposedValue);
                return;
            case Resource.TITANIUM:
                if (runningTotal >= cardCost && numMC === 0) return;
                if (numTitanium < resources[Resource.TITANIUM]) {
                    setNumTitanium(numTitanium + 1);
                    const newDelta = cardCost - (runningTotal + exchangeRates[Resource.TITANIUM]);
                    setNumMC(
                        Math.max(0, Math.min(numMC + newDelta, resources[Resource.MEGACREDIT]))
                    );
                }
                return;
            case Resource.STEEL:
                if (runningTotal >= cardCost && numMC === 0) return;
                if (numSteel < resources[Resource.STEEL]) {
                    setNumSteel(numSteel + 1);
                    const newDelta = cardCost - (runningTotal + exchangeRates[Resource.STEEL]);
                    setNumMC(
                        Math.max(0, Math.min(numMC + newDelta, resources[Resource.MEGACREDIT]))
                    );
                }
                return;
        }
    }

    function calculateRunningTotal() {
        return (
            numMC +
            numSteel * exchangeRates[Resource.STEEL] +
            numTitanium * exchangeRates[Resource.TITANIUM]
        );
    }

    const isValidPayment = cardCost <= calculateRunningTotal();

    return (
        <Popover placement="right" isOpen={isOpen} target={target} toggle={toggle} fade={true}>
            <CardPaymentBase>
                <CardPaymentRow>
                    <div>Megacredit ({resources[Resource.MEGACREDIT]})</div>
                    <div className="payment-row-right">
                        <div className="payment-row-input-container">
                            <button onClick={() => handleDecrease(Resource.MEGACREDIT)}>-</button>
                            <span>{numMC}</span>
                            <button onClick={() => handleIncrease(Resource.MEGACREDIT)}>+</button>
                        </div>
                        <span>
                            <em>{numMC} MC</em>
                        </span>
                    </div>
                </CardPaymentRow>
                {card.tags.includes(Tag.BUILDING) && (
                    <CardPaymentRow>
                        <div>Steel ({resources[Resource.STEEL]})</div>
                        <div className="payment-row-right">
                            <div className="payment-row-input-container">
                                <button onClick={() => handleDecrease(Resource.STEEL)}>-</button>
                                <span>{numSteel}</span>
                                <button onClick={() => handleIncrease(Resource.STEEL)}>+</button>
                            </div>
                            <span>
                                <em>{numSteel * exchangeRates[Resource.STEEL]} MC</em>
                            </span>
                        </div>
                    </CardPaymentRow>
                )}
                {card.tags.includes(Tag.SPACE) && (
                    <CardPaymentRow>
                        <div>Titainum ({resources[Resource.TITANIUM]})</div>
                        <div className="payment-row-right">
                            <div className="payment-row-input-container">
                                <button onClick={() => handleDecrease(Resource.TITANIUM)}>-</button>
                                <span>{numTitanium}</span>
                                <button onClick={() => handleIncrease(Resource.TITANIUM)}>+</button>
                            </div>
                            <span>
                                <em>{numTitanium * exchangeRates[Resource.TITANIUM]} MC</em>
                            </span>
                        </div>
                    </CardPaymentRow>
                )}
                <CardConfirmationRow isValidPayment={isValidPayment}>
                    <span>Total cost: {cardCost} MC</span>
                    <span className="running-total">
                        <em>{calculateRunningTotal()} MC</em>
                    </span>
                </CardConfirmationRow>
                <button
                    disabled={!isValidPayment}
                    onClick={() =>
                        onConfirmPayment({
                            [Resource.MEGACREDIT]: numMC,
                            [Resource.STEEL]: numSteel,
                            [Resource.TITANIUM]: numTitanium,
                        })
                    }
                >
                    Confirm
                </button>
            </CardPaymentBase>
        </Popover>
    );
}
