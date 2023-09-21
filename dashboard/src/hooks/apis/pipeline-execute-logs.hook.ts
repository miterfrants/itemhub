import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { pipelinesActions } from '@/redux/reducers/pipelines.reducer';
import { ApiHelpers } from '@/helpers/api.helper';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { PipelineExecuteLogType } from '@/types/pipeline-execute-log.type';

interface PaginationPipelineExecuteLogs {
    pipelineExecuteLogs: PipelineExecuteLogType[];
    rowNum: number;
}

export const useGetPaginationPipelineExecuteLogsApi = ({
    pipelineId,
    page,
    limit,
}: {
    pipelineId: number;
    page: number;
    limit: number;
}) => {
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.PIPELINE_EXECUTE_LOGS}`,
        queryStrings: {
            pipelineId,
            page,
            limit,
        },
    });

    const { isLoading, error, fetchApi, data } =
        useFetchApi<PaginationPipelineExecuteLogs>({
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

export const useGetPipelineLastExecuteLogs = ({
    pipelineIds,
}: {
    pipelineIds: number[];
}) => {
    const queryStrings = {};
    pipelineIds.forEach((item, index) => {
        queryStrings[`pipelineIds[${index}]`] = item;
    });
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.PIPELINE_LAST_EXECUTE_LOGS}`,
        queryStrings,
    });

    const { isLoading, error, fetchApi, data } = useFetchApi<
        PipelineExecuteLogType[]
    >({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
    });

    return {
        data,
        isLoading,
        error,
        fetchApi,
    };
};
