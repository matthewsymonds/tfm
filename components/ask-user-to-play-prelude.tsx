import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
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

    const skippableCards = player.preludes.filter(prelude => {
        const card = getCard(prelude);
        return actionGuard.canSkipPrelude(card, player);
    });

    const activeRound = useTypedSelector(state => isActiveRound(state));

    if (!activeRound) {
        return null;
    }

    const preludesEls = (
        <Flex justifyContent="center" flexWrap="wrap" className="display-reset">
            {player.preludes.map(prelude => {
                const card = getCard(prelude);
                return (
                    <Box marginRight="8px" marginBottom="8px" key={card.name}>
                        <Card
                            card={card}
                            cardContext={CardContext.SELECT_TO_PLAY}
                        />
                    </Box>
                );
            })}
        </Flex>
    );

    if (skippableCards.length === player.preludes.length) {
        return (
            <Flex alignItems="center" flexDirection="column">
                <button
                    onClick={handleSkip}
                    style={{marginTop: '8px', marginBottom: '24px'}}
                >
                    Skip remaining preludes
                </button>
                {preludesEls}
            </Flex>
        );
    }

    return (
        <Box
            color={colors.LIGHT_2}
            className="display"
            marginLeft="16px"
            marginRight="16px"
        >
            <h3 className="text-lg" style={{color: '#eee'}}>
                {player.choosePrelude
                    ? 'Choose the prelude you would like to play.'
                    : 'Choose which prelude to play next.'}
            </h3>
            {preludesEls}
        </Box>
    );
}
