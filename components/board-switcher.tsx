import {colors} from 'components/ui';
import {Deck} from 'constants/card-types';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {Board} from './board/board';
import {Box, Flex} from './box';

export enum DisplayBoard {
    MARS = 'mars',
    COLONIES = 'colonies',
}

export const BOX_SHADOW_BASE = `0px 0px 5px 0px`;
export const BOX_SHADOW_COLONIES = `${BOX_SHADOW_BASE} #ccc`;
const BOX_SHADOW_MARS = `${BOX_SHADOW_BASE} ${colors.DARK_ORANGE}`;

export function BoardSwitcher({
    selectedBoard,
    setDisplayBoard,
}: {
    selectedBoard: DisplayBoard;
    setDisplayBoard: (displayBoard: DisplayBoard) => void;
}) {
    const gameName = useTypedSelector(state => state.name);

    // Reset board switcher on game change
    useEffect(() => {
        setDisplayBoard(DisplayBoard.MARS);
    }, [gameName]);

    const player = useLoggedInPlayer();

    useEffect(() => {
        if (player.placeColony || player.tradeForFree) {
            setDisplayBoard(DisplayBoard.COLONIES);
        } else if (player.pendingTilePlacement) {
            setDisplayBoard(DisplayBoard.MARS);
        }
    }, [player.placeColony, player.pendingTilePlacement, player.tradeForFree]);

    const isColoniesEnabled = useTypedSelector(state => state.options?.decks ?? []).includes(
        Deck.COLONIES
    );
    if (!isColoniesEnabled) {
        return null;
    }
    return (
        <Flex
            className="display"
            color="#ccc"
            fontSize="14px"
            justifyContent="flex-end"
            alignItems="flex-end"
            flexDirection="column"
            marginBottom="8px"
        >
            <Box
                cursor="pointer"
                padding="8px"
                background="#333"
                borderRadius="4px"
                boxShadow={selectedBoard === DisplayBoard.MARS ? BOX_SHADOW_MARS : 'none'}
                onClick={() => setDisplayBoard(DisplayBoard.MARS)}
            >
                Mars
            </Box>
            <Box
                cursor="pointer"
                background="#333"
                padding="8px"
                marginTop="8px"
                borderRadius="4px"
                boxShadow={selectedBoard === DisplayBoard.COLONIES ? BOX_SHADOW_COLONIES : 'none'}
                onClick={() => setDisplayBoard(DisplayBoard.COLONIES)}
            >
                Colonies
            </Box>
        </Flex>
    );
}
