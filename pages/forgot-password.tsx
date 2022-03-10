import {makePostCall} from 'api-calls';
import {Box} from 'components/box';
import {Button} from 'components/button';
import {Input} from 'components/input';
import {MaybeVisible} from 'components/maybe-visible';
import {useInput} from 'hooks/use-input';
import {useRouter} from 'next/dist/client/router';
import {Container, MidContainer, Title, TitleAndButton} from 'pages';
import {InnerContainer} from 'pages/new-game';
import {useCallback, useState} from 'react';
import {redirectIfLoggedIn} from 'redirect-if-logged-in';
import {AlternativeLink} from './login';
import {ErrorText} from './signup';

export default function ForgotPassword() {
    const [username, updateUsername] = useInput('');
    const [email, updateEmail] = useInput('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = useCallback(
        async event => {
            event.preventDefault();
            const result = await makePostCall('/api/forgot-password', {
                username,
                email,
            });
            if (result.error) {
                setError(result.error);
            } else {
                router.push('/');
            }
        },
        [username, email]
    );

    return (
        <Container>
            <MidContainer>
                <Title />
                <TitleAndButton text="Forgot password">
                    <AlternativeLink href={'/login'} text="Back to log in" />
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
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={updateEmail}
                        />
                        <Box
                            marginTop="32px"
                            marginBottom="4px"
                            marginLeft="4px"
                            width="100px"
                        >
                            <Button type="submit" variant="bordered">
                                Send email to reset password
                            </Button>
                        </Box>
                    </form>
                </InnerContainer>
            </MidContainer>
        </Container>
    );
}

ForgotPassword.getInitialProps = redirectIfLoggedIn;
