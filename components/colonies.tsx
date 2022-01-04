import {Flex} from 'components/box';
import {ColonyComponent} from 'components/colony';
import {SerializedColony} from 'constants/colonies';
import {Resource} from 'constants/resource-enum';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getValidTradePayment} from 'selectors/valid-trade-payment';

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

    return (
        <Flex flexWrap="wrap" maxWidth="100%" alignItems="center">
            {colonies.map(colony => (
                <ColonyComponent colony={colony} key={colony.name} />
            ))}
        </Flex>
    );
}
