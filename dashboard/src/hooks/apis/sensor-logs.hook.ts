import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { ApiHelpers } from '@/helpers/api.helper';

export const useGetSensorLogsApi = ({
    deviceId,
    pin,
    page,
    limit,
    startAt,
    endAt,
}: {
    deviceId: number;
    pin: string;
    page: number;
    limit: number;
    startAt?: string;
    endAt?: string;
}) => {
    let apiPath = `${API_URL}${END_POINT.SENSOR_LOGS}`;
    apiPath = apiPath.replace(':id', deviceId.toString()).replace(':pin', pin);
    apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: apiPath,
        queryStrings: {
            page: page,
            limit: limit,
            startAt: startAt,
            endAt: endAt,
        },
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

export const useGetSensorLogsAggregateApi = ({
    deviceId,
    pin,
    page,
    limit,
    startAt,
    endAt,
    statisticalMethods,
}: {
    deviceId: number;
    pin: string;
    page?: number;
    limit?: number;
    startAt?: string;
    endAt?: string;
    statisticalMethods?: number;
}) => {
    let apiPath = `${API_URL}${END_POINT.SENSOR_LOGS_AGGREGATE}`;
    apiPath = apiPath.replace(':id', deviceId.toString()).replace(':pin', pin);
    apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: apiPath,
        queryStrings: {
            page: page,
            limit: limit,
            startAt: startAt,
            endAt: endAt,
            statisticalMethods: statisticalMethods,
        },
    });

    const { isLoading, error, data, fetchApi } = useFetchApi<
        number | undefined
    >({
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
