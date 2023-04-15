import {Box, Flex} from 'components/box';
import {Button} from 'components/button';
import {ResourceIcon} from 'components/icons/resource';
import {Action} from 'constants/action';
import {PLAYER_COLORS} from 'constants/game';
import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {PopoverType, usePopoverType} from 'context/global-popover-context';
import {useActionGuard} from 'hooks/use-action-guard';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {usePrevious} from 'hooks/use-previous';
import {Card} from 'models/card';
import React, {useEffect, useRef, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {doesCardPaymentRequirePlayerInput} from 'selectors/does-card-payment-require-player-input';
import {getConditionalPaymentWithResourceInfo} from 'selectors/get-conditional-payment-with-resource-info';
import {getDiscountedCardCost} from 'selectors/get-discounted-card-cost';
import {getDoesActionPaymentRequireUserInput} from 'selectors/get-does-action-payment-require-user-input';
import {getMoney} from 'selectors/get-money';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

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

export function usePaymentPopover<T extends HTMLElement>({
    onConfirmPayment,
    opts,
}: PaymentPopoverProps): {
    collectPaymentAndPerformAction: () => void;
    triggerRef: React.RefObject<T>;
} {
    const {showPopover, hidePopover} = usePopoverType(
        PopoverType.PAYMENT_POPOVER
    );
    const triggerRef = useRef<T>(null);
    const loggedInPlayer = useLoggedInPlayer();

    const cost =
        opts.type === 'card'
            ? getDiscountedCardCost(opts.card, loggedInPlayer)
            : opts.cost ?? 0;

    function collectPaymentAndPerformAction() {
        showPopover({
            triggerRef,
            popover: (
                <PaymentPopover
                    onConfirmPayment={(payment, conditionalPayments) => {
                        onConfirmPayment(payment, conditionalPayments);
                        // close all payment popovers. we can't pass the triggerRef here
                        // because the trigger card may no longer be mounted
                        hidePopover(null);
                    }}
                    opts={opts}
                />
            ),
        });
    }

    if (
        opts.type === 'card' &&
        doesCardPaymentRequirePlayerInput(loggedInPlayer, opts.card)
    ) {
        return {collectPaymentAndPerformAction, triggerRef};
    }
    if (
        opts.type === 'action' &&
        getDoesActionPaymentRequireUserInput(loggedInPlayer, opts.action)
    ) {
        return {collectPaymentAndPerformAction, triggerRef};
    }

    return {
        collectPaymentAndPerformAction: () =>
            onConfirmPayment({[Resource.MEGACREDIT]: cost}, []),
        triggerRef,
    };
}

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
                    <Button
                        disabled={currentQuantity === 0}
                        onClick={() => handleDecrease(resource)}
                    >
                        -
                    </Button>
                    <span>{currentQuantity}</span>
                    <Button
                        disabled={shouldDisableIncrease}
                        onClick={() => handleIncrease(resource)}
                    >
                        +
                    </Button>
                </div>
            </div>
        </PaymentPopoverRowBase>
    );
}

type PaymentOpts =
    // For playing a card. Accounts for:
    //   - discounts
    //   - metals/build tags/space tags
    //   - conditional payment
    | {
          type: 'card';
          card: Card;
      }
    // For playing an action. Accounts for:
    //   - `acceptedPayment`
    | {
          type: 'action';
          cost?: number;
          action: Action;
      };

// payment popover is used for cards, card actions, standard projects, milestones, and awards.
// either `card` or `cost` will always be defined in props. we need the full card in order to determine
// tag discounts and alternate payments (steel / titanium).
type PaymentPopoverProps = {
    onConfirmPayment: (
        payment: NumericPropertyCounter<Resource>,
        // conditionalPayments are for Dirigibles, Psychrophiles, etc.
        conditionalPayments?: Array<number> | null
    ) => void;
    opts: PaymentOpts;
};

