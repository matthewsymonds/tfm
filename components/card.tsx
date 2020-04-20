import styled from 'styled-components';
import {Card} from '../models/card';
import {TagsComponent} from './tags';

const Name = styled.div`
    margin: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Text = styled.div`
    margin: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
`;

interface CardBaseProps {
    width: number;
    onClick?: () => void;
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
    border: 1px solid gray;
    border-radius: 2px;
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
    onClick?: () => void;
    width: number;
}

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
    const {content, width, selected, onClick} = props;
    const {name, text, action, effect, cost, tags} = content;

    return (
        <CardBase width={width} onClick={onClick}>
            <Selection selected={selected || false}>
                <TagsComponent tags={tags} />
                <Name>{name}</Name>
                {typeof cost === 'number' && <Text>Cost: {cost}€</Text>}
                {text && <Text>{text}</Text>}
                {effect?.text && <Text>{effect.text}</Text>}
                {action?.text && <Text>{action.text}</Text>}
                {props.children}
            </Selection>
        </CardBase>
    );
};
