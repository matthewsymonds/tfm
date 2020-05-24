import {useCallback, useState} from 'react';
import {useInput} from 'hooks/use-input';
import {Input, SubmitInput} from 'components/input';
import {Centered, CenteredLink} from 'components/centered';
import Link from 'next/link';
import {Box} from 'components/box';
import {makePostCall} from 'api-calls';
import {useRouter} from 'next/dist/client/router';
import {MaybeVisible} from 'components/maybe-visible';
import {useSession} from 'hooks/use-session';

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

    const {loading} = useSession();
    if (loading) return null;

    return (
        <Centered>
            <Box>
                <h3>Log in</h3>
                <Link href="/signup" passHref>
                    <CenteredLink>or Sign up</CenteredLink>
                </Link>
                <MaybeVisible horizontalMargin={0} visible={!!error}>
                    <h4>
                        <em>{error || 'Username or password did not match. Please try again.'}</em>
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
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={updatePassword}
                    />
                    <SubmitInput />
                </form>
            </Box>
        </Centered>
    );
}
