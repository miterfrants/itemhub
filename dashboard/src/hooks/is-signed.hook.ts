import { useState, useEffect } from 'react';
import { AuthDataservice } from '../dataservices/auth.dataservice';
import { CookieHelper } from '../helpers/cookie.helper';
import { ApiHelper } from '../helpers/api.helper';

export function useIsSigned() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

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
                setError(ApiHelper.LocalError('empty token'));
            }
            setLoading(false);
        })();
    }, []);

    return { data, error, loading };
}
