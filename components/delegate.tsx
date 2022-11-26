import {PLAYER_COLORS} from 'constants/game';
import {Delegate} from 'constants/turmoil';
import React from 'react';
import Twemoji from 'react-twemoji';
import {Box, Flex} from './box';
import {colors} from './ui';

export function DelegateComponent({
    delegate,
    size = 16,
    canClick,
    onClick,
    margin,
}: {
    delegate: Delegate;
    size?: number;
    canClick?: boolean;
    onClick?: Function;
    margin?: string;
}) {
    return (
        <Flex
            onClick={onClick}
            borderRadius="50%"
            height={`${size}px`}
            width={`${size}px`}
            margin={margin}
            fontSize={`${size - 2}px`}
            cursor={canClick ? 'pointer' : 'auto'}
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            border={`1px solid ${colors.DARK_2}`}
            background={
                typeof delegate?.playerIndex === 'number'
                    ? PLAYER_COLORS[delegate.playerIndex]
                    : colors.LIGHT_2
            }
        >
            <Box filter="grayscale(100%) brightness(50%)">
                <Twemoji options={{className: 'emoji delegate'}}>👤</Twemoji>
            </Box>
        </Flex>
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
