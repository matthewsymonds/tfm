import {INITIAL_BOARD_STATE} from '../constants/board';
import {Board} from '../components/board';
import {Row} from '../components/row';
import {Cell} from '../components/cell';
import {Tile} from '../components/tile';
import {useState} from 'react';

export default function Index() {
  const [board] = useState(INITIAL_BOARD_STATE);
  return (
    <Board>
      {board.map((row, outerIndex) => (
        <Row key={outerIndex}>
          {row.map((cell, index) => (
            <Cell type={cell.type} bonus={cell.bonus} key={index}>
              {cell.tile && <Tile />}
            </Cell>
          ))}
        </Row>
      ))}
    </Board>
  );
}
