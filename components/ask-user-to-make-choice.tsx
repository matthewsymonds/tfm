import styled from 'styled-components';
import {Card} from 'models/card';
import {Flex, Box} from './box';
import {CardComponent} from './card';
import {ReactNode} from 'react';

export const OptionsParent = styled.div`
    padding-left: 2px;
    margin-top: 8px;
    max-height: 400px;
    overflow-y: auto;
`;

export function AskUserToMakeChoice(props: {card?: Card; playedCard?: Card; children: ReactNode}) {
    const {card, playedCard, children} = props;
    let cardDetails;
    if (playedCard && card) {
        cardDetails = (
            <>
                <Box marginRight="32px">
                    <h3>You played</h3>
                    <CardComponent content={playedCard} />
                </Box>
                <Box marginRight="32px">
                    <h3>which triggered</h3>
                    <CardComponent content={card} />
                </Box>
            </>
        );
    } else if (card) {
        cardDetails = (
            <Box marginRight="32px">
                <h3>You played</h3>
                <CardComponent content={card} />
            </Box>
        );
    } else {
        cardDetails = null;
    }
    return (
        <Flex width="100%" flexWrap="wrap" justifyContent="space-around" maxWidth="800px">
            {cardDetails}
            <div>
                <h3>Please confirm your choice:</h3>
                <OptionsParent>{children}</OptionsParent>
            </div>
        </Flex>
    );
}
