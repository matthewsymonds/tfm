import {MouseEvent} from 'react';
import styled from 'styled-components';
import {Card} from '../models/card';
import {TagsComponent} from './tags';

export const CardText = styled.div`
    margin: 10px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
`;

interface CardBaseProps {
    width: number;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

interface SelectionProps {
    selected: boolean;
}

const Selection = styled.div<SelectionProps>`
    padding: 10px;
    background: ${props => (props.selected ? '#eeeeee' : 'none')};
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const CardBase = styled.div<CardBaseProps>`
    margin: 8px;
    box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.35);
    background: #f7f7f7;
    border-radius: 5px;
    border: 3px solid white;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: ${props => props.width}px;
    button {
        justify-self: flex-end;
    }
`;

interface CardComponentProps extends CardBaseProps {
    content: Card;
    selected?: boolean;
    width: number;
}

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
    const {content, width, selected, onClick} = props;
    const {name, text, action, effects, cost, tags} = content;
    const effect = effects[0];
    return (
        <CardBase width={width} onClick={onClick}>
            <Selection selected={selected || false}>
                <TagsComponent tags={tags}>
                    <div>{name}</div>
                </TagsComponent>
                {typeof cost === 'number' && <CardText>Cost: {cost}€</CardText>}
                {text && <CardText>{text}</CardText>}
                {effect?.text && <CardText>{effect.text}</CardText>}
                {action?.text && <CardText>{action.text}</CardText>}
                {props.children}
            </Selection>
        </CardBase>
    );
};
