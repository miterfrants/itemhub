import { useEffect } from 'react';
export const useBeforeUnload = ({
    when,
    message,
}: {
    when: boolean;
    message: string;
}) => {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = message;
            return message;
        };

        if (when) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [when, message]);
};
