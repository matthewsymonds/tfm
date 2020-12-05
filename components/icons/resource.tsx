import React from 'react';
import {
    getResourceColor,
    Resource,
    getResourceBackgroundColor,
    getClassName,
    getResourceSymbol,
} from 'constants/resource';
import styled from 'styled-components';

interface ResourceIconBaseProps {
    readonly color: string;
    readonly background: string;
    readonly size: number;
    readonly showRedBorder: boolean;
    readonly tall?: boolean;
}

const ResourceIconBase = styled.div<ResourceIconBaseProps>`
    display: inline-block;
    height: ${props => (props.tall ? props.size * 1.5 : props.size)}px;
    width: ${props => props.size}px;
    text-align: center;
    margin: 3px;
    font-size: ${props => props.size * 0.5}px;
    font-weight: bold;
    color: ${props => props.color};
    background: ${props => props.background};
    display: flex;
    align-items: center;
    justify-content: center;
    border: ${props => (props.showRedBorder ? '2px solid red' : 'initial')};
`;

const MegacreditIcon = styled.div<{size?: number}>`
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    font-size: ${props => (props.size ? props.size * 0.75 : '12')}px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background-color: gold;
    border: 3px solid #c59739;
`;
interface ResourceIconProps {
    name: Resource;
    size?: number;
    showRedBorder?: boolean;
    amount?: string;
}

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({
    name,
    size = 20,
    showRedBorder = false,
    amount,
}) => {
    if (name === Resource.MEGACREDIT) {
        return (
            <MegacreditIcon size={size}>
                <span>{amount ?? null}</span>
            </MegacreditIcon>
        );
    }

    return (
        <ResourceIconBase
            color={getResourceColor(name)}
            background={getResourceBackgroundColor(name)}
            size={size}
            tall={name === Resource.CARD}
            showRedBorder={showRedBorder}
        >
            <span className={getClassName(name)}>{getResourceSymbol(name)}</span>
        </ResourceIconBase>
    );
};
