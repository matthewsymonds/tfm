import styled from 'styled-components';
import {Card} from '../constants/card-types';
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
}

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
    const {content, width, selected} = props;
    const {name, oneTimeText, actionOrEffectText, cost, tags} = content;

    return (
        <CardBase width={width}>
            <Selection selected={selected}>
                <TagsComponent tags={tags} />
                <Name>{name}</Name>
                {typeof cost === 'number' && <Text>Cost: {cost}€</Text>}
                {oneTimeText && <Text>{oneTimeText}</Text>}
                {actionOrEffectText && <Text>{actionOrEffectText}</Text>}
                {props.children}
            </Selection>
        </CardBase>
    );
};
