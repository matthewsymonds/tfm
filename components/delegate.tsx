import {PLAYER_COLORS} from 'constants/game';
import {Delegate} from 'constants/turmoil';
import React from 'react';
import {Flex} from './box';

export function DelegateComponent({delegate, isLeader}: {delegate: Delegate; isLeader: boolean}) {
    return (
        <Flex
            borderRadius="50%"
            borderWidth="3px"
            marginRight="2px"
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
            👤
        </Flex>
    );
}
