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

const getIcon = (type: TileType) => {
    switch (type) {
        case TileType.CAPITAL:
        case TileType.CITY:
            return '🏙️';
        case TileType.ECOLOGICAL_ZONE:
            return '🐾';
        case TileType.GREENERY:
            return '🌳';
        case TileType.INDUSTRIAL_CENTER:
            return '🏭';
        case TileType.LAVA_FLOW:
            return '🌋';
        case TileType.MINING:
            return '⛏️';
        case TileType.MOHOLE_AREA:
            return '🕳️';
        case TileType.NATURAL_PRESERVE:
            return '♂️';
        case TileType.OCEAN:
            return '🌊';
        case TileType.OTHER:
            return '?';
        case TileType.RESTRICTED_AREA:
            return '🚫';
        default:
            return '?';
    }
};

type TileProps = {
    type: TileType;
};

export const Tile = (props: TileProps) => <Hexagon color={getColor(props.type)} />;
