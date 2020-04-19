import styled from 'styled-components';
import React from 'react';
import {Board as BoardModel, cellHelpers, Parameter, GlobalParameters} from '../constants/board';
import GlobalParams from './global-params';
import {Row} from './row';
import {Cell} from './cell';
import {Tile} from './tile';
import {getValidPlacementsForRequirement} from '../selectors/board';
import {useSelector} from 'react-redux';
import {useTypedSelector} from '../reducer';

const BoardOuter = styled.div`
    position: relative;
    padding: 24px;
    margin: 0 auto;
    width: 100%;
    height: 800px;
    background: #212121;
    display: flex;
    justify-content: center;
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
    width: 800px;
    height: 800px;
    background: #ce7e47;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const Board: React.FunctionComponent<BoardProps> = props => {
    const tilePlacement = useTypedSelector(state => state.players[props.playerIndex].tilePlacement);
    const validPlacements = useTypedSelector(state =>
        getValidPlacementsForRequirement(state, tilePlacement?.placementRequirement)
    );
    return (
        <>
            <div>{JSON.stringify(validPlacements)}</div>
            <BoardOuter>
                <GlobalParams parameters={props.parameters} />
                <Circle>
                    <BoardInner>
                        {props.board.map((row, outerIndex) => (
                            <Row key={outerIndex}>
                                {row.map(
                                    (cell, index) =>
                                        cellHelpers.onMars(cell) && (
                                            <Cell
                                                selectable={validPlacements.includes(cell)}
                                                type={cell.type}
                                                bonus={cell.bonus ?? []}
                                                key={index}>
                                                {cell.tile && <Tile type={cell.tile.type} />}
                                            </Cell>
                                        )
                                )}
                            </Row>
                        ))}
                    </BoardInner>
                </Circle>
            </BoardOuter>
        </>
    );
};
