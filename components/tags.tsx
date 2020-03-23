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

const {Animal, Building, City, Earth, Energy, Jovian, Microbe, Plant, Science, Space, Venus} = Tag;

function getIcon(tag: Tag) {
    switch (tag) {
        case Animal:
            return '🐶';
        case Building:
            return '🏛️';
        case City:
            return '🌆';
        case Earth:
            return '🌎';
        case Energy:
            return '⚡';
        case Tag.Event:
            return '⬇️';
        case Jovian:
            return 'J';
        case Microbe:
            return '🐛';
        case Plant:
            return '🍂';
        case Science:
            return '⚛️';
        case Space:
            return '✴️';
        case Venus:
            return 'V';
    }
}

export const getTagColor = (tag: Tag) => {
    switch (tag) {
        case Animal:
            return 'brown';
        case Building:
            return 'brown';
        case City:
            return '#333333';
        case Earth:
            return 'darkgreen';
        case Energy:
            return 'white';
        case Tag.Event:
            return 'gold';
        case Jovian:
            return 'purple';
        case Microbe:
            return 'green';
        case Plant:
            return 'darkgreen';
        case Science:
            return 'white';
        case Space:
            return 'white';
        case Venus:
            return 'lightblue';
    }
};

export const getTagBackgroundColor = (tag: Tag) => {
    switch (tag) {
        case Animal:
            return 'darkgreen';
        case Building:
            return '#d7d7d7';
        case City:
            return '#C8B3C5';
        case Earth:
            return 'lightblue';
        case Energy:
            return 'purple';
        case Tag.Event:
            return 'black';
        case Jovian:
            return 'darkgray';
        case Microbe:
            return 'white';
        case Plant:
            return 'lightgreen';
        case Science:
            return 'darkgray';
        case Space:
            return 'black';
        case Venus:
            return 'lightblue';
    }
};

export const getOuterBackgroundColor = (tag: Tag) => {
    switch (tag) {
        case Earth:
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
