import {Card} from 'models/card';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getPlayedCards} from 'selectors/get-played-cards';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {Box} from './box';
import {CardContext} from './card/Card';
import {CardActions} from './card/CardActions';

const PlayerCardAction = ({card, player}: {card: Card; player: PlayerState}) => {
    return (
        <React.Fragment>
            <Box width="fit-content" margin="4px" border="1px solid #aaa" borderRadius="3px">
                <CardActions
                    card={card}
                    cardOwner={player}
                    cardContext={CardContext.PLAYED_CARD}
                    useCardName
                    canPlayInSpiteOfUI
                />
            </Box>
        </React.Fragment>
    );
};

export function AskUserToUseBlueCardActionAlreadyUsedThisGeneration({
    player,
}: {
    player: PlayerState;
}) {
    const state = useTypedSelector(state => state);
    const cards = getPlayedCards(player).filter(card => {
        return (
            card.action &&
            !card.action.useBlueCardActionAlreadyUsedThisGeneration &&
            card.lastRoundUsedAction === state.common.generation
        );
    });
    const choiceButtons = cards.map((card, index) => {
        return <PlayerCardAction card={card} player={player} key={index}></PlayerCardAction>;
    });
    return <AskUserToMakeChoice>{choiceButtons}</AskUserToMakeChoice>;
}
