import {makePostCall} from 'api-calls';
import {Box} from 'components/box';
import {Button} from 'components/button';
import {Input} from 'components/input';
import {MaybeVisible} from 'components/maybe-visible';
import {useInput} from 'hooks/use-input';
import {useRouter} from 'next/dist/client/router';
import {Container, MidContainer, Title, TitleAndButton} from 'pages';
import {useCallback, useState} from 'react';
import styled from 'styled-components';
import {AlternativeLink} from './login';
import {InnerContainer} from './new-game';

export const ErrorText = styled.h4`
    margin-top: 4px;
    margin-bottom: 4px;
`;

export default function Signup() {
    const [username, updateUsername] = useInput('');
    const [email, updateEmail] = useInput('');

    const [password, updatePassword] = useInput('');
    const [confirmPassword, updateConfirmPassword] = useInput('');
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(
        async event => {
            event.preventDefault();
            const result = await makePostCall('/api/users', {
                username,
                email,
                password,
            });
            if (result.error) {
                setError(result.error);
            } else {
                await makePostCall('/api/sessions', {
                    username,
                    password,
                });

                router.push('/');
            }
            setError(result.error);
        },
        [username, email, password, confirmPassword]
    );

    const [mayShowPasswordValidation, setMayShowPasswordValidation] = useState(false);

    const handleSetShowPasswordValidation = useCallback(() => {
        setMayShowPasswordValidation(true);
    }, []);

    const [mayShowConfirmPasswordValidation, setMayShowConfirmPasswordValidation] = useState(false);

    const handleSetShowConfirmPasswordValidation = useCallback(() => {
        setMayShowConfirmPasswordValidation(true);
    }, []);

    const passwordValidationVisible = mayShowPasswordValidation && password.length < 8;
    const mismatchPasswords = mayShowConfirmPasswordValidation && password !== confirmPassword;

    return (
        <Container>
            <MidContainer>
                <Title />
                <TitleAndButton text="Sign up">
                    <AlternativeLink href={'/login'} text="Log in instead" />
                </TitleAndButton>
                <InnerContainer>
                    <MaybeVisible textAlign="center" visible={!!error}>
                        <ErrorText>
                            <em>{error || 'Something went wrong'}</em>
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
                        <Input
                            name="password"
                            autoComplete="new-password"
                            type="password"
                            value={password}
                            onChange={updatePassword}
                            onBlur={handleSetShowPasswordValidation}
                            pattern=".{8,}"
                        />
                        <MaybeVisible textAlign="center" visible={passwordValidationVisible}>
                            <em>Password must be at least 8 characters.</em>
                        </MaybeVisible>
                        <Input
                            name="Confirm password"
                            type="password"
                            autoComplete="off"
                            value={confirmPassword}
                            onChange={updateConfirmPassword}
                            onBlur={handleSetShowConfirmPasswordValidation}
                            pattern={password}
                        />
                        <MaybeVisible visible={mismatchPasswords}>
                            <em>Passwords must match.</em>
                        </MaybeVisible>
                        <Box marginTop="32px" marginBottom="4px" marginLeft="4px" width="100px">
                            <Button type="submit" variant="bordered">
                                Sign up
                            </Button>
                        </Box>
                    </form>
                </InnerContainer>
            </MidContainer>
        </Container>
    );
}
