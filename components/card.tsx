import {Amount} from 'constants/action';
import {CardType} from 'constants/card-types';
import {AppContext, getDiscountedCardCost} from 'context/app-context';
import {Card} from 'models/card';
import {MouseEvent, useContext} from 'react';
import {useStore} from 'react-redux';
import {RootState, useTypedSelector} from 'reducer';
import {VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import styled from 'styled-components';
import {TagsComponent} from './tags';

export const CardText = styled.div`
    margin: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
`;

const VictoryPoints = styled.div`
    position: absolute;
    bottom: 8px;
    right: 8px;
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
    width?: number;
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
    box-shadow: none;
    background: #f7f7f7;
    border-radius: 5px;
    border: 2px solid #dedede;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    ${({width}) => (width ? `width: ${width}px;` : '')}
    button {
        justify-self: flex-end;
    }
`;

const CorporationCardBase = styled(CardBase)`
    flex-basis: 250px;
    flex-grow: 1;
    min-width: 200px;
    max-width: 350px;
`;

interface CardComponentProps extends CardBaseProps {
    content: Card;
    selected?: boolean;
    width?: number;
    isHidden?: boolean;
}

function getVictoryPoints(amount: Amount | undefined, state: RootState, card: Card) {
    if (!amount) return 0;
    if (typeof amount === 'number') return amount;

    const selector = VARIABLE_AMOUNT_SELECTORS[amount];
    if (!selector) return 0;

    return selector(state, card) || 0;
}

const Back = styled.div`
    display: flex;
    background: #212121;
    align-items: center;
    justify-content: center;
    height: 350px;
    border-radius: 5px;
    border: 2px solid #dedede;
`;

const BackOfCard = () => (
    <Back>
        <Circle />
    </Back>
);

const Circle = styled.div`
    border-radius: 50%;
    width: 120px;
    height: 120px;
    background: #ce7e47;
`;

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
    const {content, width, selected, onClick, isHidden} = props;
    const {name, text, action, effects, cost, tags} = content;
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
    const discountedCost = getDiscountedCardCost(content, player);
    const effect = effects[0];
    const store = useStore();
    const victoryPoints = getVictoryPoints(content.victoryPoints, store.getState(), content);
    const Base = content.type === CardType.CORPORATION ? CorporationCardBase : CardBase;
    const innerContents = (
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
            {victoryPoints ? (
                <VictoryPoints>
                    <span>{victoryPoints}</span>
                </VictoryPoints>
            ) : null}
            {props.children}
        </Selection>
    );

    return (
        <Base width={width} onClick={onClick}>
            {isHidden ? <BackOfCard /> : innerContents}
        </Base>
    );
};
