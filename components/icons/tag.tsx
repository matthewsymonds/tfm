import React from 'react';
import styled from 'styled-components';
import {Tag} from 'constants/tag';

type TagBaseProps = {
    color: string;
    background: string;
    size: number;
    borderOverride: string | null;
};

const TagBase = styled.div<TagBaseProps>`
    border-radius: 50%;
    width: ${props => props.size}px;
    min-width: ${props => props.size}px;
    height: ${props => props.size}px;
    margin: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.color};
    background: ${props => props.background};
    border: ${props => props.borderOverride ?? '1px solid #888888'};
    overflow: hidden;
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
    borderOverride?: string;
};

export const TagIcon = (props: TagIconProps) => {
    const tagProps = getTagProps(props.name);
    return (
        <TagBase
            color={tagProps.color}
            size={props.size ?? 32}
            background={tagProps.backgroundColor}
            borderOverride={props.borderOverride ?? null}
        >
            <span className={tagProps.className}>{tagProps.icon}</span>
        </TagBase>
    );
};
