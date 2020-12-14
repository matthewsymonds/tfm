import {makeDeleteCall} from 'api-calls';
import {useRouter} from 'next/router';
import {useEffect} from 'react';

export default () => {
    const router = useRouter();

    async function logout() {
        await makeDeleteCall('/api/sessions');
        sessionStorage.clear();
        // TODO(matthew) restore router usage here if possible.
        window.location.href = '/';
    }

    useEffect(() => {
        logout();
    });

    return null;
};
