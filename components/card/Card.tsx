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
import {CardText} from 'components/card/CardText';
import {CardTitleBar} from 'components/card/CardTitle';
import {CardVictoryPoints} from 'components/card/CardVictoryPoints';
import {colors} from 'components/ui';
import {AppContext} from 'context/app-context';
import {Card as CardModel} from 'models/card';
import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';

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
    border-width: 4px;
    border-style: solid;
    border-top-color: ${colors.CARD_BORDER_1};
    border-left-color: ${colors.CARD_BORDER_1};
    border-bottom-color: ${colors.CARD_BORDER_2};
    border-right-color: ${colors.CARD_BORDER_2};
    box-shadow: ${props => (props.isSelected === true ? '0px 0px 6px 2px hsl(0 0% 54%);' : 'none')};
    opacity: ${props => (props.isSelected === false ? '0.5' : '1')};
    font-family: 'Open Sans', 'Roboto', sans-serif;
    font-size: 12px;

    /* background-color: ${colors.CARD_BG} */
    position: relative;
    box-sizing: border-box;

    &:before {
        content: '';
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: hsl(15, 70%, 50%);
    }
`;

const CardTexture = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;

    &:before {
        content: '';
        position: absolute;
        height: 100%;
        width: 100%;
        filter: sepia(0.1) hue-rotate(-9deg) drop-shadow(2px 4px 6px black);
        opacity: 0.8;
        background-image: url(${require('assets/hexellence.png')});
    }
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
    PLAYED_CARD = 'playedCard', // if card is played, actions are usable
    DISPLAY_ONLY = 'displayOnly', // card does not need to be interactive
}

const MainCardText = styled(CardText)`
    position: relative;
    display: block;
    margin: 4px;
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
            <CardTexture>
                <CardTitleBar type={card.type}>{card.name}</CardTitleBar>
                <CardRequirement card={card} />
                <CardTags card={card} />
                <CardCost card={card} loggedInPlayer={loggedInPlayer} cardContext={cardContext} />
                {card.text && <MainCardText>{card.text}</MainCardText>}
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
                <Flex flex="auto" /> {/* push the button to the bottom */}
                <CardContextButton
                    card={card}
                    cardContext={cardContext}
                    actionGuard={actionGuard}
                    apiClient={apiClient}
                    loggedInPlayer={loggedInPlayer}
                />
                <CardStoredResources card={card} />
            </CardTexture>
        </CardBase>
    );
};
``;
