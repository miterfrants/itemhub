import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';

export interface ResponseOfToken {
    dashboardToken: string;
    dashboardRefreshToken: string;
}

export const useRefreshTokenApi = () => {
    const apiPath = `${API_URL}${END_POINT.REFRESH_DASHBOARD_TOKEN}`;

    const { isLoading, error, fetchApi, data } = useFetchApi<ResponseOfToken>({
        apiPath,
        method: HTTP_METHOD.POST,
        initialData: null,
        isRefreshToken: true,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};
