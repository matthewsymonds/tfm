import styled from 'styled-components';
import {Tag} from 'constants/tag';
import {ReactChild} from 'react';
import {Box} from './box';
import {PlayerState} from 'reducer';
import {getTags, getEventCards} from 'selectors/variable-amount';
import {ResourceBoardCell} from 'components/resource';
import {Pane} from 'evergreen-ui';

const TagsBase = styled.div`
    display: flex;
    justify-self: flex-start;
    justify-content: flex-end;
    align-items: center;
    height: 40px;
    margin-bottom: 8px;
    font-size: 16px;
`;

const TagBase = styled.div<TagBaseProps>`
    border-radius: 50%;
    width: ${props => props.size}px;
    min-width: ${props => props.size}px;
    height: ${props => props.size}px;
    margin: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${props => props.color};
    background: ${props => props.background};
    border: 1px solid #888888;
`;

interface TagBaseProps {
    color: string;
    background: string;
    size: number;
}

interface TagsComponentProps {
    tags: Tag[];
    children: ReactChild;
}

interface TagProps {
    icon: string;
    color: string;
    backgroundColor: string;
    outerBackgroundColor?: string;
    className: string;
}

const dict = {
    [Tag.ANIMAL]: ['🐶', 'black', 'lightgreen'],
    [Tag.BUILDING]: ['🏛️', 'brown', '#d7d7d7', '', 'building-icon'],
    [Tag.CITY]: ['🌆', '#333333', '#C8B3C5'],
    [Tag.EARTH]: ['🌎', 'darkgreen', 'lightblue', 'black'],
    [Tag.POWER]: ['⚡', 'white', 'purple'],
    [Tag.EVENT]: ['⬇️', 'gold', 'black'],
    [Tag.JOVIAN]: ['J', 'purple', 'darkgray', '', 'jovian-icon'],
    [Tag.MICROBE]: ['🐛', 'green', 'white'],
    [Tag.PLANT]: ['🍂', 'darkgreen', 'lightgreen'],
    [Tag.SCIENCE]: ['⚛️', 'white', 'darkgray'],
    [Tag.SPACE]: ['✴️', 'white', 'black', '', 'space-icon'],
    [Tag.VENUS]: ['V', 'lightblue', 'lightblue'],
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
};

export const TagIcon = (props: TagIconProps) => {
    const tagProps = getTagProps(props.name);
    return (
        <TagBase
            color={tagProps.color}
            size={props.size ?? 32}
            background={tagProps.backgroundColor}
        >
            <span className={tagProps.className}>{tagProps.icon}</span>
        </TagBase>
    );
};

export const TagsComponent = (props: TagsComponentProps) => (
    <TagsBase>
        <Box marginLeft={0} marginRight="auto">
            {props.children}
        </Box>
        {props.tags.map((tag, index) => {
            return <TagIcon key={index} name={tag} size={32} />;
        })}
    </TagsBase>
);

type PlayerTagCounterProps = {
    player: PlayerState;
};

export const PlayerTagCounter = ({player}: PlayerTagCounterProps) => {
    const tagCountsByTagName = getTags(player).reduce((accum, tag) => {
        if (!accum[tag]) {
            accum[tag] = 0;
        }
        accum[tag]++;
        return accum;
    }, {});
    const eventCount = getEventCards(player).length;

    return (
        <Pane display="flex" flexDirection="row">
            {eventCount > 0 && (
                <Pane marginRight={8}>
                    {/* FIX ME */}
                    {/* <ResourceBoardCell amount={eventCount} tag={Tag.EVENT} /> */}
                </Pane>
            )}
            {Object.keys(tagCountsByTagName).map(tag => (
                <Pane key={tag} marginRight={8}>
                    {/* FIX ME */}
                    {/* <ResourceBoardCell
                        key={tag}
                        amount={tagCountsByTagName[tag]}
                        tag={tag as Tag}
                    /> */}
                </Pane>
            ))}
        </Pane>
    );
};
