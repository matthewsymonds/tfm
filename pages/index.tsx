import {getPath} from 'client-server-shared/get-path';
import {SwitchColors} from 'components/action-log';
import {Box, Flex} from 'components/box';
import Router, {useRouter} from 'next/dist/client/router';
import Link from 'next/link';
import styled from 'styled-components';

const Username = styled.div``;

export default function Index(props) {
    const {userGames, session} = props;
    const router = useRouter();
    function goToNewGame() {
        router.push('/new-game');
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
                                    <div>
                                        {game.players.length} player
                                        {game.players.length !== 1 ? 's' : ''}
                                    </div>
                                </Box>
                            );
                        })}
                    </SwitchColors>
                </Box>
            )}
            <button onClick={() => goToNewGame()}>New game</button>
        </div>
    );
}

function getGameLink(name: string) {
    return '/games/' + name;
}

Index.getInitialProps = async ctx => {
    const {isServer, req, res} = ctx;

    const headers = isServer ? req.headers : {};
    try {
        const response = await fetch(getUserGamesPath(isServer, req, headers), {
            headers,
        });
        const result = await response.json();
        return {userGames: result.games};
    } catch (error) {
        if (isServer) {
            res.writeHead(302, {
                Location: '/login',
            });
            res.end();
        } else {
            Router.push('/login');
            return {};
        }
    }
};

function getUserGamesPath(isServer, req, headers) {
    const path = '/api/games';
    return getPath(path, isServer, req, headers);
}
