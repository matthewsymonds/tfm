import {Box, Flex} from 'components/box';
import {BaseActionIconography} from 'components/card/CardIconography';
import {ColonyComponent} from 'components/colony';
import {AcceptedTradePayment, getColony, SerializedColony} from 'constants/colonies';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useHover} from 'react-laag';
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
    colonies: SerializedColony[];
    setSelectedColonies: Dispatch<SetStateAction<boolean[]>>;
    selectedColonies: boolean[];
    allowMulti?: boolean;
}) {
    return null;
    // return (
    //     <>
    //         <ColonyPicker {...{colonies, setSelectedColonies, selectedColonies, allowMulti}} />
    //         <FilteredColonies colonies={colonies} selectedColonies={selectedColonies} />
    //     </>
    // );
}

// function ColonyPicker({
//     colonies,
//     setSelectedColonies,
//     selectedColonies,
//     allowMulti,
// }: {
//     colonies: SerializedColony[];
//     setSelectedColonies: Dispatch<SetStateAction<boolean[]>>;
//     selectedColonies: boolean[];
//     allowMulti?: boolean;
// }) {
//     return (
//         <Flex
//             className="display"
//             color="#ccc"
//             flexWrap="wrap"
//             marginBottom="8px"
//             marginLeft="4px"
//             marginRight="4px"
//             style={{userSelect: 'none'}}
//         >
//             {colonies.map((colony, index) => {
//                 const {planetColor} = getColony(colony);

//                 return (
//                     <Box
//                         cursor={!allowMulti && selectedColonies[index] ? 'auto' : 'pointer'}
//                         key={colony.name}
//                         padding="8px"
//                         marginRight="8px"
//                         marginBottom="4px"
//                         marginTop="4px"
//                         background="#333"
//                         borderRadius="12px"
//                         boxShadow={
//                             selectedColonies[index] ? `${BOX_SHADOW_BASE} ${planetColor}` : 'none'
//                         }
//                         onClick={event => {
//                             const newSelectedColonies =
//                                 event.shiftKey && allowMulti ? [...selectedColonies] : [];
//                             newSelectedColonies[index] = !newSelectedColonies[index];
//                             // ensure at least one colony selected.
//                             if (newSelectedColonies.every(selected => !selected)) return;

//                             setSelectedColonies(newSelectedColonies);
//                         }}
//                     >
//                         {colony.name}
//                     </Box>
//                 );
//             })}
//         </Flex>
//     );
// }

