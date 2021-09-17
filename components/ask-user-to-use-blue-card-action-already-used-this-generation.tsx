import {Card} from 'models/card';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getPlayedCards} from 'selectors/get-played-cards';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {Box, Flex} from './box';
import {CardContext} from './card/Card';
import {CardActions} from './card/CardActions';
import {colors} from './ui';

const PlayerCardAction = ({card, player}: {card: Card; player: PlayerState}) => {
    return (
        <Box
            width="fit-content"
            margin="4px"
            borderRadius="3px"
            background={colors.LIGHT_BG}
            style={{color: 'black', fontWeight: 700}}
        >
            <CardActions
                card={card}
                cardOwner={player}
                cardContext={CardContext.PLAYED_CARD}
                showCardName
                canPlayInSpiteOfUI
            />
        </Box>
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
    return (
        // HACK: Assume that only Viron allows repeating an action
        <AskUserToMakeChoice card={{name: 'Viron'}}>
            <Flex flexDirection="column">
                <em style={{marginBottom: 4}}>Select an action to repeat</em>
                <Flex flexWrap="wrap">{choiceButtons}</Flex>
            </Flex>
        </AskUserToMakeChoice>
    );
}
