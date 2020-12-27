import {makePostCall} from 'api-calls';
import {Box} from 'components/box';
import {Input, SubmitInput} from 'components/input';
import {useInput} from 'hooks/use-input';
import {shuffle} from 'initial-state';
import {useRouter} from 'next/router';
import React, {FormEvent, ReactElement, useState} from 'react';
import styled from 'styled-components';

const ErrorText = styled.div`
    color: red;
    font-style: italic;
    margin: 8px 0;
`;

export default function NewGame(props) {
    const {session} = props;
    const [gameName, updateGameName] = useInput('');
    const [numPlayers, updateNumPlayers] = useInput(2);
    const [isDraftingEnabled, setIsDraftingEnabled] = useState(false);
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
            <React.Fragment key={i}>
                <Input
                    name={`Player ${i + 1}`}
                    disabled={i === 0}
                    value={usernames[i]}
                    onChange={(event: FormEvent<HTMLInputElement>) => {
                        event.preventDefault();
                        const eventTarget = event.target as HTMLInputElement;
                        setUsername(i, eventTarget.value);
                    }}
                />
                {error && <ErrorText>Double-check username</ErrorText>}
            </React.Fragment>
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const players = usernames;

        const result = await makePostCall('/api/games', {
            name: gameName,
            players: shuffle(players.slice(0, numPlayers)),
            options: {
                isDraftingEnabled,
            },
        });
        if (result.error) {
            setError(result.error);
        } else {
            router.push('/games/' + result.game.name);
        }
    }

    return (
        <div>
            <h1>New Game</h1>

            <form onSubmit={handleSubmit}>
                <Input
                    autoFocus
                    name="Game name"
                    autoComplete="off"
                    value={gameName}
                    onChange={updateGameName}
                />
                {error && (
                    <ErrorText>May only contain letters, numbers, hyphens, underscores</ErrorText>
                )}

                <Input
                    type="number"
                    name="Players"
                    min={1}
                    max={5}
                    value={numPlayers}
                    onChange={updateNumPlayers}
                />
                {usernameInputs}
                <Box margin="16px 0">
                    <h3>Options</h3>
                    <input
                        type="checkbox"
                        id="drafting-variant"
                        checked={isDraftingEnabled}
                        onChange={e => setIsDraftingEnabled(e.target.checked)}
                    />
                    <label htmlFor="drafting-variant" style={{marginLeft: 4}}>
                        Drafting variant
                    </label>
                </Box>
                <Box marginTop="32px">
                    <SubmitInput value="Create game" />
                </Box>
            </form>
        </div>
    );
}
