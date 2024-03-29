import {ReactNode} from 'react';
import {getCard} from 'selectors/get-card';
import {SerializedCard} from 'state-serialization';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {CardTextToken} from './card/CardToken';
import {colors} from './ui';

export const ChoiceWrapper = styled.div<{
    orientation: 'horizontal' | 'vertical';
}>`
    display: flex;
    width: 100%;
    flex-direction: ${props =>
        props.orientation === 'horizontal' ? 'row' : 'column'};
    flex-wrap: wrap;
`;

export function AskUserToMakeChoice(props: {
    card?: SerializedCard;
    playedCard?: SerializedCard;
    children: ReactNode;
    orientation?: 'horizontal' | 'vertical';
}) {
    const {children, orientation = 'vertical'} = props;
    const card = props.card ? getCard(props.card) : undefined;
    const playedCard = props.playedCard ? getCard(props.playedCard) : undefined;
    let triggerDetails;
    if (playedCard && card) {
        triggerDetails = (
            <Box marginBottom="8px" display="flex" alignItems="center">
                <span>You played</span>
                <CardTextToken
                    card={playedCard}
                    showCardOnHover={true}
                    absoluteOffset={-68}
                />
                <span>which triggered</span>
                <CardTextToken card={card} showCardOnHover={true} />
            </Box>
        );
    } else if (card) {
        triggerDetails = (
            <Box marginBottom="8px" display="flex" alignItems="center">
                <span>You played</span>
                <CardTextToken
                    card={card}
                    showCardOnHover={true}
                    absoluteOffset={-68}
                />
            </Box>
        );
    } else {
        triggerDetails = null;
    }
    return (
        <Flex
            width="100%"
            flexDirection="column"
            style={{color: colors.TEXT_LIGHT_1}}
        >
            {triggerDetails}
            <ChoiceWrapper orientation={orientation}>{children}</ChoiceWrapper>
        </Flex>
    );
}
