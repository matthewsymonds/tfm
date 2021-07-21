import {Box, Flex} from 'components/box';
import {BaseActionIconography} from 'components/card/CardIconography';
import {ColonyComponent} from 'components/colony';
import {AcceptedTradePayment, Colony, getColony} from 'constants/colonies';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {canPlaceColony} from 'selectors/can-build-colony';
import {getEligibleTradeIncomes} from 'selectors/get-eligible-trade-incomes';
import {getValidTradePayment} from 'selectors/valid-trade-payment';
import {BOX_SHADOW_BASE} from './board-switcher';

export function ColonySwitcher({
    colonies,
    setSelectedColonies,
    selectedColonies,
    allowMulti,
}: {
    colonies: Colony[];
    setSelectedColonies: Dispatch<SetStateAction<boolean[]>>;
    selectedColonies: boolean[];
    allowMulti?: boolean;
}) {
    return (
        <>
            <Flex
                className="display"
                color="#ccc"
                flexWrap="wrap"
                marginBottom="8px"
                marginLeft="4px"
                marginRight="4px"
                marginTop="16px"
                style={{userSelect: 'none'}}
            >
                {colonies.map((colony, index) => {
                    return (
                        <Box
                            cursor={!allowMulti && selectedColonies[index] ? 'auto' : 'pointer'}
                            key={colony.name}
                            padding="8px"
                            marginRight="8px"
                            marginBottom="4px"
                            marginTop="4px"
                            background="#333"
                            borderRadius="12px"
                            boxShadow={
                                selectedColonies[index]
                                    ? `${BOX_SHADOW_BASE} ${colony.planetColor}`
                                    : 'none'
                            }
                            onClick={event => {
                                const newSelectedColonies =
                                    event.shiftKey && allowMulti ? [...selectedColonies] : [];
                                newSelectedColonies[index] = !newSelectedColonies[index];
                                // ensure at least one colony selected.
                                if (newSelectedColonies.every(selected => !selected)) return;

                                setSelectedColonies(newSelectedColonies);
                            }}
                        >
                            {colony.name}
                        </Box>
                    );
                })}
            </Flex>
            {colonies
                .filter((_, index) => selectedColonies[index])
                .map(colony => {
                    return (
                        <Box key={colony.name}>
                            <ColonyComponent colony={colony} />
                        </Box>
                    );
                })}
        </>
    );
}

export function Colonies() {
    const colonies = useTypedSelector(state => state.common.colonies?.map(getColony));

    const [selectedColonies, setSelectedColonies] = useState<boolean[]>([true]);

    if (!colonies) {
        return null;
    }

    const switcherOptions = (
        <ColonySwitcher allowMulti {...{selectedColonies, setSelectedColonies, colonies}} />
    );

    const loggedInPlayer = useLoggedInPlayer();
    const apiClient = useApiClient();

    const tradePayment = getValidTradePayment(loggedInPlayer);
    const actionGuard = useActionGuard(loggedInPlayer.username);

    function tradeWithPayment(payment: AcceptedTradePayment, colony: Colony, tradeIncome: number) {
        apiClient.tradeAsync({
            payment: payment.resource,
            colony: colony.name,
            tradeIncome,
        });
    }

    const firstSelectedColony = colonies[selectedColonies.indexOf(true)];

    const [canTrade, canTradeReason] =
        tradePayment.length === 0
            ? [false, 'No valid payment']
            : actionGuard.canTrade(tradePayment[0].resource, firstSelectedColony.name);

    const [selectedPayment, setSelectedPayment] = useState(tradePayment[0].resource);

    const tradePaymentElements = tradePayment.map(payment => {
        const selected = payment.resource === selectedPayment;
        const border = `1px solid ${selected ? '#ccc' : 'transparent'}`;

        return (
            <Box
                cursor={canTrade && !selected ? 'pointer' : 'auto'}
                color="#333"
                marginRight="4px"
                padding="1px"
                border={border}
                key={payment.resource}
                onClick={() => {
                    setSelectedPayment(payment.resource);
                }}
            >
                <BaseActionIconography
                    card={{gainResource: {[payment.resource]: payment.quantity}}}
                />
            </Box>
        );
    });

    const eligibleTradeIncomes = getEligibleTradeIncomes(firstSelectedColony, loggedInPlayer);

    const [selectedTradeIncome, setSelectedTradeIncome] = useState(firstSelectedColony.step);
    useEffect(() => {
        setSelectedTradeIncome(firstSelectedColony.step);
    }, [firstSelectedColony.step]);

    useEffect(() => {
        setSelectedTradeIncome(firstSelectedColony.step);
    }, [firstSelectedColony.name]);

    const tradeIncomeElements = eligibleTradeIncomes.map(index => {
        const tradeIncome = firstSelectedColony.tradeIncome[index];
        const onClick = () => {
            setSelectedTradeIncome(index);
        };

        const selected = index === selectedTradeIncome;

        const border = `1px solid ${selected ? '#333' : 'transparent'}`;

        return (
            <Box
                key={index + '-' + firstSelectedColony.name}
                padding="1px"
                color="#333"
                cursor={canTrade && !selected ? 'pointer' : 'auto'}
                onClick={onClick}
                border={border}
            >
                <BaseActionIconography card={tradeIncome} inline reverse shouldShowPlus />
            </Box>
        );
    });

    const onlyOneColonySelected = selectedColonies.filter(Boolean).length === 1;

    const hasResourcesAndOneColonySelected =
        tradePaymentElements.length > 0 && onlyOneColonySelected;

    const [canBuild, canBuildReason] = canPlaceColony(firstSelectedColony, loggedInPlayer);

    return (
        <Flex
            overflow="auto"
            flexDirection="column"
            height="525px"
            width="450px"
            alignItems="center"
        >
            <Box marginRight="8px" marginLeft="8px">
                {switcherOptions}
                {onlyOneColonySelected && loggedInPlayer.placeColony ? (
                    canBuild ? (
                        <button
                            onClick={() => {
                                apiClient.completePlaceColonyAsync({
                                    colony: firstSelectedColony.name,
                                });
                            }}
                        >
                            Build colony
                        </button>
                    ) : (
                        <div>Cannot build colony here: {canBuildReason}</div>
                    )
                ) : null}
                {hasResourcesAndOneColonySelected && canTrade ? (
                    <Box color="#ccc" marginTop="8px">
                        <Flex alignItems="center">
                            <Box marginRight="4px">Trade with {firstSelectedColony.name}:</Box>{' '}
                            {tradePaymentElements}
                        </Flex>
                        <Flex alignItems="center">
                            <Box margin="4px">For:</Box>
                            {tradeIncomeElements}
                            <button
                                style={{
                                    marginTop: 'auto',
                                    marginBottom: 'auto',
                                    marginLeft: '4px',
                                }}
                                onClick={() => {
                                    const payment = tradePayment.find(
                                        payment => payment.resource === selectedPayment
                                    );
                                    const tradeIncome = selectedTradeIncome;
                                    if (payment) {
                                        tradeWithPayment(payment, firstSelectedColony, tradeIncome);
                                    }
                                }}
                            >
                                Confirm
                            </button>
                        </Flex>
                    </Box>
                ) : onlyOneColonySelected ? (
                    <Box color="#ccc">
                        <em>{canTradeReason}</em>
                    </Box>
                ) : null}
            </Box>
        </Flex>
    );
}
