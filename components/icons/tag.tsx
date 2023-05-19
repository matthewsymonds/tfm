import {Box, Flex} from 'components/box';
import {Tag} from 'constants/tag';
import Twemoji from 'react-twemoji';
import JovianIcon from 'assets/jovian.svg';
import DownArrowIcon from 'assets/down-arrow.svg';
import ScienceIcon from 'assets/science.svg';

// icon, text color, bg color, classname
const dict: Record<
    Tag | 'x',
    {
        icon: string;
        textColor: string;
        bgColor: string;
        borderColor: string;
        className: string;
    }
> = {
    [Tag.ANIMAL]: {
        icon: '🐶',
        textColor: 'black',
        bgColor: 'lightgreen',
        borderColor: '',
        className: 'emoji animal',
    },
    [Tag.BUILDING]: {
        icon: '',
        textColor: '#9e6c43',
        bgColor: '#8b5e3d',
        borderColor: '',
        className: 'building',
    },
    [Tag.CITY]: {
        icon: '🌆',
        textColor: '#333333',
        bgColor: '#C8B3C5',
        borderColor: '',
        className: 'city emoji',
    },
    [Tag.EARTH]: {
        icon: '🌎',
        textColor: 'darkgreen',
        bgColor: '',
        borderColor: 'transparent',
        className: 'emoji earth',
    },
    [Tag.POWER]: {
        icon: '⚡',
        textColor: 'white',
        bgColor: 'purple',
        borderColor: '',
        className: 'emoji lightning',
    },
    [Tag.EVENT]: {
        icon: '⬇',
        textColor: 'black',
        bgColor: 'gold',
        borderColor: '',
        className: 'event',
    },
    [Tag.JOVIAN]: {
        icon: '🪐',
        textColor: 'purple',
        bgColor: 'darkgray',
        borderColor: 'transparent',
        className: 'emoji jovian',
    },
    [Tag.MICROBE]: {
        icon: '🐛',
        textColor: 'green',
        bgColor: 'white',
        borderColor: '',
        className: 'emoji microbe',
    },
    [Tag.PLANT]: {
        icon: '🍂',
        textColor: 'darkgreen',
        bgColor: 'lightgreen',
        borderColor: '',
        className: 'emoji plant',
    },
    [Tag.SCIENCE]: {
        icon: '⚛',
        textColor: '#666',
        bgColor: '#eee',
        borderColor: '',
        className: 'science',
    },
    [Tag.SPACE]: {
        icon: '✷',
        textColor: 'gold',
        bgColor: 'black',
        borderColor: '',
        className: 'space-tag',
    },
    [Tag.VENUS]: {
        icon: 'V',
        textColor: 'darkblue',
        bgColor: 'lightblue',
        borderColor: '',
        className: '',
    },
    [Tag.WILD]: {
        icon: '?',
        textColor: 'black',
        bgColor: '#fefefe',
        borderColor: '',
        className: '',
    },
    [Tag.ANY]: {
        icon: '🌈',
        textColor: 'black',
        bgColor: 'white',
        borderColor: '',
        className: 'emoji',
    },
    [Tag.NONE]: {
        icon: '',
        textColor: 'black',
        bgColor: 'white',
        borderColor: '',
        className: 'emoji',
    },
    x: {
        icon: 'x',
        textColor: 'white',
        bgColor: 'white',
        borderColor: '',
        className: '',
    },
};

const SVG_ICONS = {
    [Tag.JOVIAN]: JovianIcon,
    [Tag.SCIENCE]: ScienceIcon,
    [Tag.EVENT]: DownArrowIcon,
};

type TagProps = {
    icon: string;
    color: string;
    backgroundColor: string;
    outerBackgroundColor?: string;
    className: string;
};

function getTagProps(tag: Tag): TagProps {
    const {icon, textColor, bgColor, className} = dict[tag];

    return {
        icon,
        color: textColor,
        backgroundColor: bgColor,
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
    const SvgIcon = SVG_ICONS[name];

    return (
        <Box
            border={'1px solid #000'}
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
                    {SvgIcon ? (
                        <SvgIcon height={size - 2} width={size - 2} />
                    ) : (
                        <Twemoji>{baseIcon}</Twemoji>
                    )}
                </Flex>
            </Flex>
        </Box>
    );
};
