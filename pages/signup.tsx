import {makePostCall} from 'api-calls';
import {CenteredLink} from 'components/centered';
import {Input, SubmitInput} from 'components/input';
import {MaybeVisible} from 'components/maybe-visible';
import {useInput} from 'hooks/use-input';
import {useSession} from 'hooks/use-session';
import {useRouter} from 'next/dist/client/router';
import Link from 'next/link';
import {useCallback, useState} from 'react';

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
    const confirmPasswordValidationVisible =
        mayShowConfirmPasswordValidation && password !== confirmPassword;

    const {loading} = useSession();
    if (loading) return <div />;

    return (
        <>
            <h3>Sign up</h3>
            <Link href="/login" passHref>
                <CenteredLink>or Log In</CenteredLink>
            </Link>
            <MaybeVisible textAlign="center" visible={!!error}>
                <h4>
                    <em>{error || 'Something went wrong'}</em>
                </h4>
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
                <MaybeVisible visible={confirmPasswordValidationVisible}>
                    <em>Passwords must match.</em>
                </MaybeVisible>
                <SubmitInput />
            </form>
        </>
    );
}
