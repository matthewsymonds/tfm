import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState} from 'reducer';
import {getPlayedCards} from 'selectors/get-played-cards';
import {Box} from './box';
import {CardContext} from './card/Card';
import {CardActions} from './card/CardActions';

export const PlayerCardActions = ({player}: {player: PlayerState}) => {
    const apiClient = useApiClient();

    return (
        <React.Fragment>
            {getPlayedCards(player)
                .filter(card => card.action)
                .map(card => {
                    return (
                        <Box
                            key={`card-actions-${card.name}`}
                            width="fit-content"
                            border="1px solid #aaa"
                            marginBottom="6px"
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
