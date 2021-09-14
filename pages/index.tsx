import {setGame} from 'actions';
import {getPath} from 'client-server-shared/get-path';
import {SwitchColors} from 'components/action-log';
import {Box, Flex} from 'components/box';
import Router, {useRouter} from 'next/dist/client/router';
import Link from 'next/link';
import {useStore} from 'react-redux';

export default function Index(props) {
    const {userGames, session} = props;
    const router = useRouter();
    const store = useStore();
    function goToNewGame() {
        router.push('/new-game');
    }
    return (
        <Box margin="16px">
            <Flex marginBottom="8px" width="100%" justifyContent="space-between">
                <Box display="inline-block">
                    <span style={{color: 'white'}}>{session.username}</span>
                </Box>
                <Link href="/logout">
                    <span style={{color: 'white'}}>Log out</span>
                </Link>
            </Flex>
            {userGames.length > 0 && (
                <Box
                    marginBottom="8px"
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
                                        <a
                                            onClick={() => {
                                                store.dispatch(setGame(null));
                                            }}
                                        >
                                            {game.name}
                                        </a>
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
        </Box>
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
