import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {Box} from './box';
import {CardContext} from './card/Card';
import {CardActions} from './card/CardActions';

export const PlayerCardActions = ({player}: {player: PlayerState}) => {
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const actionGuard = new ActionGuard(state, player.username);

    return (
        <>
            {player.playedCards
                .filter(card => card.action)
                .map(card => {
                    return (
                        <Box
                            key={`card-actions-${card.name}`}
                            marginBottom="8px"
                            textAlign="center"
                        >
                            <CardActions
                                card={card}
                                cardOwner={player}
                                cardContext={CardContext.PLAYED_CARD}
                                apiClient={apiClient}
                                actionGuard={actionGuard}
                                useCardName
                            />
                        </Box>
                    );
                })}
        </>
    );
};
