import {Box, Flex} from 'components/box';
import {BaseActionIconography} from 'components/card/CardIconography';
import {ColonyComponent} from 'components/colony';
import {AcceptedTradePayment, Colony, getColony} from 'constants/colonies';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getValidTradePayment} from 'selectors/valid-trade-payment';
import {BOX_SHADOW_BASE} from './board-switcher';

export function Colonies() {
    const colonies = useTypedSelector(state => state.common.colonies?.map(getColony));

    const [selectedColonies, setSelectedColonies] = useState<boolean[]>([true]);

    if (!colonies) {
        return null;
    }

    const switcherOptions = colonies.map((colony, index) => {
        return (
            <Box
                cursor="pointer"
                key={colony.name}
                padding="8px"
                marginRight="8px"
                marginBottom="4px"
                marginTop="4px"
                background="#333"
                borderRadius="12px"
                boxShadow={
                    selectedColonies[index] ? `${BOX_SHADOW_BASE} ${colony.planetColor}` : 'none'
                }
                onClick={event => {
                    const newSelectedColonies = event.shiftKey ? [...selectedColonies] : [];
                    newSelectedColonies[index] = !newSelectedColonies[index];
                    // ensure at least one colony selected.
                    if (newSelectedColonies.every(selected => !selected)) return;

                    setSelectedColonies(newSelectedColonies);
                }}
            >
                {colony.name}
            </Box>
        );
    });

    const loggedInPlayer = useLoggedInPlayer();
    const apiClient = useApiClient();

    const tradePayment = getValidTradePayment(loggedInPlayer);

    function tradeWithPayment(payment: AcceptedTradePayment, colony: Colony) {
        apiClient.tradeAsync({
            payment: payment.resource,
            colony: colony.name,
        });
    }

    const tradePaymentElements = tradePayment.map(payment => {
        return (
            <Box
                cursor="pointer"
                color="#333"
                marginRight="4px"
                onClick={() => {
                    const firstSelectedColony = selectedColonies.findIndex(a => a);
                    tradeWithPayment(payment, colonies[firstSelectedColony]);
                }}
            >
                <BaseActionIconography
                    card={{gainResource: {[payment.resource]: payment.quantity}}}
                />
            </Box>
        );
    });

    const onlyOneColonySelected = selectedColonies.filter(Boolean).length === 1;

    return (
        <Flex
            overflow="auto"
            flexDirection="column"
            height="525px"
            marginRight="8px"
            marginLeft="8px"
            width="450px"
            alignItems="center"
        >
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
                {switcherOptions}
            </Flex>
            {colonies
                .filter((colony, index) => selectedColonies[index])
                .map(colony => {
                    if (tradePaymentElements.length > 0 && onlyOneColonySelected)
                        return (
                            <Box>
                                <ColonyComponent colony={colony} key={colony.name} />
                                {tradePaymentElements.length > 0 && onlyOneColonySelected ? (
                                    <Flex color="#ccc" marginTop="8px" alignItems="center">
                                        <Box marginRight="4px">Trade with {colony.name}:</Box>
                                        {tradePaymentElements}
                                    </Flex>
                                ) : null}
                            </Box>
                        );
                })}
        </Flex>
    );
}
