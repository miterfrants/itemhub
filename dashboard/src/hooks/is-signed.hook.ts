import { useState, useEffect } from 'react';
import { AuthDataservice } from '@/dataservices/auth.dataservice';
import { CookieHelper } from '@/helpers/cookie.helper';

export function useIsSigned() {
    const [data, setData] = useState(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (error && import.meta.env.VITE_ENV === 'prod') {
        window.location.href = '/';
    }

    useEffect(() => {
        (async function () {
            setLoading(true);
            const token = CookieHelper.GetCookie('token');
            if (token) {
                const response: any = await AuthDataservice.IsSigned(token);
                if (response.status === 'OK') {
                    setData(response);
                } else {
                    setError(response);
                }
            } else {
                setError('empty token');
            }
            setLoading(false);
        })();
    }, []);

    return { data, error, loading };
}
