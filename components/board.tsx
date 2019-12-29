import styled from 'styled-components';

const BoardOuter = styled.div`
  position: relative;
  padding: 24px;
  margin: 0 auto;
  width: 800px;
  height: 800px;
  border: 2px solid gray;
  background: #2a0e4e;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BoardInner = styled.div`
  display: flex;
  flex-direction: column;
  flex; 1;
`;

const Circle = styled.div`
  border-radius: 50%;
  width: 800px;
  height: 800px;
  background: #e0a052;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Board = props => (
  <BoardOuter>
    <Circle>
      <BoardInner {...props} />
    </Circle>
  </BoardOuter>
);
