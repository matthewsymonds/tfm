import {Box, Flex} from 'components/box';
import {SwitchColors} from 'components/log-panel';
import {Switcher} from 'components/switcher';
import {useSession} from 'hooks/use-session';
import {useUserGames} from 'hooks/use-user-games';
import {useRouter} from 'next/dist/client/router';
import Link from 'next/link';
import styled from 'styled-components';

const Username = styled.div``;

export default function Index() {
    const router = useRouter();
    const {session, loading} = useSession();
    const userGames = useUserGames(session.username);
    function goToNewGame() {
        router.push('/new-game');
    }
    if (loading) {
        return null;
    }
    return (
        <div>
            <Flex marginBottom="6px" width="100%" justifyContent="space-between">
                <Box marginLeft="6px" display="inline-block">
                    <Username>{session.username}</Username>
                </Box>
                <Link href="/logout">
                    <a>Log out</a>
                </Link>
            </Flex>
            {userGames.length > 0 && (
                <Switcher tabs={['Games']}>
                    <Box
                        marginBottom="16px"
                        background="#ddd"
                        border="2px solid gray"
                        maxHeight="400px"
                        overflowY="auto"
                    >
                        <SwitchColors>
                            {userGames.map(game => {
                                return (
                                    <Box key={'overview-' + game.name} padding="4px">
                                        <Link href="/games/[name]" as={getGameLink(game.name)}>
                                            <a>{game.name}</a>
                                        </Link>
                                        <div>{game.players.length} players</div>
                                    </Box>
                                );
                            })}
                        </SwitchColors>
                    </Box>
                </Switcher>
            )}
            <button onClick={() => goToNewGame()}>New game</button>
        </div>
    );
}

function getGameLink(name: string) {
    return '/games/' + name;
}
