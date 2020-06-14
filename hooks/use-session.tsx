import {makeGetCall} from 'api-calls';
import {useRouter} from 'next/dist/client/router';
import {useCallback, useEffect, useState} from 'react';

const emptySession = {
    username: '',
};

let defaultSession = getDefaultSessionFromSessionStorage();

function getDefaultSessionFromSessionStorage() {
    if (typeof window === 'undefined') {
        return emptySession;
    }

    try {
        const sessionStorageSession = sessionStorage.getItem('session');
        if (sessionStorageSession) {
            return JSON.parse(sessionStorageSession);
        } else {
            return emptySession;
        }
    } catch (error) {
        return emptySession;
    }
}

async function loadSession() {
    if (typeof window === 'undefined') {
        return emptySession;
    }
    return await makeGetCall('/api/sessions');
}

export const useSession = () => {
    const [session, setSession] = useState(defaultSession);
    const [loading, setLoading] = useState(!defaultSession.username);
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
        if (!session?.username) {
            loadSessionCallback();
        } else {
            try {
                sessionStorage.setItem('session', JSON.stringify(session));
            } catch (error) {}
        }
    }, [session?.username]);

    return {
        session,
        loading,
    };
};
