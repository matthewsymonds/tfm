import {makePostCall} from 'api-calls';
import {CenteredLink} from 'components/centered';
import {Input, SubmitInput} from 'components/input';
import {MaybeVisible} from 'components/maybe-visible';
import {useInput} from 'hooks/use-input';
import {useSession} from 'hooks/use-session';
import {useRouter} from 'next/dist/client/router';
import Link from 'next/link';
import {useCallback, useState} from 'react';

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
    if (loading) return <div />;

    return (
        <>
            <h3>Log in</h3>
            <Link href="/signup" passHref>
                <CenteredLink>or Sign up</CenteredLink>
            </Link>
            <MaybeVisible visible={!!error}>
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
        </>
    );
}
