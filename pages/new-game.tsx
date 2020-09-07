import {makePostCall} from 'api-calls';
import {Input, SubmitInput} from 'components/input';
import {useInput} from 'hooks/use-input';
import {useSession} from 'hooks/use-session';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {FormEvent, ReactElement, useEffect, useState} from 'react';
import {shuffle} from 'initial-state';
import {MaybeVisible} from 'components/maybe-visible';
import {Box} from 'components/box';

export default function NewGame(props) {
    const {session} = props;
    const [gameName, updateGameName] = useInput('');
    const [numPlayers, updateNumPlayers] = useInput(2);
    const router = useRouter();

    const [usernames, setUsernames] = useState<string[]>([session.username]);

    const [error, setError] = useState('');

    function setUsername(index: number, username: string) {
        const replacement = [...usernames];
        replacement[index] = username;
        setUsernames(replacement);
    }

    const usernameInputs: ReactElement[] = [];

    for (let i = 0; i < numPlayers; i++) {
        usernameInputs.push(
            <>
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
                <MaybeVisible key={'error-' + i} visible={!!error && !!i}>
                    <em>Double-check username</em>
                </MaybeVisible>
            </>
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const players = usernames;

        const result = await makePostCall('/api/games', {
            name: gameName,
            players: shuffle(players.slice(0, numPlayers)),
        });
        if (result.error) {
            setError(result.error);
        } else {
            router.push('/games/' + result.game.name);
        }
    }

    return (
        <div>
            <h3>New Game</h3>
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
                <MaybeVisible visible={!!error}>
                    <Box marginTop="4px">
                        <em>May only contain letters, numbers, hyphens, underscores</em>
                    </Box>
                </MaybeVisible>
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
    );
}
