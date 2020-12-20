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
    readonly margin: number;
}

const ResourceIconBase = styled.div<ResourceIconBaseProps>`
    display: inline-block;
    height: ${props => (props.tall ? props.size * 1.5 : props.size)}px;
    width: ${props => props.size}px;
    text-align: center;
    margin: ${props => props.margin}px;
    font-size: ${props => props.size * 0.5}px;
    font-weight: bold;
    color: ${props => props.color};
    background: ${props => props.background};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: ${props => (props.showRedBorder ? 'red 0px 0px 3px 2px' : 'initial')};
`;

const MegacreditIcon = styled.div<{size?: number; showRedBorder?: boolean}>`
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    font-size: ${props => (props.size ? props.size * 0.75 : '12')}px;
    display: flex;
    box-shadow: ${props => (props.showRedBorder ? 'red 0px 0px 3px 2px' : 'initial')};
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background-color: gold;
    border: 1px solid #c59739;
`;
interface ResourceIconProps {
    name: Resource;
    size?: number;
    showRedBorder?: boolean;
    amount?: string;
    margin?: number;
}

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({
    name,
    size = 20,
    showRedBorder = false,
    amount,
    margin = 0,
}) => {
    if (name === Resource.MEGACREDIT) {
        return (
            <MegacreditIcon size={size} showRedBorder={showRedBorder}>
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
            margin={margin}
        >
            <span className={getClassName(name)}>{getResourceSymbol(name)}</span>
        </ResourceIconBase>
    );
};
