import debounce from 'lodash.debounce';
import { useRef, useEffect, useCallback } from 'react';

export function useDebounce(callback: (params: any) => void, delay: number) {
    const inputsRef = useRef({ callback, delay });
    useEffect(() => {
        inputsRef.current = { callback, delay };
    });
    return useCallback(
        debounce(
            (params: any) => {
                if (inputsRef.current.delay === delay)
                    inputsRef.current.callback(params);
            },
            delay,
            {}
        ),
        [delay, debounce]
    );
}
