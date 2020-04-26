import styled from 'styled-components';
import {Tag} from '../constants/tag';

const TagsBase = styled.div`
    display: flex;
    justify-self: flex-start;
    justify-content: flex-end;
    height: 40px;
`;

const TagBase = styled.div<TagBaseProps>`
    border-radius: 50%;
    width: 32px;
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
}

interface TagProps {
    icon: string;
    color: string;
    backgroundColor: string;
    outerBackgroundColor?: string;
}

const dict = {
    [Tag.ANIMAL]: ['🐶', 'black', 'lightgreen'],
    [Tag.BUILDING]: ['🏛️', 'brown', '#d7d7d7'],
    [Tag.CITY]: ['🌆', '#333333', '#C8B3C5'],
    [Tag.EARTH]: ['🌎', 'darkgreen', 'lightblue', 'black'],
    [Tag.POWER]: ['⚡', 'white', 'purple'],
    [Tag.EVENT]: ['⬇️', 'gold', 'black'],
    [Tag.JOVIAN]: ['J', 'purple', 'darkgray'],
    [Tag.MICROBE]: ['🐛', 'green', 'white'],
    [Tag.PLANT]: ['🍂', 'darkgreen', 'lightgreen'],
    [Tag.SCIENCE]: ['⚛️', 'white', 'darkgray'],
    [Tag.SPACE]: ['✴️', 'white', 'black'],
    [Tag.VENUS]: ['V', 'lightblue', 'lightblue']
};

function getTagProps(tag: Tag): TagProps {
    const [icon, color, backgroundColor, outerBackgroundColor] = dict[tag];

    return {
        icon,
        color,
        backgroundColor,
        outerBackgroundColor
    };
}

export const TagsComponent = (props: TagsComponentProps) => (
    <TagsBase>
        {props.tags.map((tag, index) => {
            const tagProps = getTagProps(tag);
            return (
                <TagBase color={tagProps.color} background={tagProps.backgroundColor} key={index}>
                    <span className="icon">{tagProps.icon}</span>
                </TagBase>
            );
        })}
    </TagsBase>
);
