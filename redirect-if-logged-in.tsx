import {TFMSession} from 'check-session';
import {getSessionPath} from 'client-server-shared/get-session-path';
import {NextPageContext} from 'next';
import Router from 'next/dist/client/router';
import {getRequestHeaders} from 'server/get-request-headers';

export const redirectIfLoggedIn = async (ctx: NextPageContext) => {
    const {req, res} = ctx;

    const isServer = !!req && !!res;

    const headers = isServer ? req.headers : {};
    const requestHeaders = getRequestHeaders(headers);

    try {
        const response = await fetch(getSessionPath(req, headers), {
            headers: requestHeaders,
        });
        const result = (await response.json()) as TFMSession;
        if (result?.username) {
            return {};
        }
        // If we get here, the user is logged in. Time to take them to the index!
        if (isServer) {
            res.writeHead(302, {
                Location: '/',
            });
            res.end();
            return {};
        } else {
            Router.push('/');
            return {};
        }
    } catch (error) {
        return {};
    }
};
