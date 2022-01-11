import {makePostCall} from 'api-calls';
import {getPath} from 'client-server-shared/get-path';
import {Box} from 'components/box';
import {Button} from 'components/button';
import {Input} from 'components/input';
import {MaybeVisible} from 'components/maybe-visible';
import {colors} from 'components/ui';
import {useInput} from 'hooks/use-input';
import Router, {useRouter} from 'next/dist/client/router';
import Link from 'next/link';
import {Container, InnerLink, MidContainer, Title, TitleAndButton} from 'pages';
import {InnerContainer} from 'pages/new-game';
import {useCallback, useState} from 'react';
import {ErrorText} from './signup';

export const AlternativeLink = ({href, text}: {href: string; text: string}) => {
    return (
        <Box color={colors.TEXT_LIGHT_1} marginTop="8px" cursor="pointer" className="display">
            <Link href={href} passHref>
                <InnerLink>
                    <em>{text}</em>
                </InnerLink>
            </Link>
        </Box>
    );
};

export default function Login() {
    const [username, updateUsername] = useInput('');
    const [password, updatePassword] = useInput('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = useCallback(
        async event => {
            event.preventDefault();
            const result = await makePostCall('/api/sessions', {
                username,
                password,
            });
            if (result.error) {
                setError(result.error);
            } else {
                router.push('/');
            }
        },
        [username, password]
    );

    return (
        <Container>
            <MidContainer>
                <Title />
                <TitleAndButton text="Log in">
                    <AlternativeLink href={'/signup'} text="Sign up instead" />
                </TitleAndButton>

                <InnerContainer>
                    <MaybeVisible visible={!!error}>
                        <ErrorText>
                            <em>{error}</em>
                        </ErrorText>
                    </MaybeVisible>

                    <form onSubmit={handleSubmit}>
                        <Input
                            autoFocus
                            name="username"
                            autoComplete="username"
                            value={username}
                            onChange={updateUsername}
                        />
                        <Input
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={updatePassword}
                        />
                        <Box marginTop="32px" marginBottom="4px" marginLeft="4px" width="100px">
                            <Button type="submit" variant="bordered">
                                Log in
                            </Button>
                        </Box>
                    </form>
                </InnerContainer>
            </MidContainer>
        </Container>
    );
}

Login.getInitialProps = async ctx => {
    const {isServer, req, res} = ctx;

    const headers = isServer ? req.headers : {};
    try {
        const response = await fetch(getSessionPath(isServer, req, headers), {
            headers,
        });
        const result = await response.json();
        // If we get here, the user is logged in. Time to take them to the index!
        if (isServer) {
            res.writeHead(302, {
                Location: '/',
            });
            res.end();
            return {};
        } else {
            Router.push('/');
            return {};
        }
    } catch (error) {
        return {};
    }
};

function getSessionPath(isServer, req, headers) {
    const path = '/api/sessions';
    return getPath(path, isServer, req, headers);
}
