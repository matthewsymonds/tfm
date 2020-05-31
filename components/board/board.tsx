import styled from 'styled-components';
import React, {useContext} from 'react';
import {
    Board as BoardModel,
    cellHelpers,
    GlobalParameters,
    Cell as CellModel,
} from 'constants/board';
import {Row} from 'components/row';
import {Tile} from './tile';
import {Cell} from './cell';
import {getValidPlacementsForRequirement} from 'selectors/board';
import {useDispatch, useStore} from 'react-redux';
import {useTypedSelector} from 'reducer';
import {placeTile} from 'actions';
import {AppContext} from 'context/app-context';
import OffMarsCities from './off-mars-cities';
import {Box} from 'components/box';

const BoardOuter = styled.div`
    position: relative;
    padding: 24px;
    margin: 16px;
    width: fit-content;
    display: flex;
    justify-content: center;
    align-self: flex-start
    align-items: center;
`;

interface BoardProps {
    board: BoardModel;
    parameters: GlobalParameters;
    playerIndex: number;
}

const BoardInner = styled.div`
  display: flex;
  flex-direction: column;
  flex; 1;
`;

const Circle = styled.div`
    border-radius: 50%;
    width: 600px;
    height: 600px;
    background: #ce7e47;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const BoardAcionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    > div {
        margin: 16px;
    }
`;

export const Board: React.FunctionComponent<BoardProps> = props => {
    const pendingTilePlacement = useTypedSelector(
        state => state.players[props.playerIndex].pendingTilePlacement
    );
    const validPlacements = useTypedSelector(state =>
        getValidPlacementsForRequirement(state, pendingTilePlacement)
    );

    const context = useContext(AppContext);

    const dispatch = useDispatch();
    const store = useStore();
    const state = store.getState();

    function handleClick(cell: CellModel) {
        if (!validPlacements.includes(cell)) return;

        const type = pendingTilePlacement!.type!;

        dispatch(placeTile({type}, cell, props.playerIndex));
        context.triggerEffectsFromTilePlacement(type, cell, state);
        context.processQueue(dispatch);
    }
    return (
        <>
            <BoardOuter>
                <Box position="relative" height="fit-content">
                    <OffMarsCities
                        board={props.board}
                        validPlacements={validPlacements}
                        handleClick={handleClick}
                    />
                    <Circle>
                        <BoardInner>
                            {props.board.map((row, outerIndex) => (
                                <Row key={outerIndex}>
                                    {row.map(
                                        (cell, index) =>
                                            cellHelpers.onMars(cell) && (
                                                <div
                                                    key={`${outerIndex}-${index}`}
                                                    style={{position: 'relative'}}
                                                    onClick={() => handleClick(cell)}
                                                >
                                                    <Cell
                                                        selectable={validPlacements.includes(cell)}
                                                        type={cell.type}
                                                        bonus={cell.bonus ?? []}
                                                    >
                                                        {cell.specialName ?? ''}
                                                    </Cell>
                                                    {cell.tile && <Tile type={cell.tile.type} />}
                                                </div>
                                            )
                                    )}
                                </Row>
                            ))}
                        </BoardInner>
                    </Circle>
                </Box>
            </BoardOuter>
        </>
    );
};
