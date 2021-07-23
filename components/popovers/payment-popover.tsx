import {Box, Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {Action} from 'constants/action';
import {PLAYER_COLORS} from 'constants/game';
import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {Pane, Popover, Position} from 'evergreen-ui';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {usePrevious} from 'hooks/use-previous';
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
    disable?: boolean;
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
    disable,
}: PaymentPopoverRowProps) {
    let shouldDisableIncrease = false;
    if (currentQuantity === availableQuantity) {
        shouldDisableIncrease = true;
    }

    if (numMC === 0 && playerMoney > 0) {
        shouldDisableIncrease = true;
    }
    if (disable) {
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
    onConfirmPayment: (
        payment: NumericPropertyCounter<Resource>,
        conditionalPayments: number[]
    ) => void;
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
    const conditionalPayment = useTypedSelector(() =>
        getConditionalPaymentWithResourceInfo(player, card)
    );
    const {resources, exchangeRates} = player;
    let actionCost = cost || 0;
    if (card) {
        actionCost = getDiscountedCardCost(card, player);
    }
    const [numSteel, setNumSteel] = useState(0);
    const [numTitanium, setNumTitanium] = useState(0);
    const [numHeat, setNumHeat] = useState(0);
    const [numConditionalPayment, setNumConditionalPayment] = useState<number[]>(
        Array(conditionalPayment.length).fill(0)
    );

    const numMC = Math.min(
        playerMoney,
        Math.max(0, actionCost - calculateRunningTotalWithoutMegacredits())
    );

    // Ensure the popover doesn't let you pay with resources you no longer have.
    useEffect(() => {
        handleDecrease(Resource.STEEL, numSteel - resources[Resource.STEEL]);
        handleDecrease(Resource.TITANIUM, numTitanium - resources[Resource.TITANIUM]);
        handleDecrease(Resource.HEAT, numHeat - resources[Resource.HEAT]);
        for (let i = 0; i < conditionalPayment.length; i++) {
            const payment = conditionalPayment[i];
            handleDecrease(payment.resourceType, numConditionalPayment[i] - payment.resourceAmount);
        }
    }, [
        resources[Resource.STEEL],
        resources[Resource.TITANIUM],
        resources[Resource.HEAT],
        ...conditionalPayment.map(payment => payment.resourceAmount),
    ]);

    const prevActionCost = usePrevious(actionCost);

    useEffect(() => {
        // If the action cost decreases (e.g. removing a picked card), reset the pickers so the player is not overpaying.
        if (actionCost < (prevActionCost ?? 0)) {
            handleDecrease(Resource.STEEL, numSteel);
            handleDecrease(Resource.TITANIUM, numTitanium);
            handleDecrease(Resource.HEAT, numHeat);
            for (let i = 0; i < conditionalPayment.length; i++) {
                const payment = conditionalPayment[i];
                handleDecrease(payment.resourceType, numConditionalPayment[i]);
            }
        }
    }, [actionCost, prevActionCost]);

    // Ensure when actionCost changes the payment popover reflects the cost change.

    if (shouldHide) {
        return <React.Fragment>{children}</React.Fragment>;
    }

    const runningTotalWithoutMegacredits = calculateRunningTotalWithoutMegacredits();

    function handleDecrease(resource: Resource, quantity = 1) {
        if (quantity <= 0) return;
        switch (resource) {
            case Resource.TITANIUM:
                if (numTitanium > 0) {
                    setNumTitanium(numTitanium - quantity);
                }
                return;
            case Resource.STEEL:
                if (numSteel > 0) {
                    setNumSteel(numSteel - quantity);
                }
                return;
            case Resource.HEAT:
                if (numHeat > 0) {
                    setNumHeat(numHeat - quantity);
                }
                return;
            default:
                // conditional payments
                const index = conditionalPayment.findIndex(
                    payment => payment.resourceType === resource
                );
                const payment = conditionalPayment[index];
                if (numConditionalPayment[index] > 0) {
                    const newNumConditionalPayment = [...numConditionalPayment];
                    newNumConditionalPayment[index] -= quantity;
                    setNumConditionalPayment(newNumConditionalPayment);
                }
        }
    }

    function handleIncrease(resource: Resource) {
        const runningTotal = calculateRunningTotal();
        switch (resource) {
            case Resource.TITANIUM:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numTitanium < resources[Resource.TITANIUM]) {
                    setNumTitanium(numTitanium + 1);
                }
                return;
            case Resource.STEEL:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numSteel < resources[Resource.STEEL]) {
                    setNumSteel(numSteel + 1);
                }
                return;
            case Resource.HEAT:
                if (runningTotal >= actionCost && numMC === 0) return;
                if (numHeat < resources[Resource.HEAT]) {
                    setNumHeat(numHeat + 1);
                }
                return;
            default:
                const index = conditionalPayment.findIndex(
                    payment => payment.resourceType === resource
                );
                if (runningTotal >= actionCost && numMC === 0) return;
                const payment = conditionalPayment[index];
                if (numConditionalPayment[index] < payment.resourceAmount) {
                    const newNumConditionalPayment = [...numConditionalPayment];
                    newNumConditionalPayment[index] += 1;
                    setNumConditionalPayment(newNumConditionalPayment);
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
                    <Box marginBottom="4px" fontSize="12px">
                        With <em>{numMC} MC</em> and...
                    </Box>
                    <div className="payment-rows">
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

type HeatPaymentPopoverProps = {
    onConfirmPayment: (payment: NumericPropertyCounter<Resource>) => void;
    useStoredResourceAsCard: Card;
    cost: number;
    children: React.ReactNode;
};

export function HeatPaymentPopover({
    onConfirmPayment,
    children,
    useStoredResourceAsCard,
    cost,
}: HeatPaymentPopoverProps) {
    const player = useLoggedInPlayer();
    const playerHeat = useTypedSelector(state => player.resources[Resource.HEAT]);
    const [numStoredResource, setNumStoredResource] = useState(0);
    const totalStoredResource = useStoredResourceAsCard.storedResourceAmount!;
    const resource = useStoredResourceAsCard.storedResourceType!;

    const numHeat = Math.min(playerHeat, Math.max(0, cost - calculateRunningTotalWithoutHeat()));

    function handleDecrease(resource: Resource, quantity = 1) {
        if (quantity <= 0) return;
        if (numStoredResource > 0) {
            setNumStoredResource(numStoredResource - quantity);
        }
    }

    function handleIncrease(resource: Resource) {
        const runningTotal = calculateRunningTotal();
        if (runningTotal >= cost && numHeat === 0) return;
        if (numStoredResource < totalStoredResource) {
            setNumStoredResource(numStoredResource + 1);
        }
    }

    // Ensure the popover doesn't let you pay with resources you no longer have.
    useEffect(() => {
        handleDecrease(resource, numStoredResource - totalStoredResource);
    }, [totalStoredResource]);

    const prevCost = usePrevious(cost);

    useEffect(() => {
        // If the cost decreases (e.g. removing a picked card), reset the pickers so the player is not overpaying.
        if (cost < (prevCost ?? 0)) {
            handleDecrease(resource, numStoredResource);
        }
    }, [cost, prevCost]);

    // Ensure when cost changes the payment popover reflects the cost change

    function calculateRunningTotal() {
        return numHeat + numStoredResource * (useStoredResourceAsCard.useStoredResourceAsHeat ?? 0);
    }

    function calculateRunningTotalWithoutHeat() {
        return numStoredResource * (useStoredResourceAsCard.useStoredResourceAsHeat ?? 0);
    }

    const runningTotal = calculateRunningTotal();
    const isValidPayment = cost <= runningTotal;

    return (
        <Popover
            position={Position.RIGHT}
            content={({close}) => (
                <PaymentPopoverBase>
                    <PaymentPopoverSummaryRow isValidPayment={isValidPayment}>
                        <span>Cost: {cost} heat</span>
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
                    <Box marginBottom="4px" fontSize="12px">
                        With <em>{numHeat} heat</em> and...
                    </Box>
                    <div className="payment-rows">
                        <PaymentPopoverRow
                            resource={resource}
                            currentQuantity={numStoredResource}
                            availableQuantity={totalStoredResource}
                            handleIncrease={handleIncrease}
                            handleDecrease={handleDecrease}
                            numMC={numHeat}
                            playerMoney={playerHeat}
                            name={useStoredResourceAsCard.name}
                            disable={runningTotal > cost}
                        />
                    </div>
                    <PaymentPopoverConfirmationButton
                        disabled={!isValidPayment}
                        onClick={() => {
                            onConfirmPayment({
                                [resource]: numStoredResource,
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
