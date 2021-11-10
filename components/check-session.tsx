import {getPath} from 'client-server-shared/get-path';
import Router from 'next/dist/client/router';

export async function checkSession(ctx) {
    const {isServer, req, res} = ctx;

    const headers = isServer ? req.headers : {};
    try {
        const response = await fetch(getSessionPath(isServer, req, headers), {
            headers,
        });
        const result = await response.json();
        return result;
    } catch (error) {
        if (isServer) {
            res.writeHead(302, {
                Location: '/login',
            });
            res.end();
        } else {
            Router.push('/login');
            return {};
        }
    }
}

function getSessionPath(isServer, req, headers) {
    const path = '/api/sessions';
    return getPath(path, isServer, req, headers);
}
