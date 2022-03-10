import {colors} from 'components/ui';
import {
    getClassName,
    getResourceBackgroundColor,
    getResourceColor,
    getResourceSymbol,
} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import React from 'react';
import Twemoji from 'react-twemoji';
import styled from 'styled-components';

interface ResourceIconBaseProps {
    readonly color: string;
    readonly background: string;
    readonly size: number;
    readonly showRedBorder: boolean;
    readonly margin: number | string;
    readonly tall?: boolean;
    readonly border?: string;
    readonly unit?: string;
}

const clampedIfViewportWidth = (
    props: ResourceIconBaseProps,
    multiplier: number
) =>
    props?.unit === 'vw'
        ? `clamp(${10 * multiplier}px, ${
              props.size * multiplier + props?.unit
          }, ${Math.floor(14.5 * multiplier)}px)`
        : `${props.size * multiplier}${props?.unit ?? 'px'}`;

const ResourceIconBase = styled.div<ResourceIconBaseProps>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: ${props => clampedIfViewportWidth(props, props.tall ? 1.5 : 1)};
    width: ${props => clampedIfViewportWidth(props, 1)};
    text-align: center;
    margin: ${props =>
        typeof props.margin === 'string'
            ? props.margin
            : `${props.margin}${props?.unit ?? 'px'}`};
    font-size: ${props => clampedIfViewportWidth(props, 0.5)};
    font-weight: bold;
    color: ${props => props.color};
    background: ${props => props.background};
    box-shadow: ${props =>
        props.showRedBorder ? 'red 0px 0px 3px 2px' : 'initial'};
    border: ${props => props.border ?? 'none'};
`;

const MegacreditIcon = styled.div<{
    size?: number;
    showRedBorder?: boolean;
    margin: string | number;
}>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    color: ${colors.TEXT_DARK_1};
    font-size: ${props => (props.size ? props.size * 0.6 : '12')}px;
    box-shadow: ${props =>
        props.showRedBorder ? 'red 0px 0px 3px 2px' : 'initial'};
    border-radius: 3px;
    background-color: ${colors.MEGACREDIT};
    border: 1px solid #c59739;
    margin: ${props =>
        typeof props.margin === 'string' ? props.margin : `${props.margin}px`};
`;
interface ResourceIconProps {
    name: Resource;
    size?: number;
    showRedBorder?: boolean;
    amount?: string | number;
    margin?: number | string;
    border?: string;
    unit?: string;
}

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({
    name,
    size = 20,
    showRedBorder = false,
    amount,
    margin = 0,
    border = 'none',
    unit = 'px',
}) => {
    if (name === Resource.MEGACREDIT) {
        return (
            <MegacreditIcon
                size={size}
                showRedBorder={showRedBorder}
                margin={margin}
            >
                <span>{amount ?? null}</span>
            </MegacreditIcon>
        );
    }

    return (
        <React.Fragment>
            {amount !== undefined && (
                <span style={{marginRight: 2}}>{amount}</span>
            )}
            <ResourceIconBase
                color={getResourceColor(name)}
                background={getResourceBackgroundColor(name)}
                size={size}
                tall={name === Resource.CARD}
                showRedBorder={showRedBorder}
                margin={margin}
                border={border}
                unit={unit}
            >
                <Twemoji>
                    <span className={getClassName(name)}>
                        {getResourceSymbol(name)}
                    </span>
                </Twemoji>
            </ResourceIconBase>
        </React.Fragment>
    );
};
