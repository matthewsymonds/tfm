import {colors} from 'components/ui';
import {Tag} from 'constants/tag';
import React from 'react';
import styled from 'styled-components';

type TagBaseProps = {
    color: string;
    background: string;
    size: number;
    showRedBorder: boolean;
    margin: number;
};

const TagBase = styled.div<TagBaseProps>`
    border-radius: 50%;
    width: ${props => props.size}px;
    min-width: ${props => props.size}px;
    height: ${props => props.size}px;
    margin: ${props => props.margin}px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.color};
    background: ${props => props.background};
    box-shadow: ${props => (props.showRedBorder ? 'red 0px 0px 3px 2px' : 'initial')};
    border: 1px solid ${colors.CARD_BORDER_2};
    overflow: hidden;
    font-family: 'SF UI Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
        Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-weight: 600;
`;

const dict = {
    [Tag.ANIMAL]: ['🐶', 'black', 'lightgreen'],
    [Tag.BUILDING]: ['🏛️', 'brown', '#795548', '', 'building-icon'],
    [Tag.CITY]: ['🌆', '#333333', '#C8B3C5'],
    [Tag.EARTH]: ['🌎', 'darkgreen', 'lightblue', 'black'],
    [Tag.POWER]: ['⚡', 'white', 'purple'],
    [Tag.EVENT]: ['⬇️', 'gold', 'black'],
    [Tag.JOVIAN]: ['J', 'purple', 'darkgray', '', 'jovian-icon'],
    [Tag.MICROBE]: ['🐛', 'green', 'white'],
    [Tag.PLANT]: ['🍂', 'darkgreen', 'lightgreen'],
    [Tag.SCIENCE]: ['⚛️', 'white', 'darkgray'],
    [Tag.SPACE]: ['✴️', 'white', 'black', '', 'space-icon'],
    [Tag.VENUS]: ['V', 'darkblue', 'lightblue'],
    x: ['x', 'white', 'white'],
};

type TagProps = {
    icon: string;
    color: string;
    backgroundColor: string;
    outerBackgroundColor?: string;
    className: string;
};

function getTagProps(tag: Tag): TagProps {
    const [icon, color, backgroundColor, outerBackgroundColor, className] = dict[tag];

    return {
        icon,
        color,
        backgroundColor,
        outerBackgroundColor,
        className: className || 'tag-icon',
    };
}

type TagIconProps = {
    name: Tag;
    size?: number;
    showRedBorder?: boolean;
    margin?: number;
};

export const TagIcon = ({name, size = 12, showRedBorder = false, margin = 0}: TagIconProps) => {
    const tagProps = getTagProps(name);
    return (
        <TagBase
            color={tagProps.color}
            size={size ?? 32}
            background={tagProps.backgroundColor}
            showRedBorder={showRedBorder ?? null}
            margin={margin}
        >
            <span className={tagProps.className}>{tagProps.icon}</span>
        </TagBase>
    );
};
