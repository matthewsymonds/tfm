import {useRef} from 'react';

let uniqueId = 0;
const getUniqueId = () => uniqueId++;

export function useComponentId() {
    const idRef = useRef<null | number>(null);
    if (idRef.current === null) {
        idRef.current = getUniqueId();
    }
    return `id${idRef.current}`;
}
