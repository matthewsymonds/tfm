import {useState, useCallback, FormEvent} from 'react';

export const useInput = (
    initialValue: string
): [string, (event: FormEvent<HTMLInputElement>) => void] => {
    const [state, setState] = useState(initialValue);

    const handleInput = useCallback(event => {
        setState(event.target.value);
    }, []);

    return [state, handleInput];
};
