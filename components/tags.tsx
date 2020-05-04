import styled from 'styled-components';
import {Tag} from '../constants/tag';
import {ReactChild} from 'react';

const TagsBase = styled.div`
    display: flex;
    justify-self: flex-start;
    justify-content: flex-end;
    align-items: center;
    height: 40px;
    margin-bottom: 8px;
`;

const TagBase = styled.div<TagBaseProps>`
    border-radius: 50%;
    width: 32px;
    min-width: 32px;
    height: 32px;
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

const FlexStart = styled.div`
    margin-right: auto;
    margin-left: 0;
`;

export const TagsComponent = (props: TagsComponentProps) => (
    <TagsBase>
        <FlexStart>{props.children}</FlexStart>
        {props.tags.map((tag, index) => {
            const tagProps = getTagProps(tag);
            return (
                <TagBase color={tagProps.color} background={tagProps.backgroundColor} key={index}>
                    <span className={tagProps.className}>{tagProps.icon}</span>
                </TagBase>
            );
        })}
    </TagsBase>
);
