import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { ApiHelpers } from '@/helpers/api.helper';

export const useGetSensorLogsApi = ({
    deviceId,
    pin,
    page,
    limit,
}: {
    deviceId: number;
    pin: string;
    page: number;
    limit: number;
}) => {
    let apiPath = `${API_URL}${END_POINT.SENSOR_LOGS}`;
    apiPath = apiPath.replace(':id', deviceId.toString()).replace(':pin', pin);
    apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: apiPath,
        queryStrings: { page: page, limit: limit },
    });

    const { isLoading, error, data, fetchApi } = useFetchApi<any[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};
