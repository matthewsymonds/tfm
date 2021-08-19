import {PROTOCOL_HOST_DELIMITER} from 'pages/_app';
function isCharNumber(c) {
    return c >= '0' && c <= '9';
}

export function getPath(path, isServer, req, headers) {
    let url: string;
    if (isServer) {
        url = req.url;
    } else {
        url = window.location.href;
    }
    if (!isServer) {
        return path;
    }

    const {host} = headers;
    const protocol = /^localhost(:\d+)?$/.test(host) || isCharNumber(host[0]) ? 'http' : 'https';
    return protocol + PROTOCOL_HOST_DELIMITER + host + path;
}
