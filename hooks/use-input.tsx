import {FormEvent, useCallback, useState} from 'react';

export const useInput = <K extends string | number>(
    initialValue: K
): [K, (event: FormEvent<HTMLInputElement>) => void] => {
    const [state, setState] = useState(initialValue);

    const handleInput = useCallback(event => {
        setState(event.target.value);
    }, []);

    return [state, handleInput];
};
