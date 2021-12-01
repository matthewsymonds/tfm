import {colors} from 'components/ui';
import {Deck} from 'constants/card-types';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useEffect} from 'react';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Box} from './box';

export enum DisplayBoard {
    MARS = 'mars',
    COLONIES = 'colonies',
    TURMOIL = 'turmoil',
}

export const BOX_SHADOW_BASE = `0px 0px 5px 0px`;
export const BOX_SHADOW_COLONIES = `${BOX_SHADOW_BASE} #ccc`;
export const BOX_SHADOW_TURMOIL = `${BOX_SHADOW_BASE} gold`;

const BOX_SHADOW_MARS = `${BOX_SHADOW_BASE} ${colors.DARK_ORANGE}`;

const BoardSwitcherOuter = styled.div`
    color: #ccc;
    display: flex;
    font-size: 14px;
    justify-content: flex-end;
    align-items: flex-end;
    flex-direction: column;
    margin-bottom: 16px;
    .item {
        cursor: pointer;
        background: #333;
        padding: 8px;

        &:nth-child(2),
        &:nth-child(3) {
            margin-top: 8px;
            @media (max-width: 895px) {
                margin-top: 0px;
                margin-left: 8px;
            }
        }
    }
    @media (max-width: 895px) {
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-top: 8px;
    }
`;

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
        } else if (player.pendingTilePlacement || player.pendingTileRemoval) {
            setDisplayBoard(DisplayBoard.MARS);
        } else if (
            player.placeDelegatesInOneParty ||
            player.removeNonLeaderDelegate ||
            player.exchangeNeutralNonLeaderDelegate
        ) {
            setDisplayBoard(DisplayBoard.TURMOIL);
        }
    }, [
        player.placeColony,
        player.pendingTilePlacement,
        player.pendingTileRemoval,
        player.tradeForFree,
        player.placeDelegatesInOneParty,
        player.removeNonLeaderDelegate,
        player.exchangeNeutralNonLeaderDelegate,
    ]);

    const isColoniesEnabled = useTypedSelector(state => state.options?.decks ?? []).includes(
        Deck.COLONIES
    );
    const isTurmoilEnabled = useTypedSelector(state => state?.options?.decks ?? []).includes(
        Deck.TURMOIL
    );
    if (!isColoniesEnabled && !isTurmoilEnabled) {
        return null;
    }
    return (
        <BoardSwitcherOuter>
            <Box
                className="item display"
                borderRadius="4px"
                boxShadow={selectedBoard === DisplayBoard.MARS ? BOX_SHADOW_MARS : 'none'}
                onClick={() => setDisplayBoard(DisplayBoard.MARS)}
            >
                Mars
            </Box>
            {isColoniesEnabled ? (
                <Box
                    className="item display"
                    borderRadius="4px"
                    boxShadow={
                        selectedBoard === DisplayBoard.COLONIES ? BOX_SHADOW_COLONIES : 'none'
                    }
                    onClick={() => setDisplayBoard(DisplayBoard.COLONIES)}
                >
                    Colonies
                </Box>
            ) : null}
            {isTurmoilEnabled ? (
                <Box
                    className="item display"
                    borderRadius="4px"
                    boxShadow={selectedBoard === DisplayBoard.TURMOIL ? BOX_SHADOW_TURMOIL : 'none'}
                    onClick={() => setDisplayBoard(DisplayBoard.TURMOIL)}
                >
                    Turmoil
                </Box>
            ) : null}
        </BoardSwitcherOuter>
    );
}
