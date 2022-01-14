import {setGame} from 'actions';
import {makePostCall} from 'api-calls';
import {checkSession} from 'check-session';
import {Box, Flex} from 'components/box';
import {Button} from 'components/button';
import {Input} from 'components/input';
import {colors} from 'components/ui';
import {Deck} from 'constants/card-types';
import {useInput} from 'hooks/use-input';
import {useRouter} from 'next/router';
import {Container, Title, TitleAndButton} from 'pages';
import React, {FormEvent, ReactElement, useState} from 'react';
import {useStore} from 'react-redux';
import styled from 'styled-components';

export const InnerContainer = ({children}: {children: React.ReactChild | React.ReactChild[]}) => {
    return (
        <Box
            width="100%"
            maxWidth="400px"
            background={colors.LIGHTEST_BG}
            className="display"
            borderRadius="4px"
            padding="4px"
            paddingTop="0px"
        >
            {children}
        </Box>
    );
};

export const ErrorText = styled.div`
    color: red;
    font-style: italic;
    margin: 8px 0;
`;

export default function NewGame(props) {
    const {session} = props;
    const [gameName, updateGameName] = useInput('');
    const [soloCorporationName, updateSoloCorporationName] = useInput('');
    const [numPlayers, updateNumPlayers] = useInput<number>(2);
    const [isDraftingEnabled, setIsDraftingEnabled] = useState(true);
    const [isCorporateEraEnabled, setIsCorporateEraEnabled] = useState(true);
    const [isVenusNextEnabled, setIsVenusNextEnabled] = useState(true);
    const [isPreludeEnabled, setIsPreludeEnabled] = useState(true);
    const [isColoniesEnabled, setIsColoniesEnabled] = useState(true);
    const [isTurmoilEnabled, setIsTurmoilEnabled] = useState(true);
    const [isTharsisEnabled, setIsTharsisEnabled] = useState(true);
    const [isHellasEnabled, setIsHellasEnabled] = useState(true);
    const [isElysiumEnabled, setIsElysiumEnabled] = useState(true);
    const numEnabledBoards = [isTharsisEnabled, isHellasEnabled, isElysiumEnabled].filter(
        Boolean
    ).length;

    const router = useRouter();

    const [usernames, setUsernames] = useState<string[]>([session.username]);

    const [error, setError] = useState('');

    const store = useStore();

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
        store.dispatch(setGame(null));
        const players = usernames;

        const decks: Deck[] = [Deck.BASIC];
        let boardNames: string[] = [];
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
            if (isTurmoilEnabled) {
                decks.push(Deck.TURMOIL);
            }
        }

        if (isTharsisEnabled) {
            boardNames.push('Tharsis');
        }
        if (isHellasEnabled) {
            boardNames.push('Hellas');
        }
        if (isElysiumEnabled) {
            boardNames.push('Elysium');
        }
        const result = await makePostCall('/api/games', {
            name: gameName,
            players,
            options: {
                isDraftingEnabled,
                decks,
                soloCorporationName,
                boardNames,
            },
        });
        if (result.error) {
            setError(result.error);
        } else {
            router.push('/games/' + result.game.name);
        }
    }

    return (
        <Container>
            <Flex alignItems="center" flexDirection="column" width="100%" maxWidth="600px">
                <Title username={session.username} />
                <TitleAndButton text="New Game">
                    <Button onClick={() => router.push('/')}>Games</Button>
                </TitleAndButton>
                <InnerContainer>
                    <form onSubmit={handleSubmit}>
                        <Input
                            autoFocus
                            name="Game name"
                            autoComplete="off"
                            value={gameName}
                            onChange={updateGameName}
                        />
                        {error && <ErrorText>{error}</ErrorText>}

                        <Input
                            type="number"
                            name="Players"
                            min={1}
                            max={5}
                            value={numPlayers}
                            onChange={updateNumPlayers}
                        />
                        {usernameInputs}
                        {numPlayers == 1 ? (
                            <Input
                                autoFocus
                                type="text"
                                name="Corporation? (Optional)"
                                required={false}
                                value={soloCorporationName}
                                onChange={updateSoloCorporationName}
                            />
                        ) : null}
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
                            <label style={{marginLeft: 4}}>
                                <input
                                    type="checkbox"
                                    disabled={!isCorporateEraEnabled}
                                    checked={isCorporateEraEnabled && isTurmoilEnabled}
                                    onChange={e => setIsTurmoilEnabled(e.target.checked)}
                                />
                                Turmoil
                            </label>
                        </Flex>
                        <Flex flexDirection="column" margin="16px 0">
                            <h3>Boards</h3>
                            <label style={{marginLeft: 4}}>
                                <input
                                    type="checkbox"
                                    disabled={isTharsisEnabled && numEnabledBoards === 1}
                                    checked={isTharsisEnabled}
                                    onChange={e => setIsTharsisEnabled(e.target.checked)}
                                />
                                Tharsis
                            </label>
                            <label style={{marginLeft: 4}}>
                                <input
                                    type="checkbox"
                                    disabled={isHellasEnabled && numEnabledBoards === 1}
                                    checked={isHellasEnabled}
                                    onChange={e => setIsHellasEnabled(e.target.checked)}
                                />
                                Hellas
                            </label>
                            <label style={{marginLeft: 4}}>
                                <input
                                    type="checkbox"
                                    disabled={isElysiumEnabled && numEnabledBoards === 1}
                                    checked={isElysiumEnabled}
                                    onChange={e => setIsElysiumEnabled(e.target.checked)}
                                />
                                Elysium
                            </label>
                        </Flex>
                        <Box marginTop="32px" marginBottom="4px" marginLeft="4px" width="120px">
                            <Button type="submit" variant="bordered">
                                Create game
                            </Button>
                        </Box>
                    </form>
                </InnerContainer>
            </Flex>
        </Container>
    );
}

NewGame.getInitialProps = checkSession;
