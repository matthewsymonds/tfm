import {ApiClient} from 'api-client';
import {colors} from 'components/ui';
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
    isCorporation?: boolean;
}

const CardBase = styled.div<CardBaseProps>`
    padding: 10px;
    margin: 10px;
    display: flex;
    position: relative;
    flex-direction: column;
    box-shadow: none;
    background-color: ${props =>
        props.selected ? '#e9ffe7' : props.isCorporation ? colors.CORPORATION_BG : colors.CARD_BG};
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

    const thisRound = useTypedSelector(state => state.common.generation);

    const options = card.action.choice || [card.action];

    if (card.lastRoundUsedAction === thisRound) {
        return (
            <CardText>
                <em>Used action this round</em>
            </CardText>
        );
    }

    const apiClient = new ApiClient(dispatch);

    function playAction(card: Card, action: Action, payment?: PropertyCounter<Resource>) {
        apiClient.playCardActionAsync({parent: card, payment});
    }

    function renderPlayActionButton(option: Action, canPlay: boolean) {
        if (!isLoggedInPlayer) {
            return null;
        }

        const handleConfirmPayment = (
            payment: PropertyCounter<Resource> = {[Resource.MEGACREDIT]: option.cost ?? 0}
        ) => {
            playAction(card, option, payment);
        };

        // TODO: This naively doesn't skip the payment popover e.g. if user has none of the
        // accepted alternate payment resources
        const doesActionRequireUserInput =
            option.acceptedPayment ||
            (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0);

        if (option.cost && doesActionRequireUserInput) {
            return (
                <PaymentPopover cost={option.cost} onConfirmPayment={handleConfirmPayment}>
                    <button disabled={!canPlay}>
                        {options.length === 1 ? 'Play Action' : option.text}
                    </button>
                </PaymentPopover>
            );
        } else {
            return (
                <button disabled={!canPlay} onClick={() => handleConfirmPayment()}>
                    {options.length === 1 ? 'Play Action' : option.text}
                </button>
            );
        }
    }

    return (
        <React.Fragment>
            {options.map((option, index) => {
                let canPlay: boolean;
                let reason: string | undefined;
                if (isLoggedInPlayer) {
                    [canPlay, reason] = context.canPlayCardAction(option, state, card);
                } else {
                    [canPlay, reason] = context.canPlayCardActionInSpiteOfUI(option, state, card);
                }
                return (
                    <React.Fragment key={index}>
                        {renderPlayActionButton(option, canPlay)}
                        {!canPlay && reason ? (
                            <CardText>
                                <em>{reason}</em>
                            </CardText>
                        ) : null}
                    </React.Fragment>
                );
            })}
        </React.Fragment>
    );
}

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
    const {content, width = 240, selected, onClick, isHidden} = props;
    if (!content) return null;
    const {name, text, action, effects, cost, tags} = content;
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
    const discountedCost = getDiscountedCardCost(content, player);
    const effect = effects[0];
    const store = useStore();
    const victoryPoints = getCardVictoryPoints(content.victoryPoints, store.getState(), content);
    const isCorporation = content.type === CardType.CORPORATION;

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
        <CardBase width={width} onClick={onClick} selected={selected} isCorporation={isCorporation}>
            {isHidden ? <BackOfCard /> : innerContents}
        </CardBase>
    );
};
