import {ChangeEvent, useContext} from 'react';
import {Popover} from 'reactstrap';
import styled from 'styled-components';
import {Card} from 'models/card';
import {Tag} from 'constants/tag';
import {Resource} from 'constants/resource';
import {useState} from 'react';
import {getDiscountedCardCost, AppContext} from 'context/app-context';
import {PropertyCounter} from 'constants/property-counter';
import {ResourceIcon} from 'components/resource';
import {useTypedSelector} from 'reducer';

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
    box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.35);
    background: #f7f7f7;
    font-family: sans-serif;
    .card-payment-rows {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
    }
`;

const CardPaymentRowBase = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    input {
        width: 40px;
        margin-left: 16px;
    }
    > div {
        display: flex;
        align-items: center;
    }
    .payment-row-input-container {
        display: flex;
        align-items: center;
        margin: 4px 0px 4px 24px;
        > button {
            padding: 8px;
            min-width: 0;
            margin: 0;
        }
        > span {
            display: flex;
            justify-content: center;
            width: 32px;
        }
    }
`;

const CardPaymentSummaryRow = styled.div<{isValidPayment: boolean}>`
    display: flex;
    align-items: center;
    padding: 12px 0;
    font-weight: 600;
    justify-content: space-between;
    .running-total {
        color: ${props => (props.isValidPayment ? 'black' : 'red')};
    }
`;

const CardPaymentConfirmationButton = styled.button`
    margin-top: 16px;
`;

type CardPaymentRowProps = {
    resource: Resource;
    currentQuantity: number;
    availableQuantity: number;
    handleIncrease: (resource: Resource) => void;
    handleDecrease: (resource: Resource) => void;
};

function CardPaymentRow({
    resource,
    currentQuantity,
    availableQuantity,
    handleIncrease,
    handleDecrease,
}: CardPaymentRowProps) {
    return (
        <CardPaymentRowBase>
            <div>
                <ResourceIcon name={resource} />({availableQuantity})
            </div>
            <div className="payment-row-right">
                <div className="payment-row-input-container">
                    <button
                        disabled={currentQuantity === 0}
                        onClick={() => handleDecrease(resource)}
                    >
                        -
                    </button>
                    <span>{currentQuantity}</span>
                    <button
                        disabled={currentQuantity === availableQuantity}
                        onClick={() => handleIncrease(resource)}
                    >
                        +
                    </button>
                </div>
            </div>
        </CardPaymentRowBase>
    );
}

export default function CardPaymentPopover({
    isOpen,
    target,
    toggle,
    card,
    onConfirmPayment,
}: Props) {
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
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
                    const titaniumValue = exchangeRates[Resource.TITANIUM];
                    setNumTitanium(numTitanium - 1);
                    setNumMC(
                        Math.max(0, Math.min(numMC + titaniumValue, resources[Resource.MEGACREDIT]))
                    );
                }
                return;
            case Resource.STEEL:
                if (numSteel > 0) {
                    const steelValue = exchangeRates[Resource.STEEL];
                    setNumSteel(numSteel - 1);
                    setNumMC(
                        Math.max(0, Math.min(numMC + steelValue, resources[Resource.MEGACREDIT]))
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
                    const titaniumValue = exchangeRates[Resource.TITANIUM];
                    setNumTitanium(numTitanium + 1);
                    setNumMC(
                        Math.max(0, Math.min(numMC - titaniumValue, resources[Resource.MEGACREDIT]))
                    );
                }
                return;
            case Resource.STEEL:
                if (runningTotal >= cardCost && numMC === 0) return;
                if (numSteel < resources[Resource.STEEL]) {
                    const steelValue = exchangeRates[Resource.STEEL];
                    setNumSteel(numSteel + 1);
                    setNumMC(
                        Math.max(0, Math.min(numMC + steelValue, resources[Resource.MEGACREDIT]))
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

    const runningTotal = calculateRunningTotal();
    const isValidPayment = cardCost <= runningTotal;

    return (
        <Popover placement="right" isOpen={isOpen} target={target} toggle={toggle} fade={true}>
            <CardPaymentBase>
                <CardPaymentSummaryRow isValidPayment={isValidPayment}>
                    <span>Cost: {cardCost}</span>
                    {!isValidPayment && (
                        <span className="running-total">
                            <em>Current: {runningTotal}</em>
                        </span>
                    )}
                </CardPaymentSummaryRow>
                <div className="card-payment-rows">
                    {resources[Resource.MEGACREDIT] > 0 && (
                        <CardPaymentRow
                            resource={Resource.MEGACREDIT}
                            currentQuantity={numMC}
                            availableQuantity={resources[Resource.MEGACREDIT]}
                            handleIncrease={handleIncrease}
                            handleDecrease={handleDecrease}
                        />
                    )}
                    {card.tags.includes(Tag.BUILDING) && resources[Resource.STEEL] > 0 && (
                        <CardPaymentRow
                            resource={Resource.STEEL}
                            currentQuantity={numSteel}
                            availableQuantity={resources[Resource.STEEL]}
                            handleIncrease={handleIncrease}
                            handleDecrease={handleDecrease}
                        />
                    )}
                    {card.tags.includes(Tag.SPACE) && resources[Resource.TITANIUM] > 0 && (
                        <CardPaymentRow
                            resource={Resource.TITANIUM}
                            currentQuantity={numTitanium}
                            availableQuantity={resources[Resource.TITANIUM]}
                            handleIncrease={handleIncrease}
                            handleDecrease={handleDecrease}
                        />
                    )}
                </div>
                <CardPaymentConfirmationButton
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
                </CardPaymentConfirmationButton>
            </CardPaymentBase>
        </Popover>
    );
}
