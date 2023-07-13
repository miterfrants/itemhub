import { useState, useEffect, useCallback } from 'react';
import { FetchErrorResultData } from '@/types/helpers.type';
import { ApiHelpers } from '@/helpers/api.helper';
import { ERROR_KEY } from '@/constants/error-key';
import { CookieHelpers } from '@/helpers/cookie.helper';
import { COOKIE_KEY } from '@/constants/cookie-key';

export const useFetchApi = <T>({
    apiPath,
    method,
    payload,
    initialData,
    callbackFunc,
    skipErrorToaster,
    isRefreshToken,
}: {
    apiPath: string;
    method: string;
    payload?: { [key: string]: any };
    initialData: T | null;
    callbackFunc?: (data: T) => void;
    skipErrorToaster?: boolean;
    isRefreshToken?: boolean;
}) => {
    const [data, setData] = useState<T | null>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<FetchErrorResultData | null>(null);
    const [httpStatus, setHttpStatus] = useState<number | null>(null);

    const controller = new AbortController();

    const fetchApi = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await ApiHelpers.SendRequestWithToken<T>({
                apiPath,
                method,
                payload,
                signal: controller.signal,
                skipErrorToaster,
                isRefreshToken,
            });
            const data = result.data;

            if (!controller.signal.aborted) {
                setHttpStatus(result.httpStatus);
                setData(data);
                if (callbackFunc) {
                    callbackFunc(data);
                }
            }
        } catch (error: any) {
            const errorData: FetchErrorResultData = error?.data || {
                errorKey: 'UNKNOWN_ERROR',
                message: '非預期錯誤',
                payload: [],
                stackTrace: '',
            };
            const errorKey = errorData.errorKey;

            if (errorKey === ERROR_KEY.TOKEN_EXPIRED) {
                CookieHelpers.EraseCookie({ name: COOKIE_KEY.DASHBOARD_TOKEN });
                location.href = `${
                    import.meta.env.VITE_WEBSITE_URL
                }/auth/two-factor-auth/`;
            }

            if (!controller.signal.aborted) {
                const errorData = error?.data || error;
                setError(errorData);
            }
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiPath, method, payload, callbackFunc]);

    const cancelFetch = () => {
        controller.abort();
    };

    useEffect(() => {
        return cancelFetch;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isLoading,
        error,
        data,
        httpStatus,
        fetchApi,
    };
};
