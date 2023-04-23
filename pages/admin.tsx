import {makePostCall} from 'api-calls';
import {Box} from 'components/box';
import React, {useState} from 'react';
import {Button} from 'components/button';
import dynamic from 'next/dynamic';

type JsonEditorProps = {
    value: Record<string, unknown>;
    onChange: (value: Record<string, unknown>) => void;
};
const JsonEditor = dynamic<JsonEditorProps>(
    {
        loader: () => import('nextjs-jsoneditor').then(mod => mod.JsonEditor),
    },
    {
        ssr: false,
    }
);

export default function Admin() {
    const [game, setGameName] = useState('');
    const [stateJson, setStateJson] = useState<Record<string, unknown> | null>(
        null
    );
    const [isFetching, setIsFetching] = useState(false);
    async function lookupGame() {
        setStateJson(null);
        setIsFetching(true);
        setIsUpdated(false);
        setIsUpdating(false);
        setIsError(false);
        const response = await fetch('/api/admin/' + game);
        const {state} = await response.json();
        setIsFetching(false);
        setStateJson(state);
    }

    const [isUpdating, setIsUpdating] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [isError, setIsError] = useState(false);
    async function updateState() {
        try {
            setIsUpdating(true);
            setIsUpdated(false);
            setIsError(false);
            const response = await makePostCall('/api/admin/' + game, {
                state: JSON.stringify(stateJson),
            });
            if (response.result === 'OK') {
                setIsUpdating(false);
                setIsUpdated(true);
                setIsError(false);
            } else {
                setIsUpdating(false);
                setIsUpdated(false);
                setIsError(true);
            }
        } catch (error) {
            setIsUpdating(false);
            setIsUpdated(false);
            setIsError(true);
        }
    }
    return (
        <Box
            background="#ccc"
            style={{
                inset: 0,
                position: 'absolute',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                overflow: 'auto',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    maxWidth: 640,
                    paddingBottom: 32,
                }}
            >
                <h2>Admin</h2>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <h4>Lookup game</h4>
                    <div style={{display: 'flex'}}>
                        <input
                            type="text"
                            style={{width: 200, marginRight: 8}}
                            value={game}
                            onChange={e => setGameName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    lookupGame();
                                }
                            }}
                        />
                        <Button onClick={lookupGame}>Lookup</Button>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        marginTop: 16,
                        flexDirection: 'column',
                    }}
                >
                    {isFetching && <div>Loading...</div>}
                    {stateJson !== null && (
                        <React.Fragment>
                            <h4>State</h4>
                            {stateJson && (
                                <JsonEditor
                                    value={stateJson}
                                    onChange={newStateJson => {
                                        setStateJson(
                                            newStateJson as Record<
                                                string,
                                                unknown
                                            >
                                        );
                                    }}
                                />
                            )}
                            <div style={{marginTop: 16, display: 'flex'}}>
                                <Button onClick={updateState}>Update</Button>
                                {isError && (
                                    <span style={{marginLeft: 16}}>
                                        Something went wrong
                                    </span>
                                )}
                                {isUpdating && (
                                    <span style={{marginLeft: 16}}>
                                        Updating...
                                    </span>
                                )}
                                {isUpdated && (
                                    <span style={{marginLeft: 16}}>
                                        Updated successfully.
                                    </span>
                                )}
                            </div>
                        </React.Fragment>
                    )}
                </div>
            </div>
        </Box>
    );
}

type JsonObject = Record<string, any>;

function setJsonValueAtPath(
    stateJson: JsonObject,
    path: string[],
    value: unknown
): void {
    let currentObject: any = stateJson;
    for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (i === path.length - 1) {
            // If we've reached the end of the path, set the value
            currentObject[key] = value;
        } else if (currentObject.hasOwnProperty(key)) {
            // If the key exists and isn't the end of the path, go deeper
            currentObject = currentObject[key];
        } else {
            // If the key doesn't exist, create a new object and go deeper
            const nextKey = path[i + 1];
            currentObject[key] = typeof nextKey === 'number' ? [] : {};
            currentObject = currentObject[key];
        }
    }
}
