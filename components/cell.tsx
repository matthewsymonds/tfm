import {CellType} from '../constants/board';
import {
  getResourceSymbol,
  getResourceColor,
  getResourceBackgroundColor
} from '../constants/resource';
import {Hexagon} from './hexagon';
import styled from 'styled-components';

interface ResourceProps {
  readonly color: string;
  readonly background: string;
}

const Resource = styled.div<ResourceProps>`
  display: inline-block;
  height: 20px;
  width: 20px;
  margin: 4px;
  font-size: 17px;
  font-weight: bold;
  color: ${props => props.color};
  background: ${props => props.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
`;

const getColor = props => {
  switch (props.type) {
    case CellType.LAND:
      return 'rgba(255, 255, 255, 0.2)';
    case CellType.WATER:
      return 'rgba(206, 247, 253, 0.5)';
  }
};

export const Cell = props => (
  <Hexagon color={getColor(props)}>
    {props.bonus.map((resource, index) => (
      <Resource
        key={index}
        color={getResourceColor(resource)}
        background={getResourceBackgroundColor(resource)}>
        <span>{getResourceSymbol(resource)}</span>
      </Resource>
    ))}
  </Hexagon>
);
