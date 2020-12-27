import {Card as CardComponent} from 'components/card/Card';
import {Card} from 'models/card';
import {ReactNode} from 'react';
import styled from 'styled-components';
import {Box, Flex} from './box';

export const OptionsParent = styled.div`
    overflow-y: hidden;
`;

export function AskUserToMakeChoice(props: {card?: Card; playedCard?: Card; children: ReactNode}) {
    const {card, playedCard, children} = props;
    let cardDetails;
    if (playedCard && card) {
        cardDetails = (
            <>
                <Box marginRight="32px">
                    <h3>You played</h3>
                    <CardComponent card={playedCard} />
                </Box>
                <Box marginRight="32px">
                    <h3>which triggered</h3>
                    <CardComponent card={card} />
                </Box>
            </>
        );
    } else if (card) {
        cardDetails = (
            <Box marginRight="32px">
                <h3>You played</h3>
                <CardComponent card={card} />
            </Box>
        );
    } else {
        cardDetails = null;
    }
    return (
        <Flex width="100%" marginTop="16px" flexWrap="wrap" justifyContent="space-around">
            {cardDetails}
            <Flex flexDirection="column">
                <OptionsParent>{children}</OptionsParent>
            </Flex>
        </Flex>
    );
}
