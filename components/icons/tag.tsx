import {Box, Flex} from 'components/box';
import {colors} from 'components/ui';
import {Tag} from 'constants/tag';
import React from 'react';
import Twemoji from 'react-twemoji';

// icon, text color, bg color, classname
const dict = {
    [Tag.ANIMAL]: ['🐶', 'black', 'lightgreen', '', 'emoji animal'],
    [Tag.BUILDING]: ['', '#9e6c43', '#8b5e3d', '', 'building'],
    [Tag.CITY]: ['🌆', '#333333', '#C8B3C5', '', 'city emoji'],
    [Tag.EARTH]: ['🌎', 'darkgreen', '', 'transparent', 'emoji earth'],
    [Tag.POWER]: ['⚡', 'white', 'purple', '', 'emoji lightning'],
    [Tag.EVENT]: ['⬇', 'black', 'gold', '', 'event'],
    [Tag.JOVIAN]: ['🪐', 'purple', 'darkgray', 'transparent', 'emoji jovian'],
    [Tag.MICROBE]: ['🐛', 'green', 'white', '', 'emoji microbe'],
    [Tag.PLANT]: ['🍂', 'darkgreen', 'lightgreen', '', 'emoji plant'],
    [Tag.SCIENCE]: ['⚛', '#666', '#eee', '', 'science'],
    [Tag.SPACE]: ['✷', 'gold', 'black', '', 'space-tag'],
    [Tag.VENUS]: ['V', 'darkblue', 'lightblue'],
    [Tag.WILD]: ['?', 'black', '#fefefe'],
    [Tag.ANY]: ['🌈', 'black', 'white', '', 'emoji'],
    [Tag.NONE]: ['', 'black', 'white', '', 'emoji'],
    x: ['x', 'white', 'white'],
};

const PLAIN_ICONS = ['⚛', '⬇'];

type TagProps = {
    icon: string;
    color: string;
    backgroundColor: string;
    outerBackgroundColor?: string;
    className: string;
};

function getTagProps(tag: Tag): TagProps {
    const [icon, color, backgroundColor, outerBackgroundColor, className] =
        dict[tag];

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
};

export const TagIcon = ({
    name,
    size = 12,
    showRedBorder = false,
    margin = 0,
}: TagIconProps) => {
    const tagProps = getTagProps(name);
    let className = 'not-mac';
    if (typeof window !== 'undefined') {
        const userAgent = navigator.userAgent.toUpperCase();
        if (userAgent.includes('MAC')) {
            className = 'mac';
        } else if (userAgent.includes('ANDROID ')) {
            className = 'android';
        } else if (userAgent.includes('LINUX')) {
            className = 'linux';
        }
    }
    const fontSize = size / 2;
    const baseIcon = <Box>{tagProps.icon}</Box>;

    return (
        <Box
            border={
                '1px solid ' + tagProps.outerBackgroundColor ??
                colors.CARD_BORDER_2
            }
            background={tagProps.backgroundColor}
            margin={margin}
            boxShadow={showRedBorder ? 'red 0px 0px 3px 2px' : 'initial'}
            borderRadius="50%"
            position="relative"
            width={size + 'px'}
            fontSize={fontSize + 'px'}
            overflow="hidden"
            lineHeight={fontSize + 'px'}
            className={'outer-' + tagProps.className + ' ' + className}
            fontWeight="600"
        >
            <Box paddingTop="100%" />
            <Flex
                position="absolute"
                borderRadius="50%"
                top="0"
                left="0"
                right="0"
                bottom="0"
                alignItems="center"
                justifyContent="center"
                className={'mid-' + tagProps.className}
            >
                <Flex
                    textAlign="center"
                    color={tagProps.color}
                    className={'inner-' + tagProps.className}
                    alignItems="center"
                    justifyContent="center"
                    lineHeight="4em"
                    inset={0}
                >
                    {PLAIN_ICONS.includes(tagProps.icon) ? (
                        baseIcon
                    ) : (
                        <Twemoji>{baseIcon}</Twemoji>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};
