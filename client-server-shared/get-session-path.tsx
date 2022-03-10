import {getPath} from 'client-server-shared/get-path';
import {IncomingHttpHeaders, IncomingMessage} from 'http';

export function getSessionPath(
    req: IncomingMessage | undefined,
    headers: IncomingHttpHeaders
) {
    const path = '/api/sessions';
    return getPath(path, req, headers);
}
