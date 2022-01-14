import {getSessionPath} from 'client-server-shared/get-session-path';
import {NextPageContext} from 'next';
import Router from 'next/dist/client/router';
import {getRequestHeaders} from 'server/get-request-headers';

export type TFMSession = {username: string};

export async function checkSessionInternal(ctx: NextPageContext): Promise<TFMSession> {
    const {req, res} = ctx;

    const isServer = !!req && !!res;

    const headers = isServer ? req.headers : {};
    const requestHeaders = getRequestHeaders(headers);
    try {
        const response = await fetch(getSessionPath(req, headers), {
            headers: requestHeaders,
        });
        const result = (await response.json()) as TFMSession;
        return result;
    } catch (error) {
        if (isServer) {
            res.writeHead(302, {
                Location: '/login',
            });
            res.end();
        } else {
            Router.push('/login');
        }
        return {username: ''};
    }
}

export async function checkSession(ctx: NextPageContext): Promise<{session: TFMSession}> {
    const session = await checkSessionInternal(ctx);
    return {session};
}
