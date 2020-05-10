import {useState, MouseEvent} from 'react';

type Game = {
    name: string;
};

export const useUserGames = (username: string): [Game[], (event: unknown) => void] => {
    const [games, setGames] = useState<Game[]>([]);

    const newGame = event => {
        setGames([...games, {name: 'new game'}]);
    };

    return [games, newGame];
};
