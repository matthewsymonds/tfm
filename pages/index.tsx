import {useSession} from '../hooks/use-session';
import {useUserGames} from '../hooks/use-user-games';
import Link from 'next/link';

export default function Index() {
    const {session, loading} = useSession();
    const [userGames, newGame] = useUserGames(session.username);
    if (loading) {
        return null;
    }
    return (
        <div>
            <div>Hello {session.username}!</div>
            <Link href="/logout">Log out</Link>
            <ul>
                User games:
                {userGames.map(game => {
                    return <li>{game.name}</li>;
                })}
            </ul>
            <button onClick={newGame}>New game</button>
        </div>
    );
}
