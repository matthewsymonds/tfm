import {useState, useEffect, useCallback} from 'react';
import fetch from 'isomorphic-unfetch';
import {useRouter} from 'next/dist/client/router';
import {makeGetCall} from '../api-calls';

const emptySession = {
    username: '',
};

async function loadSession() {
    if (typeof window === 'undefined') {
        return emptySession;
    }

    return await makeGetCall('/api/sessions');
}

export const useSession = () => {
    const [session, setSession] = useState(emptySession);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadSessionCallback = useCallback(async () => {
        let session;
        try {
            session = await loadSession();
        } catch (error) {
            session = emptySession;
        }
        if (!session.username) {
            if (!['/signup', '/login'].includes(router.pathname)) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        } else {
            if (['/signup', '/login'].includes(router.pathname)) {
                router.push('/');
            } else {
                setSession(session);
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadSessionCallback();
    }, []);

    return {
        session,
        loading,
    };
};
