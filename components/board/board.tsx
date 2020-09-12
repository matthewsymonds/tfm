import styled from 'styled-components';
import React, {useContext} from 'react';
import {cellHelpers, Cell as CellModel, Parameter} from 'constants/board';
import {Cell} from './cell';
import {getValidPlacementsForRequirement} from 'selectors/board';
import {useDispatch, useStore} from 'react-redux';
import {useTypedSelector, RootState} from 'reducer';
import {placeTile, increaseParameter} from 'actions';
import {AppContext} from 'context/app-context';
import {HEX_RADIUS, HEX_PADDING} from 'constants/board';
import OffMarsCities from './off-mars-cities';
import {Box} from 'components/box';
import GlobalParams from 'components/global-params';
import {colors} from 'components/ui';

const BoardOuter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
`;

const BoardInner = styled.div`
  display: flex;
  flex-direction: column;
  flex; 1;
`;

const Circle = styled.div`
    border-radius: 50%;
    width: 450px;
    height: 450px;
    background: ${colors.ACCORDION_HEADER};
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

export const Board = () => {
    const store = useStore<RootState>();
    const context = useContext(AppContext);

    const board = useTypedSelector(state => state.common.board);

    const state = store.getState();
    const loggedInPlayer = context.getLoggedInPlayer(state);

    const {pendingTilePlacement} = loggedInPlayer;
    const validPlacements = useTypedSelector(state =>
        getValidPlacementsForRequirement(state, pendingTilePlacement, loggedInPlayer)
    );

    const dispatch = useDispatch();

    function handleClick(cell: CellModel) {
        if (!validPlacements.includes(cell)) return;

        const type = pendingTilePlacement!.type!;

        dispatch(placeTile({type}, cell, loggedInPlayer.index));

        const parameterForTile = context.getParameterForTile(type);
        if (parameterForTile) {
            context.playAction({
                state,
                action: {
                    increaseParameter: {
                        [parameterForTile as Parameter]: 1,
                    },
                },
            });
        }

        context.triggerEffectsFromTilePlacement(type, cell, state);
        context.processQueue(dispatch);
    }
    return (
        <BoardOuter>
            <Box position="relative">
                <OffMarsCities
                    board={board}
                    validPlacements={validPlacements}
                    handleClick={handleClick}
                />
                <Circle>
                    <BoardInner>
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
                    </BoardInner>
                </Circle>
            </Box>
            <GlobalParams parameters={state.common.parameters} />
        </BoardOuter>
    );
};
