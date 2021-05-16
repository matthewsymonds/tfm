import {Card as CardComponent, CardContext} from 'components/card/Card';
import {ReactNode} from 'react';
import {getCard} from 'selectors/get-card';
import {SerializedCard} from 'state-serialization';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {CardToken} from './card/CardToken';
import {colors} from './ui';

export const ChoiceWrapper = styled.div`
    display: flex;
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
    let triggerDetails;
    if (playedCard && card) {
        triggerDetails = (
            <Box margin="0 8px 8px 8px" display="flex" alignItems="center">
                <span>You played</span>
                <CardToken card={playedCard} />
                <span>which triggered</span>
                <CardToken card={card} />
            </Box>
        );
    } else if (card) {
        triggerDetails = (
            <Box marginBottom="0 8px 8px 8px" display="flex" alignItems="center">
                <h3>You played</h3>
                <CardToken card={card} />
            </Box>
        );
    } else {
        triggerDetails = null;
    }
    return (
        <Flex width="100%" flexDirection="column" style={{color: colors.TEXT_LIGHT_1}}>
            {triggerDetails}
            <ChoiceWrapper>{children}</ChoiceWrapper>
        </Flex>
    );
}
