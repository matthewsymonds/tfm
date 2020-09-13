import {ResourceIcon} from 'components/resource';
import {colors} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {AppContext, getDiscountedCardCost} from 'context/app-context';
import {Pane, Popover, Position} from 'evergreen-ui';
import {Card} from 'models/card';
import {useContext, useState} from 'react';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';

const PaymentPopoverBase = styled.div`
    padding: 16px;
    border-radius: 3px;
    box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.35);
    background: #f7f7f7;
    .payment-rows {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
    }
`;

const PaymentPopoverRowBase = styled.div`
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

const PaymentPopoverSummaryRow = styled.div<{isValidPayment: boolean}>`
    display: flex;
    align-items: center;
    padding: 12px 0;
    font-weight: 600;
    justify-content: space-between;
    .running-total {
        color: ${props => (props.isValidPayment ? 'black' : 'red')};
    }
`;

const PaymentPopoverConfirmationButton = styled.button`
    margin-top: 16px;
`;

type PaymentPopoverRowProps = {
    resource: Resource;
    currentQuantity: number;
    availableQuantity: number;
    handleIncrease: (resource: Resource) => void;
    handleDecrease: (resource: Resource) => void;
};

function PaymentPopoverRow({
    resource,
    currentQuantity,
    availableQuantity,
    handleIncrease,
    handleDecrease,
}: PaymentPopoverRowProps) {
    return (
        <PaymentPopoverRowBase>
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
        </PaymentPopoverRowBase>
    );
}

// payment popover is used for cards, card actions, standard projects, milestones, and awards.
// either `card` or `cost` will be defined in props. we need the full card in order to determine
// tag discounts and alternate payments (steel / titanium).
type BasePaymentPopoverProps = {
    onConfirmPayment: (payment: PropertyCounter<Resource>) => void;
    children: React.ReactNode;
};
type CardPaymentPopoverProps = BasePaymentPopoverProps & {
    cost?: undefined;
    card: Card;
};
type CardActionPaymentPopoverProps = BasePaymentPopoverProps & {
    cost: number;
    card?: undefined;
};
type PaymentPopoverProps = CardPaymentPopoverProps | CardActionPaymentPopoverProps;

export default function PaymentPopover({
    onConfirmPayment,
    children,
    card,
    cost,
}: PaymentPopoverProps) {
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
    const {resources, exchangeRates} = player;
    let actionCost;
    if (card) {
        actionCost = getDiscountedCardCost(card, player);
    } else if (typeof cost === 'number') {
        actionCost = cost;
    } else {
        throw new Error('Unrecognized cost for card payment popover');
    }
    const [numMC, setNumMC] = useState(Math.min(resources[Resource.MEGACREDIT], actionCost || 0));
    const [numSteel, setNumSteel] = useState(0);
    const [numTitanium, setNumTitanium] = useState(0);
    const [numHeat, setNumHeat] = useState(0);

    function handleDecrease(resource: Resource) {
        const runningTotalWithoutMegacredits = calculateRunningTotalWithoutMegacredits();
        switch (resource) {
            case Resource.MEGACREDIT:
                const proposedValue = Math.max(0, numMC - 1);
                setNumMC(proposedValue);
                return;
            case Resource.TITANIUM:
                if (numTitanium > 0) {
                    const titaniumValue = exchangeRates[Resource.TITANIUM];
                    const remainingValue =
                        actionCost - runningTotalWithoutMegacredits + titaniumValue;
                    setNumTitanium(numTitanium - 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, resources[Resource.MEGACREDIT])));
                }
                return;
            case Resource.STEEL:
                if (numSteel > 0) {
                    const steelValue = exchangeRates[Resource.STEEL];
                    const remainingValue = actionCost - runningTotalWithoutMegacredits + steelValue;
                    setNumSteel(numSteel - 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, resources[Resource.MEGACREDIT])));
                }
                return;
            case Resource.HEAT:
                if (numHeat > 0) {
                    const remainingValue = actionCost - runningTotalWithoutMegacredits + 1;
                    setNumHeat(numHeat - 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, resources[Resource.MEGACREDIT])));
                }
                return;
        }
    }

    function handleIncrease(resource: Resource) {
        const runningTotal = calculateRunningTotal();
        const runningTotalWithoutMegacredits = calculateRunningTotalWithoutMegacredits();

        switch (resource) {
            case Resource.MEGACREDIT:
                if (runningTotal >= actionCost) return;
                const proposedValue = Math.min(numMC + 1, resources[Resource.MEGACREDIT]);
                setNumMC(proposedValue);
                return;
            case Resource.TITANIUM:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numTitanium < resources[Resource.TITANIUM]) {
                    const titaniumValue = exchangeRates[Resource.TITANIUM];
                    const remainingValue =
                        actionCost - runningTotalWithoutMegacredits - titaniumValue;
                    setNumTitanium(numTitanium + 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, resources[Resource.MEGACREDIT])));
                }
                return;
            case Resource.STEEL:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numSteel < resources[Resource.STEEL]) {
                    const steelValue = exchangeRates[Resource.STEEL];
                    const remainingValue = actionCost - runningTotalWithoutMegacredits - steelValue;
                    setNumSteel(numSteel + 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, resources[Resource.MEGACREDIT])));
                }
                return;
            case Resource.HEAT:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numHeat < resources[Resource.HEAT]) {
                    const remainingValue = actionCost - runningTotalWithoutMegacredits - 1;
                    setNumHeat(numHeat + 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, resources[Resource.MEGACREDIT])));
                }
                return;
        }
    }

    function calculateRunningTotal() {
        return (
            numMC +
            numSteel * exchangeRates[Resource.STEEL] +
            numTitanium * exchangeRates[Resource.TITANIUM] +
            numHeat * 1
        );
    }

    function calculateRunningTotalWithoutMegacredits() {
        return (
            numSteel * exchangeRates[Resource.STEEL] +
            numTitanium * exchangeRates[Resource.TITANIUM] +
            numHeat * 1
        );
    }

    const runningTotal = calculateRunningTotal();
    const isValidPayment = actionCost <= runningTotal;

    return (
        <Popover
            position={Position.RIGHT}
            content={({close}) => (
                <PaymentPopoverBase>
                    <PaymentPopoverSummaryRow isValidPayment={isValidPayment}>
                        <span>Cost: {actionCost}</span>
                        <span className="running-total">
                            <em style={{color: isValidPayment ? colors[1] : colors[0]}}>
                                Current: {runningTotal}
                            </em>
                        </span>
                    </PaymentPopoverSummaryRow>
                    <div className="payment-rows">
                        {resources[Resource.MEGACREDIT] > 0 && (
                            <PaymentPopoverRow
                                resource={Resource.MEGACREDIT}
                                currentQuantity={numMC}
                                availableQuantity={resources[Resource.MEGACREDIT]}
                                handleIncrease={handleIncrease}
                                handleDecrease={handleDecrease}
                            />
                        )}
                        {card &&
                            card.tags.includes(Tag.BUILDING) &&
                            resources[Resource.STEEL] > 0 && (
                                <PaymentPopoverRow
                                    resource={Resource.STEEL}
                                    currentQuantity={numSteel}
                                    availableQuantity={resources[Resource.STEEL]}
                                    handleIncrease={handleIncrease}
                                    handleDecrease={handleDecrease}
                                />
                            )}
                        {card &&
                            card.tags.includes(Tag.SPACE) &&
                            resources[Resource.TITANIUM] > 0 && (
                                <PaymentPopoverRow
                                    resource={Resource.TITANIUM}
                                    currentQuantity={numTitanium}
                                    availableQuantity={resources[Resource.TITANIUM]}
                                    handleIncrease={handleIncrease}
                                    handleDecrease={handleDecrease}
                                />
                            )}
                        {player.corporation.name === 'Helion' && resources[Resource.HEAT] > 0 && (
                            <PaymentPopoverRow
                                resource={Resource.HEAT}
                                currentQuantity={numHeat}
                                availableQuantity={resources[Resource.HEAT]}
                                handleIncrease={handleIncrease}
                                handleDecrease={handleDecrease}
                            />
                        )}
                    </div>
                    <PaymentPopoverConfirmationButton
                        disabled={!isValidPayment}
                        onClick={() => {
                            onConfirmPayment({
                                [Resource.MEGACREDIT]: numMC,
                                [Resource.STEEL]: numSteel,
                                [Resource.TITANIUM]: numTitanium,
                                [Resource.HEAT]: numHeat,
                            });
                            close();
                        }}
                    >
                        Confirm
                    </PaymentPopoverConfirmationButton>
                </PaymentPopoverBase>
            )}
        >
            <Pane>{children}</Pane>
        </Popover>
    );
}
