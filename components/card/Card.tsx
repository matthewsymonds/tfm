import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {CardActions} from 'components/card/CardActions';
import {CardContextButton} from 'components/card/CardContextButton';
import {CardCost} from 'components/card/CardCost';
import {CardEffects} from 'components/card/CardEffects';
import {CardIconography} from 'components/card/CardIconography';
import {CardRequirement} from 'components/card/CardRequirement';
import {CardStoredResources} from 'components/card/CardStoredResources';
import {CardTags} from 'components/card/CardTags';
import {CardVictoryPoints} from 'components/card/CardVictoryPoints';
import {CardType} from 'constants/card-types';
import {AppContext} from 'context/app-context';
import {Card as CardModel} from 'models/card';
import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 300;

export const DisabledTooltip = styled.div`
    border-radius: 3px;
    background-color: #fdc7bc;
    color: #111111;
    border: 1px solid red;
    padding: 8px;
    font-size: 11px;
`;

const CardBase = styled.div<{isSelected: boolean | undefined}>`
    width: ${CARD_WIDTH}px;
    height: ${CARD_HEIGHT}px;
    border-radius: 3px;
    border: 1px solid black;
    box-shadow: ${props => (props.isSelected === true ? '0px 0px 6px 2px hsl(0 0% 54%);' : 'none')};
    opacity: ${props => (props.isSelected === false ? '0.5' : '1')};
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #f6d0b1;
`;
export type CardProps = {
    card: CardModel;
    cardContext?: CardContext;
    cardOwner?: PlayerState;
    button?: React.ReactNode;
    isSelected?: boolean;
};

export enum CardContext {
    NONE = 'none', // just show the card with no clickable buttons
    SELECT_TO_BUY = 'selectToBuy', // if selecting to buy (ie drafting)
    SELECT_TO_PLAY = 'selectToPlay', // if selecting to play (ie in hand)
    SELECT_TO_KEEP = 'selectToKeep', // if selecting to keep (eg draw 4 keep 2)
    SELECT_TO_DISCARD = 'selectToDiscard', // if selecting to discard (could this be merged with selectToDiscard?)
    PLAYED_CARD = 'playedCard', // if card is played, actions are usable
}

const CardTopBar = styled.div`
    padding: 4px;
    display: flex;
    align-items: center;
`;

const CardText = styled.span`
    margin: 4px;
    font-size: 11px;
`;

function getCardTitleColorForType(type: CardType) {
    switch (type) {
        case CardType.ACTIVE:
            return 'blue';
        case CardType.EVENT:
            return 'red';
        case CardType.AUTOMATED:
            return 'green';
        case CardType.PRELUDE:
        case CardType.CORPORATION:
            return 'black';
        default:
            throw spawnExhaustiveSwitchError(type);
    }
}

const CardTitleBar = styled.div<{type: CardType}>`
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    padding: 8px 0;
    background-color: ${props => getCardTitleColorForType(props.type)};
    color: white;
    text-align: center;
`;

export const Card: React.FC<CardProps> = ({
    card,
    cardContext = CardContext.NONE,
    cardOwner,
    isSelected,
}) => {
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const actionGuard = new ActionGuard(
        state,
        cardOwner?.username ?? loggedInPlayer?.username ?? state.players[0].username // fallback to first player for storybook
    );
    const apiClient = new ApiClient(dispatch);

    return (
        <CardBase isSelected={isSelected}>
            <CardTopBar>
                <CardCost card={card} loggedInPlayer={loggedInPlayer} cardContext={cardContext} />
                <CardRequirement card={card} />
                <CardTags card={card} />
            </CardTopBar>
            <CardTitleBar type={card.type}>{card.name}</CardTitleBar>
            {card.text && <CardText>{card.text}</CardText>}
            <CardEffects card={card} />
            <CardActions
                card={card}
                cardOwner={cardOwner}
                cardContext={cardContext}
                apiClient={apiClient}
                actionGuard={actionGuard}
            />
            <CardIconography card={card} />
            <CardVictoryPoints card={card} />
            <Flex flex="auto"></Flex>
            <CardContextButton
                card={card}
                cardContext={cardContext}
                actionGuard={actionGuard}
                apiClient={apiClient}
                loggedInPlayer={loggedInPlayer}
            />
            <CardStoredResources card={card} />
        </CardBase>
    );
};
``;