export function Colonies() {
    const colonies = useTypedSelector(state => state.common.colonies ?? []);
    const loggedInPlayer = useLoggedInPlayer();
    const [selectedPayment, setSelectedPayment] = useState(Resource.MEGACREDIT);

    const validTradePayments = getValidTradePayment(loggedInPlayer);
    useEffect(() => {
        // if user can no longer use the selected payment, pick a different one (if possible)
        if (
            validTradePayments.every(payment => payment.resource !== selectedPayment) &&
            validTradePayments.length > 0
        ) {
            setSelectedPayment(validTradePayments[0].resource);
        }
    }, [validTradePayments.length, validTradePayments?.[0], selectedPayment]);

    if (!colonies[0]) {
        return null;
    }

    // function tradeWithPayment(
    //     payment: AcceptedTradePayment,
    //     colony: SerializedColony,
    //     tradeIncome: number
    // ) {
    //     apiClient.tradeAsync({
    //         payment: payment.resource,
    //         colony: colony.name,
    //         tradeIncome,
    //     });
    // }

    // function tradeForFree(colony: SerializedColony, tradeIncome: number) {
    //     apiClient.tradeForFreeAsync({
    //         colony: colony.name,
    //         tradeIncome,
    //     });
    // }

    // const [canTrade, canTradeReason] =
    //     validTradePayments.length === 0
    //         ? [false, 'No valid payment']
    //         : actionGuard.canTradeWithPayment(selectedPayment, firstSelectedColony.name);

    // const tradePaymentElements = validTradePayments.map(payment => {
    //     const selected = payment.resource === selectedPayment;
    //     const border = `1px solid ${selected ? '#ccc' : 'transparent'}`;

    //     return (
    //         <div
    //             onClick={() => {
    //                 setSelectedPayment(payment.resource);
    //             }}
    //             key={payment.resource}
    //         >
    //             {
    //                 <Box
    //                     cursor={canTrade && !selected ? 'pointer' : 'auto'}
    //                     color="#333"
    //                     marginRight="4px"
    //                     padding="1px"
    //                     border={border}
    //                 >
    //                     <BaseActionIconography
    //                         card={{gainResource: {[payment.resource]: payment.quantity}}}
    //                     />
    //                 </Box>
    //             }
    //         </div>
    //     );
    // });

    // const eligibleTradeIncomes = getEligibleTradeIncomes(firstSelectedColony, loggedInPlayer);

    // const [selectedTradeIncome, setSelectedTradeIncome] = useState(firstSelectedColony.step);
    // useEffect(() => {
    //     setSelectedTradeIncome(firstSelectedColony.step);
    // }, [firstSelectedColony.step, firstSelectedColony.name]);

    // const firstColony = getColony(firstSelectedColony);
    // const tradeIncomeElements = eligibleTradeIncomes.map((index, internalIndex) => {
    //     const tradeIncome = firstColony.tradeIncome[index];
    //     if (!tradeIncome) return null;
    //     const nextTradeIncome = firstColony.tradeIncome[eligibleTradeIncomes[internalIndex + 1]];
    //     // Filter duplicate options.
    //     if (nextTradeIncome && JSON.stringify(tradeIncome) === JSON.stringify(nextTradeIncome)) {
    //         return null;
    //     }

    //     const onClick = () => {
    //         setSelectedTradeIncome(index);
    //     };

    //     const selected = index === selectedTradeIncome;

    //     const border = `1px solid ${selected ? '#ccc' : 'transparent'}`;

    //     return (
    //         <Box
    //             key={index + '-' + firstSelectedColony.name}
    //             padding="2px"
    //             color={
    //                 tradeIncome.gainResource?.[Resource.MEGACREDIT] ||
    //                 tradeIncome.increaseProduction?.[Resource.MEGACREDIT]
    //                     ? '#333'
    //                     : '#ccc'
    //             }
    //             cursor={canTrade && !selected ? 'pointer' : 'auto'}
    //             onClick={onClick}
    //             border={border}
    //         >
    //             <BaseActionIconography
    //                 card={tradeIncome}
    //                 reverse
    //                 shouldShowPlus={!!tradeIncome.removeResource}
    //             />
    //         </Box>
    //     );
    // });

    // const onlyOneColonySelected = selectedColonies.filter(Boolean).length === 1;

    // const hasResources = tradePaymentElements.length > 0;

    // const [canBuild, canBuildReason] = canPlaceColony(
    //     firstSelectedColony,
    //     loggedInPlayer.index,
    //     loggedInPlayer.placeColony
    // );

    // const [canTradeForFree, canTradeForFreeReason] = actionGuard.canTradeForFree(
    //     firstSelectedColony.name
    // );

    // const payment = validTradePayments.find(payment => payment.resource === selectedPayment);

    // let onClick = () => {
    //     const tradeIncome = selectedTradeIncome;
    //     if (payment) {
    //         tradeWithPayment(payment, firstSelectedColony, tradeIncome);
    //     }
    // };

    // let tradeButton = () => (
    //     <button
    //         style={{
    //             marginTop: 'auto',
    //             marginBottom: 'auto',
    //             marginLeft: '4px',
    //         }}
    //         onClick={onClick}
    //     >
    //         Confirm
    //     </button>
    // );

    return (
        <Flex
            overflow="auto"
            flexDirection="column"
            height="525px"
            maxWidth="100%"
            alignItems="center"
        >
            {colonies.map(colony => (
                <ColonyComponent colony={colony} />
            ))}
            {/*                 
                
                <Box width="fit-content" display="table">
                    {colonyTiles}
                    {!onlyOneColonySelected ? null : loggedInPlayer.tradeForFree ? (
                        canTradeForFree ? (
                            <Box
                                color="#ccc"
                                marginTop="8px"
                                display="table-caption"
                                style={{captionSide: 'bottom'}}
                            >
                                <Flex alignItems="center">
                                    <Box marginRight="4px">
                                        Trade with {firstSelectedColony.name}:
                                    </Box>
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
                                            const tradeIncome = selectedTradeIncome;
                                            tradeForFree(firstSelectedColony, tradeIncome);
                                        }}
                                    >
                                        Confirm
                                    </button>
                                </Flex>
                            </Box>
                        ) : (
                            <Box
                                color="#ccc"
                                display="table-caption"
                                style={{captionSide: 'bottom'}}
                            >
                                <em>{canTradeForFreeReason}</em>
                            </Box>
                        )
                    ) : loggedInPlayer.placeColony ? (
                        canBuild ? (
                            <Box
                                marginTop="8px"
                                display="table-caption"
                                style={{captionSide: 'bottom'}}
                            >
                                <button
                                    onClick={() => {
                                        apiClient.completePlaceColonyAsync({
                                            colony: firstSelectedColony.name,
                                        });
                                    }}
                                    style={{
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                        display: 'block',
                                    }}
                                >
                                    Build colony
                                </button>
                            </Box>
                        ) : (
                            <Box
                                color="#ccc"
                                display="table-caption"
                                style={{captionSide: 'bottom'}}
                            >
                                <em>{canBuildReason}</em>
                            </Box>
                        )
                    ) : hasResources && canTrade ? (
                        <Box
                            color="#ccc"
                            marginTop="8px"
                            width="100%"
                            display="table-caption"
                            style={{captionSide: 'bottom'}}
                        >
                            <Flex alignItems="center">
                                <Box marginRight="4px" flexShrink="0">
                                    Trade with {firstSelectedColony.name}:
                                </Box>
                                {tradePaymentElements}
                            </Flex>
                            <Flex alignItems="center">
                                <Box margin="4px">For:</Box>
                                {tradeIncomeElements}
                                {tradeButton()}
                            </Flex>
                        </Box>
                    ) : (
                        <Box color="#ccc" marginTop="8px" lineHeight="30px">
                            <em>{canTradeReason}</em>
                        </Box>
                    )}
                </Box>
            </Flex> */}
        </Flex>
    );
}
