import styled from 'styled-components';
import React from 'react';
import {Board as BoardModel, cellHelpers, Parameter, GlobalParameters} from '../constants/board';
import GlobalParams from './global-params';
import {Row} from './row';
import {Cell} from './cell';
import {Tile} from './tile';

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

export const Board: React.FunctionComponent<BoardProps> = props => (
    <BoardOuter>
        <GlobalParams parameters={props.parameters} />
        <Circle>
            <BoardInner>
                {props.board.map((row, outerIndex) => (
                    <Row key={outerIndex}>
                        {row.map(
                            (cell, index) =>
                                cellHelpers.onMars(cell) && (
                                    <Cell type={cell.type} bonus={cell.bonus ?? []} key={index}>
                                        {cell.tile && <Tile type={cell.tile.type} />}
                                    </Cell>
                                )
                        )}
                    </Row>
                ))}
            </BoardInner>
        </Circle>
    </BoardOuter>
);
