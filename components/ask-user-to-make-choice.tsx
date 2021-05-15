import {Card as CardComponent, CardContext} from 'components/card/Card';
import {ReactNode} from 'react';
import {getCard} from 'selectors/get-card';
import {SerializedCard} from 'state-serialization';
import styled from 'styled-components';
import {Box, Flex} from './box';

export const ChoiceWrapper = styled.div`
    display: flex;
    overflow-y: hidden;
    width: 100%;
`;

export function AskUserToMakeChoice(props: {
    card?: SerializedCard;
    playedCard?: SerializedCard;
    children: ReactNode;
}) {
    const {children} = props;
    const card = props.card ? getCard(props.card) : undefined;
    const playedCard = props.playedCard ? getCard(props.playedCard) : undefined;
    let cardDetails;
    if (playedCard && card) {
        cardDetails = (
            <>
                <Box marginRight="32px">
                    <h3>You played</h3>
                    <CardComponent card={playedCard} cardContext={CardContext.DISPLAY_ONLY} />
                </Box>
                <Box marginRight="32px">
                    <h3>which triggered</h3>
                    <CardComponent card={card} cardContext={CardContext.DISPLAY_ONLY} />
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
        <Flex
            width="fit-content"
            marginTop="16px"
            flexWrap="wrap"
            justifyContent="space-around"
            overflowY="Auto"
        >
            {cardDetails}
            <Flex flexDirection="column" width="fit-content">
                <ChoiceWrapper>{children}</ChoiceWrapper>
            </Flex>
        </Flex>
    );
}
