import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {useState} from 'react';
import styled from 'styled-components';
import {Flex} from './box';

const NotesBase = styled.textarea`
    display: block;
    width: 100%;
    box-sizing: border-box;
    min-height: 120px;
    margin: 12px;
`;

export function Notes() {
    const loggedInPlayer = useLoggedInPlayer();
    const [value, setValueState] = useState(loggedInPlayer.notes);

    const apiClient = useApiClient();
    const [timeoutRef, setTimeoutRef] = useState<number>(-3);
    function setValue(notes: string) {
        setValueState(notes);
        if (timeoutRef) {
            clearTimeout(timeoutRef);
        }

        const timeout: number = window.setTimeout(() => {
            apiClient.setNotesAsync(notes);
        }, 500);
        setTimeoutRef(timeout);
    }
    return (
        <Flex width="100%">
            <NotesBase value={value} onChange={e => setValue(e.target.value)} />
        </Flex>
    );
}
