import styled from 'styled-components';
import {TileType} from '../constants/board';
import {Hexagon} from './hexagon';

const getColor = props => {
    switch (props.type) {
        case TileType.CITY:
            return 'gray';
        case TileType.GREENERY:
            return 'green';
        case TileType.OCEAN:
            return 'blue';
        case TileType.OTHER:
            return 'brown';
    }
};

export const Tile = props => <Hexagon color={getColor(props)} />;
