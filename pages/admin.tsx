import {makePostCall} from 'api-calls';
import {Box} from 'components/box';
import React, {useState} from 'react';

export default function Admin() {
    const [game, setGameName] = useState('');
    const [theState, setTheState] = useState('');
    async function lookupGame() {
        const response = await fetch('/api/admin/' + game);
        const {state} = await response.json();
        setTheState(JSON.stringify(state));
    }

    async function updateState() {
        try {
            await makePostCall('/api/admin/' + game, {state: theState});
        } catch (error) {}
    }
    return (
        <Box background="#ccc">
            <h2>Admin</h2>
            <div>Enter game name:</div>
            <input type="text" value={game} onChange={e => setGameName(e.target.value)} />
            <button onClick={lookupGame}>Lookup</button>
            <div>State</div>
            <textarea value={theState} onChange={e => setTheState(e.target.value)} />
            <button onClick={updateState}>Update</button>
        </Box>
    );
}
