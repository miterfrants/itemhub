import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { ApiHelpers } from '@/helpers/api.helper';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { LogType } from '@/types/log.type';

interface PaginationLogs {
    logs: LogType[];
    rowNum: number;
}

export const useGetPaginationLogsApi = ({
    pipelineId,
    page,
    limit,
}: {
    pipelineId: number;
    page: number;
    limit: number;
}) => {
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.LOGS}`,
        queryStrings: {
            pipelineId,
            logType: 1,
            page,
            limit,
        },
    });

    const { isLoading, error, fetchApi, data } = useFetchApi<PaginationLogs>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};
