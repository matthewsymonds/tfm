import styled from 'styled-components';
import {TileType} from '../constants/board';
import {Hexagon} from './hexagon';

const getColor = (type: TileType) => {
    switch (type) {
        case TileType.CITY:
            return 'gray';
        case TileType.GREENERY:
            return 'green';
        case TileType.OCEAN:
            return 'blue';
        case TileType.OTHER:
            return 'brown';
        default:
            return '';
    }
};

type TileProps = {
    type: TileType;
};

export const Tile = (props: TileProps) => <Hexagon color={getColor(props.type)} />;