export default function PaymentPopover(props: PaymentPopoverProps) {
    const player = useLoggedInPlayer();
    const actionGuard = useActionGuard();

    let cost;
    switch (props.opts.type) {
        case 'card':
            cost = getDiscountedCardCost(props.opts.card, player);
            break;
        case 'action':
            cost = props.opts.cost || 0;
            break;
        default:
            throw spawnExhaustiveSwitchError(props.opts);
    }

    const cardOrUndefined =
        props.opts.type === 'card' ? props.opts.card : undefined;
    const actionOrUndefined =
        props.opts.type === 'action' ? props.opts.action : undefined;
    const playerMoney = useTypedSelector(state => getMoney(state, player));
    const conditionalPayment = useTypedSelector(() =>
        getConditionalPaymentWithResourceInfo(player, cardOrUndefined)
    );
    const {resources} = player;
    const [numSteel, setNumSteel] = useState(0);
    const [numTitanium, setNumTitanium] = useState(0);
    const [numHeat, setNumHeat] = useState(0);
    const [numConditionalPayment, setNumConditionalPayment] = useState<
        number[]
    >(Array(conditionalPayment.length).fill(0));

    const numMC = Math.min(
        playerMoney,
        Math.max(0, cost - calculateRunningTotalWithoutMegacredits())
    );

    // Ensure the popover doesn't let you pay with resources you no longer have.
    useEffect(() => {
        handleDecrease(Resource.STEEL, numSteel - resources[Resource.STEEL]);
        handleDecrease(
            Resource.TITANIUM,
            numTitanium - resources[Resource.TITANIUM]
        );
        handleDecrease(Resource.HEAT, numHeat - resources[Resource.HEAT]);
        for (let i = 0; i < conditionalPayment.length; i++) {
            const payment = conditionalPayment[i];
            handleDecrease(
                payment.resourceType,
                numConditionalPayment[i] - payment.resourceAmount
            );
        }
    }, [
        resources[Resource.STEEL],
        resources[Resource.TITANIUM],
        resources[Resource.HEAT],
        ...conditionalPayment.map(payment => payment.resourceAmount),
    ]);

    const prevCost = usePrevious(cost);

    useEffect(() => {
        // If the action cost decreases (e.g. removing a picked card), reset the pickers so the player is not overpaying.
        if (cost < (prevCost ?? 0)) {
            handleDecrease(Resource.STEEL, numSteel);
            handleDecrease(Resource.TITANIUM, numTitanium);
            handleDecrease(Resource.HEAT, numHeat);
            for (let i = 0; i < conditionalPayment.length; i++) {
                const payment = conditionalPayment[i];
                handleDecrease(payment.resourceType, numConditionalPayment[i]);
            }
        }
    }, [cost, prevCost]);

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
                if (runningTotal >= cost && numMC === 0) return;
                if (numTitanium < resources[Resource.TITANIUM]) {
                    setNumTitanium(numTitanium + 1);
                }
                return;
            case Resource.STEEL:
                if (runningTotal >= cost && numMC === 0) return;
                if (numSteel < resources[Resource.STEEL]) {
                    setNumSteel(numSteel + 1);
                }
                return;
            case Resource.HEAT:
                if (runningTotal >= cost && numMC === 0) return;
                if (numHeat < resources[Resource.HEAT]) {
                    setNumHeat(numHeat + 1);
                }
                return;
            default:
                const index = conditionalPayment.findIndex(
                    payment => payment.resourceType === resource
                );
                if (runningTotal >= cost && numMC === 0) return;
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
            numSteel * actionGuard.getExchangeRate(Resource.STEEL) +
            numTitanium * actionGuard.getExchangeRate(Resource.TITANIUM) +
            numHeat * 1 +
            numConditionalPayment.reduce(
                (acc, quantity, index) =>
                    acc + quantity * conditionalPayment[index].rate,
                0
            )
        );
    }

    function calculateRunningTotalWithoutMegacredits() {
        return (
            numSteel * actionGuard.getExchangeRate(Resource.STEEL) +
            numTitanium * actionGuard.getExchangeRate(Resource.TITANIUM) +
            numHeat * 1 +
            numConditionalPayment.reduce(
                (acc, quantity, index) =>
                    acc + quantity * conditionalPayment[index].rate,
                0
            )
        );
    }

    const runningTotal = calculateRunningTotal();
    const isValidPayment = cost <= runningTotal;

    return (
        <PaymentPopoverBase className="payment-popover">
            <PaymentPopoverSummaryRow isValidPayment={isValidPayment}>
                <span>Cost: {cost}</span>
                <span className="running-total">
                    <em
                        style={{
                            color: isValidPayment
                                ? PLAYER_COLORS[1]
                                : PLAYER_COLORS[0],
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
                {(cardOrUndefined?.tags.includes(Tag.BUILDING) ||
                    actionOrUndefined?.acceptedPayment?.includes(
                        Resource.STEEL
                    )) &&
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
                {(cardOrUndefined?.tags.includes(Tag.SPACE) ||
                    actionOrUndefined?.acceptedPayment?.includes(
                        Resource.TITANIUM
                    )) &&
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
                {player.corporation.name === 'Helion' &&
                    resources[Resource.HEAT] > 0 && (
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
            <div
                style={{
                    marginTop: 16,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Button
                    disabled={!isValidPayment}
                    onClick={() => {
                        props.onConfirmPayment(
                            {
                                [Resource.MEGACREDIT]: numMC,
                                [Resource.STEEL]: numSteel,
                                [Resource.TITANIUM]: numTitanium,
                                [Resource.HEAT]: numHeat,
                            },
                            numConditionalPayment
                        );
                    }}
                >
                    Confirm
                </Button>
            </div>
        </PaymentPopoverBase>
    );
}
