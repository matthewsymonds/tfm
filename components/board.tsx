import styled from 'styled-components';
import React from 'react';

const BoardOuter = styled.div`
  position: relative;
  padding: 24px;
  margin: 0 auto;
  width: 800px;
  height: 800px;
  border: 2px solid gray;
  background: #212121;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface BoardProps {}

const BoardInner = styled.div<BoardProps>`
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
    <Circle>
      <BoardInner {...props} />
    </Circle>
  </BoardOuter>
);
