import styled from 'styled-components';
import {TileType} from '../constants/board';
import {Hexagon} from './hexagon';

const getColor = props => {
  switch (props.type) {
    case TileType.City:
      return 'gray';
    case TileType.Greenery:
      return 'green';
    case TileType.Ocean:
      return 'blue';
    case TileType.Other:
      return 'brown';
  }
};

export const Tile = props => <Hexagon color={getColor(props)} />;
