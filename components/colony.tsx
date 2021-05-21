import {Colony} from 'constants/colonies';
import styled from 'styled-components';

const ColonyBase = styled.div<{backgroundColor: string; reverseBackground?: boolean}>`
    width: 250px;
    height: 130px;
    display: flex;
    border-radius: 55px;
    background: gray;
    margin: 8px;
    position: relative;
    position: relative;
    border-size: 4px;
    background: linear-gradient(
        ${props => (props.reverseBackground ? 'to left' : 'to right')},
        ${props => props.backgroundColor} 0%,
        #333 75%
    );
`;

const ColonyTileInner = styled.div<{backgroundColor: string; reverseBackground?: boolean}>`
    content: '';
    width: 244px;
    height: 124px;
    left: 3px;
    background: radial-gradient(
        circle at center ${props => (props.reverseBackground ? 'right' : 'left')},
        ${props => props.backgroundColor} 0%,
        #333 55%
    );
    align-self: center;
    justify-self: center;
    border-radius: 55px;
    position: absolute;
    z-index: 1;
    overflow: hidden;
`;

const ColonyTitle = styled.h2`
    align-self: flex-start;
    z-index: 3;
    justify-self: flex-start;
    text-transform: uppercase;
    text-align: left;
    padding-top: 4px;
    padding-left: 45px;
    margin-top: 0px;
    width: 100%;
    padding-bottom: 4px;
    box-shadow: 3px 1px 4px -5px #000000;
    background: linear-gradient(90deg, rgb(128 181 193 / 35%) 0%, rgba(0, 0, 0, 0) 55%);
    color: #111;
    letter-spacing: 0.4px;
`;

const ColonyPlanet = styled.div<{
    backgroundColor: string;
    position: {top: number; right: number};
    size: number;
    blur?: number;
    reverseBackground?: boolean;
}>`
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    align-self: center;
    justify-self: center;
    border-radius: 50%;
    background: radial-gradient(
        circle at 100%,
        ${props => (props.reverseBackground ? '#333' : props.backgroundColor)} 0%,
        ${props => (!props.reverseBackground ? '#333' : props.backgroundColor)} 100%
    );
    position: absolute;
    z-index: -1;
    top: ${props => props.position.top}px;
    right: ${props => props.position.right}px;
    filter: blur(${props => props.blur ?? 0}px);
`;

export function ColonyComponent({colony}: {colony: Colony}) {
    return (
        <ColonyBase
            backgroundColor={colony.borderColor}
            reverseBackground={colony.reverseBackground}
        >
            <ColonyTileInner
                backgroundColor={colony.backgroundColor}
                reverseBackground={colony.reverseBackground}
            >
                <ColonyTitle className="display">{colony.name}</ColonyTitle>
                <ColonyPlanet
                    backgroundColor={colony.planetColor}
                    position={colony.planetPosition}
                    size={colony.planetSize}
                    blur={colony.blur}
                    reverseBackground={colony.reverseBackground}
                />
            </ColonyTileInner>
        </ColonyBase>
    );
}
