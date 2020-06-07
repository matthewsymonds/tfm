import {useSession} from 'hooks/use-session';
import {useUserGames} from 'hooks/use-user-games';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/dist/client/router';
import {Box} from 'components/box';

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
            <div>Hello {session.username}!</div>
            <Link href="/logout">
                <a>Log out</a>
            </Link>
            <div>
                <p>User games:</p>
                {userGames.map(game => {
                    return (
                        <>
                            <Box margin="8px">
                                <Link href={getGameLink(game.name)}>
                                    <a>{game.name}</a>
                                </Link>
                                <div>{game.players.length} players</div>
                            </Box>
                            <hr />
                        </>
                    );
                })}
            </div>
            <button onClick={() => goToNewGame()}>New game</button>
        </div>
    );
}

function getGameLink(name: string) {
    return '/games/' + name;
}
