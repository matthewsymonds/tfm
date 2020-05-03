import {MouseEvent} from 'react';
import styled from 'styled-components';
import {Card} from '../models/card';
import {TagsComponent} from './tags';
import {getDiscountedCardCost} from '../context/app-context';
import {useLoggedInPlayer} from '../selectors/players';
import {Amount} from '../constants/action';
import {RootState} from '../reducer';
import {VARIABLE_AMOUNT_SELECTORS} from '../selectors/variable-amount';
import {useStore} from 'react-redux';

export const CardText = styled.div`
    margin: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
`;

const VictoryPoints = styled.div`
    margin-bottom: 0;
    margin-top: auto;
    padding: 8px;
    width: 18px;
    height: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: sans-serif;
    border-radius: 50%;
    border: 1px solid darkred;
`;

const CardNote = styled(CardText)`
    margin: 4px;
    font-size: 16px;
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
    margin: 10px;
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

function getVictoryPoints(amount: Amount | undefined, state: RootState, card: Card) {
    if (!amount) return 0;
    if (typeof amount === 'number') return amount;

    const selector = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!selector) return 0;

    return selector(state, card) || 0;
}

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
    const {content, width, selected, onClick} = props;
    const {name, text, action, effects, cost, tags} = content;
    const player = useLoggedInPlayer();
    const discountedCost = getDiscountedCardCost(content, player);
    const effect = effects[0];
    const store = useStore();
    const victoryPoints = getVictoryPoints(content.victoryPoints, store.getState(), content);
    return (
        <CardBase width={width} onClick={onClick}>
            <Selection selected={selected || false}>
                <TagsComponent tags={tags}>
                    <div>{name}</div>
                </TagsComponent>
                {typeof cost === 'number' && (
                    <CardText>
                        Cost: {discountedCost}€
                        {discountedCost !== cost && (
                            <CardNote>
                                <em>Originally: {cost}€</em>
                            </CardNote>
                        )}
                    </CardText>
                )}
                {text && <CardText>{text}</CardText>}
                {effect?.text && <CardText>{effect.text}</CardText>}
                {action?.text && <CardText>{action.text}</CardText>}
                {props.children}
                {victoryPoints ? (
                    <VictoryPoints>
                        <span>{victoryPoints}</span>
                    </VictoryPoints>
                ) : null}
            </Selection>
        </CardBase>
    );
};
