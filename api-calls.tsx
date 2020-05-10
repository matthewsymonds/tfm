export async function makePostCall(path: string, body: Object) {
    const url = window.location.origin;

    const result = await fetch(url + path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    return await result.json();
}

export async function makeGetCall(path: string) {
    const url = window.location.origin;

    const result = await fetch(url + path);

    return await result.json();
}

export async function makeDeleteCall(path: string) {
    const url = window.location.origin;

    return await fetch(url + path, {method: 'DELETE'});
}
