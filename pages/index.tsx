import {setGame} from 'actions';
import {getPath} from 'client-server-shared/get-path';
import {Box, Flex} from 'components/box';
import {Button} from 'components/button';
import {colors} from 'components/ui';
import Router, {useRouter} from 'next/dist/client/router';
import Link from 'next/link';
import React from 'react';
import {useStore} from 'react-redux';
import styled from 'styled-components';

const TitleInner = styled.h1`
    margin: 8px;
    border-radius: 8px;
    display: block;
`;

type UserGame = {
    name: string;
    players: string[];
};

export const Title = ({username}: {username?: string}) => (
    <Box>
        <Flex
            className="display"
            alignItems="center"
            borderRadius="8px"
            justifyContent="center"
            marginTop="8px"
            background={colors.DARK_ORANGE}
            width="fit-content"
        >
            <TitleInner>Terraforming Mars Online</TitleInner>
        </Flex>
        {username ? (
            <Flex
                marginTop="8px"
                className="display"
                justifyContent="space-between"
                alignItems="flex-start"
                color={colors.TEXT_LIGHT_1}
            >
                <Box>Welcome, {username}.</Box>
                <Box color={colors.LIGHT_ORANGE} cursor="pointer">
                    <Link href="/logout">
                        <InnerLink>Log Out</InnerLink>
                    </Link>
                </Box>
            </Flex>
        ) : null}
    </Box>
);

export const Container = ({children}) => {
    return (
        <Box width="calc(100% - 16px)" marginLeft="8px" marginRight="8px">
            <Flex
                width="fit-content"
                alignItems="center"
                justifyContent="center"
                margin="0 auto"
                maxWidth="100%"
                flexDirection="column"
            >
                {children}
            </Flex>
        </Box>
    );
};

export const MidContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
`;

const PageTitle = styled.h2`
    margin-top: 8px;
    margin-bottom: 0px;
    margin-left: 4px;
    color: ${colors.DARK_ORANGE};
`;

export const TitleAndButton = ({
    text,
    children,
}: {
    text: string;
    children: React.ReactChild | React.ReactChild[];
}) => {
    return (
        <Flex
            justifyContent="space-between"
            width="100%"
            marginBottom="8px"
            marginTop="8px"
            alignItems="baseline"
        >
            <PageTitle className="display">{text}</PageTitle>
            <Flex>{children}</Flex>
        </Flex>
    );
};

const UserGames = ({
    userGames,
    children,
}: {
    userGames: UserGame[];
    children: React.ReactChild | React.ReactChild[];
}) => {
    return (
        <MidContainer>
            <TitleAndButton text="Games">{children}</TitleAndButton>
            <Flex flexDirection="column" width="100%" maxWidth="400px">
                {userGames.map((game, index) => (
                    <UserGame
                        index={index}
                        userGame={game}
                        key={game.name}
                        numGames={userGames.length}
                    />
                ))}
            </Flex>
        </MidContainer>
    );
};

const UserGameBase = styled(Box)`
    &:hover {
        background: ${colors.LIGHT_ORANGE};
    }
`;

export const InnerLink = styled.a`
    color: unset;
    text-decoration-color: ${colors.LIGHT_ORANGE};
`;

const UserGame = ({
    userGame,
    index,
    numGames,
}: {
    userGame: UserGame;
    index: number;
    numGames: number;
}) => {
    const store = useStore();

    return (
        <Link href="/games/[name]" as={getGameLink(userGame.name)}>
            <InnerLink
                onClick={() => {
                    store.dispatch(setGame(null));
                }}
            >
                <UserGameBase
                    borderTopLeftRadius={index === 0 ? '6px' : 0}
                    borderTopRightRadius={index === 0 ? '6px' : 0}
                    borderBottomRightRadius={index === numGames - 1 ? '6px' : 0}
                    borderBottomLeftRadius={index === numGames - 1 ? '6px' : 0}
                    borderStyle="solid"
                    borderColor="transparent"
                    borderWidth="2px"
                    padding="6px"
                    marginBottom="2px"
                    background={colors.LIGHT_3}
                    color={colors.MAIN_BG}
                    className="display"
                    fontSize="18px"
                    fontWeight="bold"
                    cursor="pointer"
                >
                    {userGame.name}
                </UserGameBase>
            </InnerLink>
        </Link>
    );
};

export default function Index(props) {
    const {userGames, session} = props;

    const router = useRouter();
    function goToNewGame() {
        router.push('/new-game');
    }

    return (
        <Container>
            <Title username={session.username} />
            <UserGames userGames={userGames}>
                <Button onClick={goToNewGame}>New Game</Button>
            </UserGames>
        </Container>
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
