import styled from 'styled-components';
import {Card} from 'models/card';
import {Flex, Box} from './box';
import {CardComponent} from './card';
import {ReactChildren, ReactNode} from 'react';

export const OptionsParent = styled.ul`
    padding-left: 2px;
    margin-top: 0px;
    li {
        list-style-type: none;
    }
`;

export function AskUserToMakeChoice(props: {card: Card; children: ReactNode}) {
    const {card, children} = props;
    return (
        <Flex width="100%" justifyContent="space-around" maxWidth="800px">
            <Box marginRight="32px">
                <h3>You played</h3>
                <CardComponent width={250} content={card} />
            </Box>

            <OptionsParent>
                <h3>Please confirm your choice:</h3>
                {children}
            </OptionsParent>
        </Flex>
    );
}
