import {colors} from 'components/ui';
import {Tag} from 'constants/tag';
import React from 'react';
import styled from 'styled-components';

type TagBaseProps = {
    color: string;
    background: string;
    size: number;
    showRedBorder: boolean;
    margin: number | string;
};

const TagBase = styled.div<TagBaseProps>`
    border-radius: 50%;
    box-sizing: border-box;
    width: ${props => props.size}px;
    min-width: ${props => props.size}px;
    height: ${props => props.size}px;
    line-height: ${props => props.size}px;
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
    font-size: 14px;
    font-weight: 400;
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

// icon, text color, bg color
const dict = {
    [Tag.ANIMAL]: ['🐶', 'black', 'lightgreen'],
    [Tag.BUILDING]: ['🏛️', 'brown', '#f7dbc7', '', 'building-icon'],
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
    [Tag.WILD]: ['?', 'black', '#fefefe'],
    [Tag.ANY]: ['🌈', 'black', 'white'],
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
    margin?: number | string;
};

export const TagIcon = ({name, size = 12, showRedBorder = false, margin = 0}: TagIconProps) => {
    const tagProps = getTagProps(name);
    return (
        <TagBase
            color={tagProps.color}
            size={size}
            background={tagProps.backgroundColor}
            showRedBorder={showRedBorder ?? null}
            margin={margin}
        >
            <span className={tagProps.className}>{tagProps.icon}</span>
        </TagBase>
    );
};
