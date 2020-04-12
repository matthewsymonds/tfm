import styled from 'styled-components';
import {Tag} from '../constants/card-types';

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

const {
    ANIMAL,
    BUILDING,
    CITY,
    EARTH,
    POWER,
    EVENT,
    JOVIAN,
    MICROBE,
    PLANT,
    SCIENCE,
    SPACE,
    VENUS
} = Tag;

function getIcon(tag: Tag) {
    switch (tag) {
        case ANIMAL:
            return '🐶';
        case BUILDING:
            return '🏛️';
        case CITY:
            return '🌆';
        case EARTH:
            return '🌎';
        case POWER:
            return '⚡';
        case EVENT:
            return '⬇️';
        case JOVIAN:
            return 'J';
        case MICROBE:
            return '🐛';
        case PLANT:
            return '🍂';
        case SCIENCE:
            return '⚛️';
        case SPACE:
            return '✴️';
        case VENUS:
            return 'V';
    }
}

export const getTagColor = (tag: Tag) => {
    switch (tag) {
        case Tag.ANIMAL:
            return 'brown';
        case Tag.BUILDING:
            return 'brown';
        case Tag.CITY:
            return '#333333';
        case Tag.EARTH:
            return 'darkgreen';
        case Tag.POWER:
            return 'white';
        case Tag.EVENT:
            return 'gold';
        case Tag.JOVIAN:
            return 'purple';
        case Tag.MICROBE:
            return 'green';
        case Tag.PLANT:
            return 'darkgreen';
        case Tag.SCIENCE:
            return 'white';
        case Tag.SPACE:
            return 'white';
        case Tag.VENUS:
            return 'lightblue';
    }
};

export const getTagBackgroundColor = (tag: Tag) => {
    switch (tag) {
        case Tag.ANIMAL:
            return 'darkgreen';
        case Tag.BUILDING:
            return '#d7d7d7';
        case Tag.CITY:
            return '#C8B3C5';
        case Tag.EARTH:
            return 'lightblue';
        case Tag.POWER:
            return 'purple';
        case Tag.EVENT:
            return 'black';
        case Tag.JOVIAN:
            return 'darkgray';
        case Tag.MICROBE:
            return 'white';
        case Tag.PLANT:
            return 'lightgreen';
        case Tag.SCIENCE:
            return 'darkgray';
        case Tag.SPACE:
            return 'black';
        case Tag.VENUS:
            return 'lightblue';
    }
};

export const getOuterBackgroundColor = (tag: Tag) => {
    switch (tag) {
        case Tag.EARTH:
            return 'black';
    }
    return '';
};

export const TagsComponent = (props: TagsComponentProps) => (
    <TagsBase>
        {props.tags.map((tag, index) => (
            <TagBase color={getTagColor(tag)} background={getTagBackgroundColor(tag)} key={index}>
                {getIcon(tag)}
            </TagBase>
        ))}
    </TagsBase>
);
