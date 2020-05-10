import {makeDeleteCall} from '../api-calls';
import {useEffect} from 'react';
import {useRouter} from 'next/router';

export default () => {
    const router = useRouter();

    async function logout() {
        await makeDeleteCall('/api/sessions');
        router.push('/login');
    }

    useEffect(() => {
        logout();
    });

    return null;
};
