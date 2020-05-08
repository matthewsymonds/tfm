import {useCallback} from 'react';

export const useFilteredCallback = function(canPlay: boolean, innerCallback: Function) {
    return useCallback(
        (...args) => {
            if (!canPlay) return;

            return innerCallback(...args);
        },
        [canPlay]
    );
};
