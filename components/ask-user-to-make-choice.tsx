import styled from 'styled-components';
import {Card} from 'models/card';
import {Flex, Box} from './box';
import {CardComponent} from './card';
import {ReactNode} from 'react';

export const OptionsParent = styled.ul`
    padding-left: 2px;
    margin-top: 0px;
    li {
        list-style-type: none;
    }
`;

export function AskUserToMakeChoice(props: {card?: Card; playedCard?: Card; children: ReactNode}) {
    const {card, playedCard, children} = props;
    let cardDetails;
    if (playedCard && card) {
        cardDetails = (
            <>
                <Box marginRight="32px">
                    <h3>You played</h3>
                    <CardComponent width={220} content={playedCard} />
                </Box>
                <Box marginRight="32px">
                    <h3>which triggered</h3>
                    <CardComponent width={220} content={card} />
                </Box>
            </>
        );
    } else if (card) {
        cardDetails = (
            <Box marginRight="32px">
                <h3>You played</h3>
                <CardComponent width={220} content={card} />
            </Box>
        );
    } else {
        cardDetails = null;
    }
    return (
        <Flex width="100%" flexWrap="wrap" justifyContent="space-around" maxWidth="800px">
            {cardDetails}

            <OptionsParent>
                <h3>Please confirm your choice:</h3>
                {children}
            </OptionsParent>
        </Flex>
    );
}
