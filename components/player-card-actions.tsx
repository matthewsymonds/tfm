import React from 'react';
import {PlayerState} from 'reducer';
import {getPlayedCards} from 'selectors/get-played-cards';
import {Box} from './box';
import {CardContext} from './card/Card';
import {CardActions} from './card/CardActions';

export const PlayerCardActions = ({player}: {player: PlayerState}) => {
    return (
        <React.Fragment>
            {getPlayedCards(player)
                .filter(card => card.action)
                .map(card => {
                    return (
                        <Box
                            key={`card-actions-convenience-${card.name}`}
                            width="fit-content"
                            margin="4px"
                            border="1px solid #aaa"
                            borderRadius="3px"
                        >
                            <CardActions
                                card={card}
                                cardOwner={player}
                                cardContext={CardContext.PLAYED_CARD}
                                useCardName
                            />
                        </Box>
                    );
                })}
        </React.Fragment>
    );
};
