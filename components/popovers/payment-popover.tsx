import {Box, Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {Action} from 'constants/action';
import {PLAYER_COLORS} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {Pane, Popover, Position} from 'evergreen-ui';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Card} from 'models/card';
import React, {useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getConditionalPaymentWithResourceInfo} from 'selectors/get-conditional-payment-with-resource-info';
import {getDiscountedCardCost} from 'selectors/get-discounted-card-cost';
import {getMoney} from 'selectors/get-money';
import styled from 'styled-components';

const PaymentPopoverBase = styled.div`
    padding: 16px;
    border-radius: 3px;
    z-index: 31; // HACK: Remove this once the top-bar is either modalized or has less janky scroll behavior
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
        align-items: flex-start;
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
    numMC: number;
    playerMoney: number;
    name?: string;
};

function PaymentPopoverRow({
    resource,
    currentQuantity,
    availableQuantity,
    handleIncrease,
    handleDecrease,
    numMC,
    name,
    playerMoney,
}: PaymentPopoverRowProps) {
    let shouldDisableIncrease = false;
    currentQuantity === availableQuantity || numMC === 0;
    if (currentQuantity === availableQuantity) {
        shouldDisableIncrease = true;
    }

    if (numMC === 0 && resource !== Resource.MEGACREDIT && playerMoney > 0) {
        shouldDisableIncrease = true;
    }

    return (
        <PaymentPopoverRowBase>
            <Flex flexDirection="column">
                <Flex>
                    <ResourceIcon name={resource} />
                    <Box marginLeft="4px">({availableQuantity})</Box>
                </Flex>
                {name ? (
                    <Box fontStyle="italic" fontSize="8px" paddingTop="0px">
                        ({name})
                    </Box>
                ) : null}
            </Flex>
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
                        disabled={shouldDisableIncrease}
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
    onConfirmPayment: (payment: PropertyCounter<Resource>, conditionalPayments: number[]) => void;
    children: React.ReactNode;
    shouldHide?: boolean;
};
type CardPaymentPopoverProps = BasePaymentPopoverProps & {
    cost?: undefined;
    card: Card;
    action?: Action;
};
type CardActionPaymentPopoverProps = BasePaymentPopoverProps & {
    cost: number;
    card?: undefined;
    action?: Action;
};
type PaymentPopoverProps = CardPaymentPopoverProps | CardActionPaymentPopoverProps;

export default function PaymentPopover({
    onConfirmPayment,
    children,
    card,
    action,
    cost,
    shouldHide,
}: PaymentPopoverProps) {
    const player = useLoggedInPlayer();
    const playerMoney = useTypedSelector(state => getMoney(state, player));
    const conditionalPayment = useTypedSelector(state =>
        getConditionalPaymentWithResourceInfo(player, card)
    );
    const {resources, exchangeRates} = player;
    let actionCost = cost || 0;
    if (card) {
        actionCost = getDiscountedCardCost(card, player);
    }
    const [numMC, setNumMC] = useState(Math.min(playerMoney, actionCost || 0));
    const [numSteel, setNumSteel] = useState(0);
    const [numTitanium, setNumTitanium] = useState(0);
    const [numHeat, setNumHeat] = useState(0);
    const [numConditionalPayment, setNumConditionalPayment] = useState<number[]>(
        Array(conditionalPayment.length).fill(0)
    );

    // Ensure the popover doesn't let you pay with resources you no longer have.
    useEffect(() => {
        handleDecrease(Resource.MEGACREDIT, numMC - playerMoney);
        handleDecrease(Resource.STEEL, numSteel - resources[Resource.STEEL]);
        handleDecrease(Resource.TITANIUM, numTitanium - resources[Resource.TITANIUM]);
        handleDecrease(Resource.HEAT, numHeat - resources[Resource.HEAT]);
        for (let i = 0; i < conditionalPayment.length; i++) {
            const payment = conditionalPayment[i];
            handleDecrease(payment.resourceType, numConditionalPayment[i] - payment.resourceAmount);
        }
    }, [
        playerMoney,
        resources[Resource.STEEL],
        resources[Resource.TITANIUM],
        resources[Resource.HEAT],
        ...conditionalPayment.map(payment => payment.resourceAmount),
    ]);

    if (shouldHide) {
        return <React.Fragment>{children}</React.Fragment>;
    }

    function handleDecrease(resource: Resource, quantity = 1) {
        if (quantity <= 0) return;
        const runningTotalWithoutMegacredits = calculateRunningTotalWithoutMegacredits();
        switch (resource) {
            case Resource.MEGACREDIT:
                const proposedValue = Math.max(0, numMC - quantity);
                setNumMC(proposedValue);
                return;
            case Resource.TITANIUM:
                if (numTitanium > 0) {
                    const titaniumValue = exchangeRates[Resource.TITANIUM];
                    const remainingValue =
                        actionCost - runningTotalWithoutMegacredits + titaniumValue;
                    setNumTitanium(numTitanium - quantity);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
                return;
            case Resource.STEEL:
                if (numSteel > 0) {
                    const steelValue = exchangeRates[Resource.STEEL];
                    const remainingValue = actionCost - runningTotalWithoutMegacredits + steelValue;
                    setNumSteel(numSteel - quantity);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
                return;
            case Resource.HEAT:
                if (numHeat > 0) {
                    const remainingValue = actionCost - runningTotalWithoutMegacredits + 1;
                    setNumHeat(numHeat - quantity);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
                return;
            default:
                // conditional payments
                const index = conditionalPayment.findIndex(
                    payment => payment.resourceType === resource
                );
                const payment = conditionalPayment[index];
                if (numConditionalPayment[index] > 0) {
                    const remainingValue =
                        actionCost - runningTotalWithoutMegacredits + (payment?.rate ?? 0);
                    const newNumConditionalPayment = [...numConditionalPayment];
                    newNumConditionalPayment[index] -= quantity;
                    setNumConditionalPayment(newNumConditionalPayment);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
        }
    }

    function handleIncrease(resource: Resource) {
        const runningTotal = calculateRunningTotal();
        const runningTotalWithoutMegacredits = calculateRunningTotalWithoutMegacredits();

        switch (resource) {
            case Resource.MEGACREDIT:
                if (runningTotal >= actionCost) return;
                const proposedValue = Math.min(numMC + 1, playerMoney);
                setNumMC(proposedValue);
                return;
            case Resource.TITANIUM:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numTitanium < resources[Resource.TITANIUM]) {
                    const titaniumValue = exchangeRates[Resource.TITANIUM];
                    const remainingValue =
                        actionCost - runningTotalWithoutMegacredits - titaniumValue;
                    setNumTitanium(numTitanium + 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
                return;
            case Resource.STEEL:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numSteel < resources[Resource.STEEL]) {
                    const steelValue = exchangeRates[Resource.STEEL];
                    const remainingValue = actionCost - runningTotalWithoutMegacredits - steelValue;
                    setNumSteel(numSteel + 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
                return;
            case Resource.HEAT:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numHeat < resources[Resource.HEAT]) {
                    const remainingValue = actionCost - runningTotalWithoutMegacredits - 1;
                    setNumHeat(numHeat + 1);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
                return;
            default:
                const index = conditionalPayment.findIndex(
                    payment => payment.resourceType === resource
                );
                if (runningTotal >= actionCost && numMC === 0) return;
                const payment = conditionalPayment[index];
                if (numConditionalPayment[index] < payment.resourceAmount) {
                    const remainingValue =
                        actionCost - runningTotalWithoutMegacredits - payment.rate;
                    const newNumConditionalPayment = [...numConditionalPayment];
                    newNumConditionalPayment[index] += 1;
                    setNumConditionalPayment(newNumConditionalPayment);
                    setNumMC(Math.max(0, Math.min(remainingValue, playerMoney)));
                }
                return;
        }
    }

    function calculateRunningTotal() {
        return (
            numMC +
            numSteel * exchangeRates[Resource.STEEL] +
            numTitanium * exchangeRates[Resource.TITANIUM] +
            numHeat * 1 +
            numConditionalPayment.reduce(
                (acc, quantity, index) => acc + quantity * conditionalPayment[index].rate,
                0
            )
        );
    }

    function calculateRunningTotalWithoutMegacredits() {
        return (
            numSteel * exchangeRates[Resource.STEEL] +
            numTitanium * exchangeRates[Resource.TITANIUM] +
            numHeat * 1 +
            numConditionalPayment.reduce(
                (acc, quantity, index) => acc + quantity * conditionalPayment[index].rate,
                0
            )
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
                            <em
                                style={{
                                    color: isValidPayment ? PLAYER_COLORS[1] : PLAYER_COLORS[0],
                                }}
                            >
                                Current: {runningTotal}
                            </em>
                        </span>
                    </PaymentPopoverSummaryRow>
                    <div className="payment-rows">
                        {playerMoney > 0 && (
                            <PaymentPopoverRow
                                resource={Resource.MEGACREDIT}
                                currentQuantity={numMC}
                                availableQuantity={playerMoney}
                                handleIncrease={handleIncrease}
                                handleDecrease={handleDecrease}
                                numMC={numMC}
                                playerMoney={playerMoney}
                            />
                        )}
                        {(card?.tags.includes(Tag.BUILDING) ||
                            action?.acceptedPayment?.includes(Resource.STEEL)) &&
                            resources[Resource.STEEL] > 0 && (
                                <PaymentPopoverRow
                                    currentQuantity={numSteel}
                                    resource={Resource.STEEL}
                                    availableQuantity={resources[Resource.STEEL]}
                                    handleIncrease={handleIncrease}
                                    handleDecrease={handleDecrease}
                                    numMC={numMC}
                                    playerMoney={playerMoney}
                                />
                            )}
                        {(card?.tags.includes(Tag.SPACE) ||
                            action?.acceptedPayment?.includes(Resource.TITANIUM)) &&
                            resources[Resource.TITANIUM] > 0 && (
                                <PaymentPopoverRow
                                    resource={Resource.TITANIUM}
                                    currentQuantity={numTitanium}
                                    availableQuantity={resources[Resource.TITANIUM]}
                                    handleIncrease={handleIncrease}
                                    handleDecrease={handleDecrease}
                                    numMC={numMC}
                                    playerMoney={playerMoney}
                                />
                            )}
                        {player.corporation.name === 'Helion' && resources[Resource.HEAT] > 0 && (
                            <PaymentPopoverRow
                                resource={Resource.HEAT}
                                currentQuantity={numHeat}
                                availableQuantity={resources[Resource.HEAT]}
                                handleIncrease={handleIncrease}
                                handleDecrease={handleDecrease}
                                numMC={numMC}
                                playerMoney={playerMoney}
                            />
                        )}
                        {conditionalPayment.map((payment, index) => (
                            <PaymentPopoverRow
                                key={payment.name}
                                resource={payment.resourceType}
                                currentQuantity={numConditionalPayment[index]}
                                availableQuantity={payment.resourceAmount}
                                handleIncrease={handleIncrease}
                                handleDecrease={handleDecrease}
                                numMC={numMC}
                                playerMoney={playerMoney}
                                name={payment.name}
                            />
                        ))}
                    </div>
                    <PaymentPopoverConfirmationButton
                        disabled={!isValidPayment}
                        onClick={() => {
                            onConfirmPayment(
                                {
                                    [Resource.MEGACREDIT]: numMC,
                                    [Resource.STEEL]: numSteel,
                                    [Resource.TITANIUM]: numTitanium,
                                    [Resource.HEAT]: numHeat,
                                },
                                numConditionalPayment
                            );
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
