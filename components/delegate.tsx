import {PLAYER_COLORS} from 'constants/game';
import {Delegate} from 'constants/turmoil';
import React from 'react';
import Twemoji from 'react-twemoji';
import styled from 'styled-components';
import {Box, Flex} from './box';

const DelegateBase = styled(Flex)`
    &:hover {
        box-shadow: none;
    }
`;

export function DelegateComponent({
    delegate,
    isLeader,
    canClick,
    onClick,
}: {
    delegate: Delegate;
    isLeader: boolean;
    canClick?: boolean;
    onClick?: Function;
}) {
    return (
        <DelegateBase
            onClick={onClick}
            borderRadius="50%"
            boxShadow={canClick ? '0px 0px 38px 5px #000000' : 'none'}
            cursor={canClick ? 'pointer' : 'auto'}
            borderWidth="3px"
            width="12px"
            height="12px"
            lineHeight="16px"
            fontSize="20px"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderColor={isLeader ? 'darkgray' : '#d7d7d7'}
            borderStyle="solid"
            padding="8px"
            background={
                delegate?.playerIndex !== undefined
                    ? PLAYER_COLORS[delegate.playerIndex]
                    : 'transparent'
            }
        >
            <Box filter="grayscale(100%) brightness(50%)">
                <Twemoji options={{className: 'emoji delegate'}}>👤</Twemoji>
            </Box>
        </DelegateBase>
    );
}

export function MiniDelegateComponent() {
    return (
        <Box
            width="12px"
            height="12px"
            lineHeight="16px"
            fontSize="20px"
            filter="grayscale(100%) brightness(50%)"
        >
            <Twemoji options={{className: 'emoji delegate'}}>👤</Twemoji>
        </Box>
    );
}
