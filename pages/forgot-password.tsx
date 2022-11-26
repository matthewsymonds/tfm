import {makePostCall} from 'api-calls';
import {Box} from 'components/box';
import {Button} from 'components/button';
import {Input} from 'components/input';
import {MaybeVisible} from 'components/maybe-visible';
import {useInput} from 'hooks/use-input';
import {useRouter} from 'next/dist/client/router';
import {Container, MidContainer, Title, TitleAndButton} from 'pages';
import {InnerContainer} from 'pages/new-game';
import {useCallback, useEffect, useState} from 'react';
import {redirectIfLoggedIn} from 'redirect-if-logged-in';
import {AlternativeLink} from './login';
import {ErrorText} from './signup';

export default function ForgotPassword() {
    const [username, updateUsername] = useInput('');
    const [email, updateEmail] = useInput('');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const query = router.query;
    const token = query.token as string;
    // password, confirmPassword
    const [password, updatePassword] = useInput('');
    const [confirmPassword, updateConfirmPassword] = useInput('');
    useEffect(() => {
        if (password.length === 0) {
            setMayShowPasswordValidation(false);
        }
    }, [password]);

    const [mayShowPasswordValidation, setMayShowPasswordValidation] =
        useState(false);

    const [
        mayShowConfirmPasswordValidation,
        setMayShowConfirmPasswordValidation,
    ] = useState(false);

    useEffect(() => {
        if (confirmPassword.length === 0) {
            setMayShowConfirmPasswordValidation(false);
        }
    }, [confirmPassword]);

    const handleSetShowPasswordValidation = useCallback(() => {
        setMayShowPasswordValidation(true);
    }, []);

    const handleSetShowConfirmPasswordValidation = useCallback(() => {
        setMayShowConfirmPasswordValidation(true);
    }, []);

    const passwordValidationVisible =
        mayShowPasswordValidation && password.length < 8;
    const mismatchPasswords =
        mayShowConfirmPasswordValidation && password !== confirmPassword;

    if (token) {
        const handleSubmit = useCallback(
            async event => {
                if (password !== confirmPassword || password.length < 8) {
                    return;
                }
                event.preventDefault();
                const result = await makePostCall('/api/forgot-password', {
                    token,
                    username,
                    password,
                });
                if (result.error) {
                    setMessage(result.error);
                } else {
                    router.push('/login');
                }
            },
            [username, email, password, confirmPassword]
        );

        return (
            <Container>
                <TitleAndButton text="Reset Password"></TitleAndButton>
                <MidContainer>
                    <InnerContainer>
                        <form onSubmit={handleSubmit}>
                            <Box>
                                <Input
                                    name="password"
                                    value={password}
                                    onChange={updatePassword}
                                    type="password"
                                    pattern=".{8,}"
                                    onBlur={handleSetShowPasswordValidation}
                                />
                                <MaybeVisible
                                    textAlign="center"
                                    visible={passwordValidationVisible}
                                >
                                    <em>
                                        Password must be at least 8 characters.
                                    </em>
                                </MaybeVisible>
                                <Input
                                    name="Confirm password"
                                    disabled={password.length < 8}
                                    value={confirmPassword}
                                    onChange={updateConfirmPassword}
                                    type="password"
                                    onBlur={
                                        handleSetShowConfirmPasswordValidation
                                    }
                                />
                                <MaybeVisible visible={mismatchPasswords}>
                                    Passwords must match
                                </MaybeVisible>
                                <Button type="submit" variant="bordered">
                                    Reset password
                                </Button>
                                <MaybeVisible visible={!!message}>
                                    {message}
                                </MaybeVisible>
                            </Box>
                        </form>
                    </InnerContainer>
                </MidContainer>
            </Container>
        );
    }

    const handleSubmit = useCallback(
        async event => {
            event.preventDefault();
            const result = await makePostCall('/api/forgot-password', {
                username,
                email,
            });
            if (result.error) {
                setMessage(result.error);
            } else {
                setMessage(
                    'Check your email for a link to reset your password.'
                );
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
                    <Box className="display">
                        Please enter your username and email address.
                    </Box>
                    <Box className="display">
                        You will receive an email with a link to reset your
                        password.
                    </Box>

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
                                Send email
                            </Button>
                        </Box>
                    </form>
                    <MaybeVisible visible={!!message}>
                        <ErrorText>
                            <em>{message}</em>
                        </ErrorText>
                    </MaybeVisible>
                </InnerContainer>
            </MidContainer>
        </Container>
    );
}

ForgotPassword.getInitialProps = redirectIfLoggedIn;
