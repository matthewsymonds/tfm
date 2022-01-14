import {IncomingHttpHeaders} from 'http';

/* TypeScript revealed that IncomingHttpHeaders and HeadersInit are not the same interface.
   This function converts one into the other for type safety.
*/
export function getRequestHeaders(headers: IncomingHttpHeaders): HeadersInit {
    const requestHeaders = new Headers();

    for (const header in headers) {
        let value = headers[header];
        const strValue = Array.isArray(value) ? value.join('') : value ?? '';
        requestHeaders.append(header, strValue);
    }

    return requestHeaders;
}
