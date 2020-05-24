import {useState, MouseEvent, useEffect} from 'react';
import {useSession} from './use-session';
import {makeGetCall} from 'api-calls';

type Game = {
    name: string;
};

export const useUserGames = (username: string): Game[] => {
    const [games, setGames] = useState<Game[]>([]);
    const {session} = useSession();

    useEffect(() => {
        if (session.username) {
            loadUserGames(session.username);
        }
    }, [session.username]);

    async function loadUserGames(player: string) {
        const apiPath = '/api/users/games/' + player;

        const result = await makeGetCall(apiPath);
        setGames(result.games);
    }

    return games;
};
