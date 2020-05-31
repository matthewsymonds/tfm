import styled from 'styled-components';
import {TileType} from 'constants/board';
import {Hexagon} from './hexagon';
import {Cube} from 'components/square';

const getColor = (type: TileType) => {
    switch (type) {
        case TileType.CITY:
            return 'gray';
        case TileType.GREENERY:
            return 'green';
        case TileType.OCEAN:
            return '#3987c9';
        case TileType.LAVA_FLOW:
            return '#ff2222';
        case TileType.OTHER:
            return 'brown';
        default:
            return 'white';
    }
};

const getIcon = (type: TileType) => {
    switch (type) {
        case TileType.CAPITAL:
        case TileType.CITY:
            return '🏙️';
        case TileType.COMMERCIAL_DISTRICT:
            return '$';
        case TileType.ECOLOGICAL_ZONE:
            return '🐾';
        case TileType.GREENERY:
            return '🌳';
        case TileType.INDUSTRIAL_CENTER:
            return '🏭';
        case TileType.LAVA_FLOW:
            return '🌋';
        case TileType.MINING_RIGHTS:
        case TileType.MINING_AREA:
            return '⛏️';
        case TileType.MOHOLE_AREA:
            return '🕳️';
        case TileType.NATURAL_PRESERVE:
            return '♂️';
        case TileType.NUCLEAR_ZONE:
            return '☢️';
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
    ownerPlayerIndex?: number;
};

const Icon = styled.div`
    font-size: 40px;
`;

export const Tile = (props: TileProps) => (
    <Hexagon overlap={true} color={getColor(props.type)}>
        {props.ownerPlayerIndex !== undefined ? (
            <Cube playerIndex={props.ownerPlayerIndex} />
        ) : null}
        <Icon>{getIcon(props.type)}</Icon>
    </Hexagon>
);
