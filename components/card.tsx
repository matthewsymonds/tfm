import {completeAction, markCardActionAsPlayed} from 'actions';
import {Action} from 'constants/action';
import {CardType} from 'constants/card-types';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {AppContext, getDiscountedCardCost} from 'context/app-context';
import {Card} from 'models/card';
import React, {MouseEvent, useContext, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCardVictoryPoints} from 'selectors/card';
import styled from 'styled-components';
import {Box, Flex} from './box';
import PaymentPopover from './popovers/payment-popover';
import {TagsComponent} from './tags';

export const CardName = styled.span`
    font-size: 16px;
    font-weight: 600;
`;

export const CardText = styled.div`
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
`;

export const CardDisabledText = styled(CardText)`
    color: red;
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
    border-radius: 50%;
    border: 2px solid darkred;
    font-size: 18px;
    font-weight: 600;
    background-color: #f7f7f7;
`;

const CardNote = styled(CardText)`
    margin-left: 4px;
`;

interface CardBaseProps {
    width?: number;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
    selected?: boolean;
}

const CardBase = styled.div<CardBaseProps>`
    padding: 10px;
    margin: 10px;
    display: flex;
    position: relative;
    flex-direction: column;
    box-shadow: none;
    background-color: ${props => (props.selected ? '#e9ffe7' : '#f7f7f7')};
    border: ${props => (props.selected ? '1px solid black' : '1px solid #dedede')};
    flex-direction: column;
    max-height: 350px;
    justify-content: flex-start;
    font-size: 13px;
    ${({width}) => (width ? `width: ${width}px;` : '')}
    button {
        justify-self: flex-end;
    }
`;

const CorporationCardBase = styled(CardBase)`
    margin: 0;
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
        context.queue.push(markCardActionAsPlayed(card, player.index));
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
        <React.Fragment>
            <TagsComponent tags={tags}>
                <CardName>{name}</CardName>
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
            <Flex flex="auto" flexDirection="column" alignItems="center" justifyContent="flex-end">
                {props.children}
            </Flex>
        </React.Fragment>
    );

    return (
        <Base width={width} onClick={onClick} selected={selected}>
            {isHidden ? <BackOfCard /> : innerContents}
        </Base>
    );
};
