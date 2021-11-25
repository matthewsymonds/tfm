import {BoardSwitcher, DisplayBoard} from 'components/board-switcher';
import StandardProjectList from 'components/board/board-actions/standard-projects';
import {Box, Flex} from 'components/box';
import {Colonies} from 'components/colonies';
import {Turmoil} from 'components/turmoil';
import {colors} from 'components/ui';
import {Cell as CellModel, cellHelpers, SpecialLocation} from 'constants/board';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {useWindowWidth} from 'hooks/use-window-width';
import React from 'react';
import {useTypedSelector} from 'reducer';
import {getValidPlacementsForRequirement} from 'selectors/board';
import styled from 'styled-components';
import {Cell} from './cell';
import OffMarsCities, {OffMarsCity} from './off-mars-cities';

const CircleOuter = styled.div`
    display: flex;
    flex-direction: column;
    max-width: 698px;
`;

const Circle = styled.div`
    border-radius: 50%;
    width: 100%;
    position: relative;
    background: ${colors.DARK_ORANGE};
`;

const CircleDummy = styled.div`
    padding-top: 100%;
`;

const CircleInner = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;

const Row = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: calc(-1 * 1 / 40 * 100%);
`;

const BoardOuter = styled.div`
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    display: flex;
    position: relative;
    @media (max-width: 895px) {
        margin-left: auto;
        margin-right: auto;
        flex-direction: column;
    }
`;

export const MilestonesAwardsBoardSwitcherWrapper = styled.div`
    flex-direction: column;
    align-items: flex-end;
    width: 112px;
    display: flex;
    @media (max-width: 895px) {
        margin-top: 0px;
        width: 100%;
        flex-direction: column-reverse;
        align-items: center;
        align-self: center;
    }
`;

export const AwardsAndMilestones = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 4px;
    @media (max-width: 895px) {
        margin-left: inherit;
        max-width: 100%;
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
    }
`;

const BoardMid = styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    align-items: center;
    max-width: 698px;
    @media (max-width: 895px) {
        margin-left: auto;
        margin-right: auto;
        width: 100%;
    }
`;

export const Board = ({
    displayBoard,
    setDisplayBoard,
}: {
    displayBoard: DisplayBoard;
    setDisplayBoard: (board: DisplayBoard) => void;
}) => {
    const loggedInPlayer = useLoggedInPlayer();
    const windowWidth = useWindowWidth();

    return (
        <Box className="board" maxWidth="100%">
            <BoardOuter>
                {windowWidth <= 895 && (
                    <Flex width="100%" justifyContent="center">
                        <BoardSwitcher
                            setDisplayBoard={setDisplayBoard}
                            selectedBoard={displayBoard}
                        />
                    </Flex>
                )}

                <BoardMid>
                    <BoardInner displayBoard={displayBoard} />
                    <StandardProjectList loggedInPlayer={loggedInPlayer} />
                </BoardMid>
            </BoardOuter>
        </Box>
    );
};

export function BoardInner({displayBoard}: {displayBoard: DisplayBoard}) {
    const loggedInPlayer = useLoggedInPlayer();

    const board = useTypedSelector(state => state.common.board);
    const {pendingTilePlacement} = loggedInPlayer;
    const validPlacements = useTypedSelector(state =>
        getValidPlacementsForRequirement(state, pendingTilePlacement, loggedInPlayer)
    );

    const cells = board.flat();

    const ganymede = cells.find(cell => cell.specialLocation === SpecialLocation.GANYMEDE)!;

    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

    function handleClick(cell: CellModel) {
        if (!actionGuard.canCompletePlaceTile(cell)[0]) {
            return;
        }
        apiClient.completePlaceTileAsync({cell});
    }

    const offMarsCitiesProps = {board, validPlacements, handleClick};

    if (displayBoard === DisplayBoard.COLONIES) {
        return <Colonies />;
    }
    if (displayBoard === DisplayBoard.TURMOIL) {
        return <Turmoil />;
    }
    return (
        <Box position="relative" width="100%">
            <CircleOuter>
                <Circle>
                    <CircleDummy />
                    <CircleInner>
                        <Flex
                            width="90%"
                            left="50%"
                            transform="translateX(-50%)"
                            justifyContent="flex-end"
                            position="absolute"
                        >
                            <Box width="calc(100% / 9)">
                                <OffMarsCity
                                    cell={ganymede}
                                    offMarsCitiesProps={offMarsCitiesProps}
                                />
                            </Box>
                        </Flex>

                        <Flex
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            height="100%"
                        >
                            {board.map((row, outerIndex) => (
                                <Row key={outerIndex}>
                                    {row.map(
                                        (cell, index) =>
                                            cellHelpers.onMars(cell) && (
                                                <div
                                                    key={`${outerIndex}-${index}`}
                                                    style={{
                                                        position: 'relative',
                                                        margin: `0 calc(100% / (4 * 10 * 10))`,
                                                        flex: '0 0 calc(100% / 10)',
                                                    }}
                                                    onClick={() => handleClick(cell)}
                                                >
                                                    <Cell
                                                        cell={cell}
                                                        selectable={validPlacements.includes(cell)}
                                                    />
                                                </div>
                                            )
                                    )}
                                </Row>
                            ))}
                        </Flex>
                    </CircleInner>
                </Circle>
            </CircleOuter>

            <OffMarsCities {...offMarsCitiesProps} />
        </Box>
    );
}
