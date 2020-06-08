import {Input, SubmitInput} from 'components/input';
import {useInput} from 'hooks/use-input';
import {Centered} from 'components/centered';
import Link from 'next/link';
import {useSession} from 'hooks/use-session';
import {useState, ReactElement, FormEvent, useEffect} from 'react';
import {makePostCall} from 'api-calls';
import {useRouter} from 'next/router';

export default function NewGame() {
    const {session, loading} = useSession();

    const [gameName, updateGameName] = useInput('');
    const [numPlayers, updateNumPlayers] = useInput(2);
    const router = useRouter();

    const [usernames, setUsernames] = useState<string[]>([]);

    const [error, setError] = useState('');

    function setUsername(index: number, username: string) {
        const replacement = [...usernames];
        replacement[index] = username;
        setUsernames(replacement);
    }

    useEffect(() => {
        if (session.username) {
            setUsername(0, session.username);
        }
    }, [session.username]);

    const usernameInputs: ReactElement[] = [];

    for (let i = 0; i < numPlayers; i++) {
        usernameInputs.push(
            <Input
                key={i}
                name={`Player ${i + 1}`}
                disabled={i === 0}
                value={usernames[i]}
                onChange={(event: FormEvent<HTMLInputElement>) => {
                    event.preventDefault();
                    const eventTarget = event.target as HTMLInputElement;
                    setUsername(i, eventTarget.value);
                }}
            />
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const players = usernames;

        const result = await makePostCall('/api/games', {
            name: gameName,
            players: players.slice(0, numPlayers),
        });
        if (result.error) {
            setError(result.error);
        } else {
            router.push('/games/' + result.game.name);
        }
    }
    if (loading) return null;

    return (
        <Centered>
            <div>
                <h3>New Game</h3>
                <Link href="/">
                    <a>Back</a>
                </Link>
                {error ? (
                    <div>
                        <em>{error}</em>
                    </div>
                ) : null}
                <form onSubmit={handleSubmit}>
                    <Input
                        autoFocus
                        name="Game Name"
                        autoComplete="off"
                        value={gameName}
                        onChange={updateGameName}
                    />
                    <div>
                        <em>Letters, numbers, hyphens, underscores</em>
                    </div>
                    <Input
                        type="number"
                        name="Players"
                        min={1}
                        max={5}
                        value={numPlayers}
                        onChange={updateNumPlayers}
                    />
                    {usernameInputs}
                    <SubmitInput />
                </form>
            </div>
        </Centered>
    );
}
