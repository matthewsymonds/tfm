import {Flex} from 'components/box';
import {CardActions} from 'components/card/CardActions';
import {CardContextButton} from 'components/card/CardContextButton';
import {CardCost} from 'components/card/CardCost';
import {CardEffects} from 'components/card/CardEffects';
import {BaseActionIconography} from 'components/card/CardIconography';
import {CardRequirement} from 'components/card/CardRequirement';
import {CardStoredResources} from 'components/card/CardStoredResources';
import {CardTags} from 'components/card/CardTags';
import {CardText} from 'components/card/CardText';
import {CardTitleBar} from 'components/card/CardTitle';
import {CardVictoryPoints} from 'components/card/CardVictoryPoints';
import TexturedCard from 'components/textured-card';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Card as CardModel} from 'models/card';
import React, {useMemo} from 'react';
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

export type CardProps = {
    card: CardModel;
    cardContext?: CardContext;
    cardOwner?: PlayerState;
    button?: React.ReactNode;
    isSelected?: boolean;
    borderWidth?: number;
};

export enum CardContext {
    NONE = 'none', // just show the card with no clickable buttons
    SELECT_TO_BUY = 'selectToBuy', // if selecting to buy (ie drafting)
    SELECT_TO_PLAY = 'selectToPlay', // if selecting to play (ie in hand)
    PLAYED_CARD = 'playedCard', // if card is played, actions are usable
    DISPLAY_ONLY = 'displayOnly', // card does not need to be interactive
}

export const MainCardText = styled(CardText)`
    position: relative;
    display: block;
    margin: 4px;
`;

const CardInner: React.FC<CardProps> = ({
    card,
    cardContext = CardContext.NONE,
    cardOwner,
    isSelected,
    borderWidth,
}) => {
    const firstPlayerUsername = useTypedSelector(
        state => state.players[0].username
    );
    const loggedInPlayer = useLoggedInPlayer();
    const actionGuard = useActionGuard(
        cardOwner?.username ?? loggedInPlayer?.username ?? firstPlayerUsername // fallback to first player for storybook
    );
    const apiClient = useApiClient();

    return (
        <TexturedCard
            isSelected={isSelected}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            borderWidth={borderWidth}
        >
            <CardTitleBar type={card.type}>{card.name}</CardTitleBar>
            <CardRequirement card={card} />
            <CardTags card={card} />
            <CardCost
                card={card}
                loggedInPlayer={loggedInPlayer}
                cardContext={cardContext}
            />
            {card.text && <MainCardText>{card.text}</MainCardText>}
            <CardEffects card={card} showEffectText={true} />
            <CardActions
                card={card}
                cardOwner={cardOwner}
                cardContext={cardContext}
                showActionText={true}
            />
            <BaseActionIconography card={card} />
            {/* Cards with single-step actions */}
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
        </TexturedCard>
    );
};

export const Card: React.FC<CardProps> = props => {
    const logLength = useTypedSelector(state => state.logLength);
    const gameName = useTypedSelector(state => state.name);

    const memoizedCard = useMemo(
        () => <CardInner {...props} />,
        [logLength, props.isSelected, props.card.name, gameName]
    );

    return <React.Fragment>{memoizedCard}</React.Fragment>;
};

export const LiveCard: React.FC<CardProps> = CardInner;
