import {Flex} from 'components/box';
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
    border?: string;
    emojiAdjustment?: number;
    topEmojiAdjustment?: number;
};

const TagBase = styled.div<TagBaseProps>`
    border-radius: 50%;
    box-sizing: border-box;
    width: fit-content;
    min-width: ${props => props.size}px;
    max-width: ${props => props.size}px;
    height: ${props => props.size}px;
    line-height: ${props => props.size}px;
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.color};
    background: ${props => props.background};
    box-shadow: ${props => (props.showRedBorder ? 'red 0px 0px 3px 2px' : 'initial')};
    border: 1px solid ${props => props.border || colors.CARD_BORDER_2};
    font-family: 'SF UI Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
        Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-weight: 600;
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
    overflow: hidden;

    font-size: 100px;

    &.mac {
        .emoji {
            margin-right: ${props => props.emojiAdjustment || 3}px;
            margin-top: ${props => props.topEmojiAdjustment || 1}px;
        }
    }
`;

// icon, text color, bg color
const dict = {
    [Tag.ANIMAL]: ['🐶', 'black', 'lightgreen', '', 'emoji'],
    [Tag.BUILDING]: ['🏛️', 'brown', '#583824', '', 'emoji'],
    [Tag.CITY]: ['🌆', '#333333', '#C8B3C5', '', 'emoji'],
    [Tag.EARTH]: ['🌎', 'darkgreen', '', 'transparent', 'emoji earth'],
    [Tag.POWER]: ['⚡', 'white', 'purple', '', 'lightning'],
    [Tag.EVENT]: ['⮕', 'black', 'gold', '', 'event'],
    [Tag.JOVIAN]: ['🪐', 'purple', 'darkgray', 'transparent', 'emoji jovian'],
    [Tag.MICROBE]: ['🐛', 'green', 'white', 'emoji'],
    [Tag.PLANT]: ['🍂', 'darkgreen', 'lightgreen', '', 'emoji'],
    [Tag.SCIENCE]: ['⚛️', 'white', 'darkgray', '', 'emoji'],
    [Tag.SPACE]: ['✷', 'gold', 'black', '', 'space-tag'],
    [Tag.VENUS]: ['V', 'darkblue', 'lightblue'],
    [Tag.WILD]: ['?', 'black', '#fefefe'],
    [Tag.ANY]: ['🌈', 'black', 'white', '', 'emoji'],
    x: ['x', 'white', 'white'],
};

type TagProps = {
    icon: string;
    color: string;
    backgroundColor: string;
    outerBackgroundColor?: string;
    emojiAdjustment?: number;
    topEmojiAdjustment?: number;
    className: string;
};

function getTagProps(tag: Tag): TagProps {
    const [icon, color, backgroundColor, outerBackgroundColor, className] = dict[tag];

    return {
        icon,
        color,
        backgroundColor,
        outerBackgroundColor: outerBackgroundColor || '',
        className: className || 'tag-icon',
    };
}

type TagIconProps = {
    name: Tag;
    size?: number;
    showRedBorder?: boolean;
    margin?: number | string;
    emojiAdjustment?: number;
    topEmojiAdjustment?: number;
};

export const TagIcon = ({
    name,
    size = 12,
    showRedBorder = false,
    margin = 0,
    emojiAdjustment,
    topEmojiAdjustment,
}: TagIconProps) => {
    const tagProps = getTagProps(name);
    let className = 'not-mac';
    if (typeof window !== 'undefined' && navigator.userAgent.toUpperCase().indexOf('MAC') >= 0) {
        className = 'mac';
    }
    return (
        <TagBase
            color={tagProps.color}
            size={size}
            background={tagProps.backgroundColor}
            showRedBorder={showRedBorder ?? null}
            margin={margin}
            border={tagProps.outerBackgroundColor}
            emojiAdjustment={emojiAdjustment}
            topEmojiAdjustment={topEmojiAdjustment}
            className={className}
        >
            <Flex
                width="100%"
                height="100%"
                alignItems="center"
                justifyContent="center"
                className={tagProps.className}
                transform={`scale(${size / 200})`}
            >
                <div className={'inner-' + tagProps.className}>{tagProps.icon}</div>
            </Flex>
        </TagBase>
    );
};
