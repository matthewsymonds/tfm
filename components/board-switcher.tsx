import {colors} from 'components/ui';
import {Deck} from 'constants/card-types';
import React, {useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {Board} from './board/board';
import {Box, Flex} from './box';

export enum BoardSwitcherOption {
    BOARD_SWITCHER_MARS = 'boardSwitcherMars',
    BOARD_SWITCHER_COLONIES = 'boardSwitcherColonies',
}

export const BOX_SHADOW_BASE = `0px 0px 5px 0px`;
export const BOX_SHADOW_COLONIES = `${BOX_SHADOW_BASE} #ccc`;
const BOX_SHADOW_MARS = `${BOX_SHADOW_BASE} ${colors.DARK_ORANGE}`;

export function BoardSwitcher() {
    const [option, setOption] = useState<BoardSwitcherOption>(
        BoardSwitcherOption.BOARD_SWITCHER_MARS
    );
    const gameName = useTypedSelector(state => state.name);

    // Reset board switcher on game change
    useEffect(() => {
        setOption(BoardSwitcherOption.BOARD_SWITCHER_MARS);
    }, [gameName]);

    const isColoniesEnabled = useTypedSelector(state => state?.options?.decks ?? []).includes(
        Deck.COLONIES
    );
    const switcher = isColoniesEnabled ? (
        <Flex
            className="display"
            color="#ccc"
            fontSize="14px"
            justifyContent="flex-end"
            alignItems="flex-end"
            marginLeft="auto"
            marginRight="auto"
            position="absolute"
            right="0"
            top="0"
            flexDirection="column"
            paddingRight="4px"
        >
            <Box
                cursor="pointer"
                padding="8px"
                marginRight="8px"
                background="#333"
                borderRadius="12px"
                boxShadow={
                    option === BoardSwitcherOption.BOARD_SWITCHER_MARS ? BOX_SHADOW_MARS : 'none'
                }
                onClick={() => setOption(BoardSwitcherOption.BOARD_SWITCHER_MARS)}
            >
                Mars
            </Box>
            <Box
                cursor="pointer"
                background="#333"
                padding="8px"
                marginRight="8px"
                marginTop="8px"
                borderRadius="12px"
                boxShadow={
                    option === BoardSwitcherOption.BOARD_SWITCHER_COLONIES
                        ? BOX_SHADOW_COLONIES
                        : 'none'
                }
                onClick={() => setOption(BoardSwitcherOption.BOARD_SWITCHER_COLONIES)}
            >
                Colonies
            </Box>
        </Flex>
    ) : null;
    return (
        <Box position="relative">
            {switcher}
            <Board option={option} />
        </Box>
    );
}
