import {makePostCall} from 'api-calls';
import {Box, Flex} from 'components/box';
import {Input, SubmitInput} from 'components/input';
import {Deck} from 'constants/card-types';
import {useInput} from 'hooks/use-input';
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
    const [isDraftingEnabled, setIsDraftingEnabled] = useState(true);
    const [isCorporateEraEnabled, setIsCorporateEraEnabled] = useState(true);
    const [isVenusNextEnabled, setIsVenusNextEnabled] = useState(true);
    const [isPreludeEnabled, setIsPreludeEnabled] = useState(true);
    const [isColoniesEnabled, setIsColoniesEnabled] = useState(true);
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

        const decks: Deck[] = [Deck.BASIC];
        if (isCorporateEraEnabled) {
            decks.push(Deck.CORPORATE);
            // Doesn't make much sense to play with expansions if corporate era is off.
            if (isVenusNextEnabled) {
                decks.push(Deck.VENUS);
            }
            if (isPreludeEnabled) {
                decks.push(Deck.PRELUDE);
            }
            if (isColoniesEnabled) {
                decks.push(Deck.COLONIES);
            }
        }

        const result = await makePostCall('/api/games', {
            name: gameName,
            players,
            options: {
                isDraftingEnabled,
                decks,
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
                <Flex flexDirection="column" margin="16px 0">
                    <h3>Options</h3>
                    <label style={{marginLeft: 4}}>
                        <input
                            type="checkbox"
                            checked={isCorporateEraEnabled}
                            onChange={e => setIsCorporateEraEnabled(e.target.checked)}
                        />
                        Corporate Era
                    </label>
                    <label style={{marginLeft: 4}}>
                        <input
                            type="checkbox"
                            checked={isDraftingEnabled}
                            onChange={e => setIsDraftingEnabled(e.target.checked)}
                        />
                        Draft variant
                    </label>
                    <label style={{marginLeft: 4}}>
                        <input
                            type="checkbox"
                            disabled={!isCorporateEraEnabled}
                            checked={isCorporateEraEnabled && isVenusNextEnabled}
                            onChange={e => setIsVenusNextEnabled(e.target.checked)}
                        />
                        Venus Next
                    </label>
                    <label style={{marginLeft: 4}}>
                        <input
                            type="checkbox"
                            disabled={!isCorporateEraEnabled}
                            checked={isCorporateEraEnabled && isPreludeEnabled}
                            onChange={e => setIsPreludeEnabled(e.target.checked)}
                        />
                        Prelude
                    </label>
                    <label style={{marginLeft: 4}}>
                        <input
                            type="checkbox"
                            disabled={!isCorporateEraEnabled}
                            checked={isCorporateEraEnabled && isColoniesEnabled}
                            onChange={e => setIsColoniesEnabled(e.target.checked)}
                        />
                        Colonies
                    </label>
                </Flex>
                <Box marginTop="32px">
                    <SubmitInput value="Create game" />
                </Box>
            </form>
        </div>
    );
}
