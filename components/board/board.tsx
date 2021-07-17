import {BoardSwitcherOption} from 'components/board-switcher';
import AwardsNew from 'components/board/board-actions/awards-new';
import MilestonesNew from 'components/board/board-actions/milestones-new';
import StandardProjectsNew from 'components/board/board-actions/standard-projects-new';
import {Box, Flex} from 'components/box';
import {Colonies} from 'components/colonies';
import GlobalParams from 'components/global-params';
import {colors} from 'components/ui';
import {Cell as CellModel, cellHelpers, HEX_PADDING, HEX_RADIUS} from 'constants/board';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {useTypedSelector} from 'reducer';
import {getValidPlacementsForRequirement} from 'selectors/board';
import {isPlayingVenus} from 'selectors/is-playing-venus';
import styled from 'styled-components';
import {Cell} from './cell';
import OffMarsCities from './off-mars-cities';

const Circle = styled.div`
    border-radius: 50%;
    width: 450px;
    height: 450px;
    background: ${colors.DARK_ORANGE};
    display: flex;
    justify-content: center;
    align-items: center;
`;

const rowOffset = HEX_RADIUS * Math.sin((30 * Math.PI) / 180) - HEX_PADDING * 1.5;

const Row = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: -${rowOffset}px;
`;

export const Board = ({option}: {option: BoardSwitcherOption}) => {
    const loggedInPlayer = useLoggedInPlayer();

    const parameters = useTypedSelector(state => state.common.parameters);

    return (
        <Flex justifyContent="flex-end" alignItems="flex-start" width="100%">
            <GlobalParams parameters={parameters} />

            <Flex flexDirection="column" alignItems="center" flexGrow="1">
                <BoardInner option={option} />
                <StandardProjectsNew loggedInPlayer={loggedInPlayer} />
            </Flex>

            <Flex flexDirection="column" alignItems="flex-end" alignSelf="center">
                <MilestonesNew loggedInPlayer={loggedInPlayer} />
                <AwardsNew loggedInPlayer={loggedInPlayer} />
            </Flex>
        </Flex>
    );
};

export function BoardInner({option}: {option: BoardSwitcherOption}) {
    const loggedInPlayer = useLoggedInPlayer();

    const board = useTypedSelector(state => state.common.board);
    const {pendingTilePlacement} = loggedInPlayer;
    const validPlacements = useTypedSelector(state =>
        getValidPlacementsForRequirement(state, pendingTilePlacement, loggedInPlayer)
    );

    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

    const venus = useTypedSelector(isPlayingVenus);

    function handleClick(cell: CellModel) {
        if (!actionGuard.canCompletePlaceTile(cell)[0]) {
            return;
        }
        apiClient.completePlaceTileAsync({cell});
    }

    if (option === BoardSwitcherOption.BOARD_SWITCHER_COLONIES) {
        return <Colonies />;
    }
    return (
        <Box position="relative" paddingBottom={venus ? '75px' : '0px'}>
            <OffMarsCities
                board={board}
                validPlacements={validPlacements}
                handleClick={handleClick}
            />
            <Circle>
                <Flex flexDirection="column">
                    {board.map((row, outerIndex) => (
                        <Row key={outerIndex}>
                            {row.map(
                                (cell, index) =>
                                    cellHelpers.onMars(cell) && (
                                        <div
                                            key={`${outerIndex}-${index}`}
                                            style={{
                                                position: 'relative',
                                                margin: `0 ${HEX_PADDING}px`,
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
            </Circle>
        </Box>
    );
}
