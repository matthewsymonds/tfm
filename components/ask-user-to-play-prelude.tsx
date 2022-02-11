import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {isActiveRound} from 'selectors/is-active-round';
import {Box, Flex} from './box';
import {Card, CardContext} from './card/Card';
import {colors} from './ui';

export function AskUserToPlayPrelude({player}: {player: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard(player.username);
    const handleSkip = () => {
        apiClient.skipActionAsync();
    };

    const playableCards = player.preludes.filter(prelude => {
        const card = getCard(prelude);
        return actionGuard.canPlayCard(card)[0];
    });

    const activeRound = useTypedSelector(state => isActiveRound(state));

    if (!activeRound) {
        return null;
    }

    const preludesEls = (
        <Flex justifyContent="center" flexWrap="wrap">
            {player.preludes.map(prelude => {
                const card = getCard(prelude);
                return (
                    <Box marginRight="8px" marginBottom="8px" key={card.name}>
                        <Card card={card} cardContext={CardContext.SELECT_TO_PLAY} />
                    </Box>
                );
            })}
        </Flex>
    );

    if (playableCards.length === 0) {
        return (
            <Flex alignItems="center" flexDirection="column">
                <h2 style={{color: '#eee'}}>
                    {player.choosePrelude
                        ? 'Cannot play any of these preludes'
                        : 'No more playable preludes.'}
                </h2>
                <button onClick={handleSkip} style={{marginTop: '8px', marginBottom: '24px'}}>
                    Skip remaining preludes
                </button>
                {preludesEls}
            </Flex>
        );
    }

    return (
        <Box color={colors.LIGHT_2} className="display" marginLeft="16px" marginRight="16px">
            <h3 style={{color: '#eee'}}>
                {player.choosePrelude
                    ? 'Choose the prelude you would like to play.'
                    : 'Choose which prelude to play next.'}
            </h3>
            {preludesEls}
        </Box>
    );
}
