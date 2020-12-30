import {colors} from 'components/ui';
import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div<{height?: number; width?: number; bgColor: string}>`
    width: ${props => (props.width ? `${props.width}px` : 'initial')};
    height: ${props => (props.height ? `${props.height}px` : 'initial')};
    border-radius: 3px;
    border-width: 4px;
    border-style: solid;
    border-top-color: ${colors.CARD_BORDER_1};
    border-left-color: ${colors.CARD_BORDER_1};
    border-bottom-color: ${colors.CARD_BORDER_2};
    border-right-color: ${colors.CARD_BORDER_2};
    box-shadow: rgb(0 0 0 / 1) 4px 6px 6px -1px;

    &:before {
        content: '';
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 4px;
        right: 4px;
        background-color: ${props => props.bgColor};
    }
`;

const CardTexture = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;

    &:before {
        content: '';
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 4px;
        right: 4px;
        filter: sepia(0.1) hue-rotate(-9deg) drop-shadow(2px 4px 6px black);
        opacity: 0.8;
        background-image: url(${require('assets/hexellence.png')});
    }
`;

export default function TexturedCard({
    children,
    height,
    width,
    bgColor = 'hsl(15, 70%, 50%)',
}: {
    children: React.ReactNode;
    height?: number;
    width?: number;
    bgColor?: string;
}) {
    return (
        <CardContainer height={height} width={width} bgColor={bgColor}>
            <CardTexture>
                <div style={{position: 'relative'}}>{children}</div>
            </CardTexture>
        </CardContainer>
    );
}
