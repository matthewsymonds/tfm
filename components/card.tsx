import {Amount, Action} from 'constants/action';
import {CardType} from 'constants/card-types';
import {AppContext, getDiscountedCardCost} from 'context/app-context';
import {Card} from 'models/card';
import {MouseEvent, useContext, useState} from 'react';
import {useStore, useDispatch} from 'react-redux';
import {RootState, useTypedSelector, PlayerState} from 'reducer';
import {VARIABLE_AMOUNT_SELECTORS} from 'selectors/variable-amount';
import styled from 'styled-components';
import {TagsComponent} from './tags';
import React from 'react';
import PaymentPopover from './popovers/payment-popover';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {markCardActionAsPlayed, completeAction} from 'actions';
import {Box} from './box';
import {getCardVictoryPoints} from 'selectors/card';

export const CardText = styled.div`
    margin: 10px;
    margin-bottom: 16px;
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
    max-height: 350px;
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

export function CardActionElements(props: {
    player: PlayerState;
    isLoggedInPlayer: boolean;
    card: Card;
}) {
    const {player, isLoggedInPlayer, card} = props;
    const [actionPendingPayment, setActionPendingPayment] = useState<Action | null>(null);

    const context = useContext(AppContext);
    const dispatch = useDispatch();
    const store = useStore();
    const state = store.getState();
    if (!card.action) return null;

    const options = card.action.choice || [card.action];

    if (card.usedActionThisRound) {
        return (
            <CardText>
                <em>Used action this round</em>
            </CardText>
        );
    }

    function handlePlayCardAction(cardAction: Action, parentCard: Card) {
        if (
            cardAction.acceptedPayment ||
            (player.corporation?.name === 'Helion' && player.resources[Resource.HEAT] > 0)
        ) {
            setActionPendingPayment(cardAction);
        } else {
            playAction(parentCard, cardAction);
        }
    }

    function handleConfirmActionPayment(payment: PropertyCounter<Resource>, parentCard: Card) {
        if (!actionPendingPayment) {
            throw new Error('No action pending payment');
        }
        setActionPendingPayment(null);
        playAction(parentCard, actionPendingPayment, payment);
    }

    function playAction(card: Card, action: Action, payment?: PropertyCounter<Resource>) {
        dispatch(markCardActionAsPlayed(card, player.index));
        context.playAction({action, state, parent: card, payment});
        context.queue.push(completeAction(player.index));
        context.processQueue(dispatch);
    }

    return (
        <>
            {options.map((option, index) => {
                const [canPlay, reason] = context.canPlayCardAction(option, state, card);
                const canReallyPlay = canPlay && isLoggedInPlayer;

                return (
                    <React.Fragment key={index}>
                        <button
                            disabled={!canReallyPlay}
                            id={`${card.name.replace(/\s+/g, '-')}-opt-${index}`}
                            onClick={() => handlePlayCardAction(option, card)}
                        >
                            {options.length === 1 ? 'Play Action' : option.text}
                        </button>
                        {!canPlay && reason ? (
                            <CardText>
                                <em>{reason}</em>
                            </CardText>
                        ) : null}
                        {option.cost && actionPendingPayment && (
                            <PaymentPopover
                                isOpen={!!actionPendingPayment}
                                target={`${card.name.replace(/\s+/g, '-')}-opt-${index}`}
                                cost={option.cost}
                                toggle={() => setActionPendingPayment(null)}
                                onConfirmPayment={(payment: PropertyCounter<Resource>) =>
                                    handleConfirmActionPayment(payment, card)
                                }
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
}

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
    const {content, width, selected, onClick, isHidden} = props;
    const {name, text, action, effects, cost, tags} = content;
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
    const discountedCost = getDiscountedCardCost(content, player);
    const effect = effects[0];
    const store = useStore();
    const victoryPoints = getCardVictoryPoints(content.victoryPoints, store.getState(), content);
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
            <Box overflowY="auto">
                {text && <CardText>{text}</CardText>}
                {effect?.text && <CardText>{effect.text}</CardText>}
                {action?.text && <CardText>{action.text}</CardText>}
            </Box>
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
