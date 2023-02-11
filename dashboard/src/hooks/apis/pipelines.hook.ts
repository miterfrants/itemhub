import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { pipelinesActions } from '@/redux/reducers/pipelines.reducer';
import { ApiHelpers } from '@/helpers/api.helper';
import { PipelineType } from '@/types/pipeline.type';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { ResponseOK } from '@/types/response.type';

interface GetPipelinesResponseData {
    pipelines: PipelineType[];
    rowNum: number;
}

export const useGetPipelinesApi = ({
    page,
    limit,
    title,
}: {
    page: number;
    limit: number;
    title: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: GetPipelinesResponseData) => {
            if (data) {
                dispatch(pipelinesActions.refresh(data));
            }
        },
        [dispatch]
    );
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.PIPELINES}`,
        queryStrings: {
            page,
            limit,
            title,
        },
    });

    const { isLoading, error, fetchApi } =
        useFetchApi<GetPipelinesResponseData>({
            apiPath,
            method: HTTP_METHOD.GET,
            initialData: null,
            callbackFunc: dispatchRefreshDevices,
        });

    return {
        isLoading,
        error,
        fetchApi,
    };
};

export const useGetPipelineApi = (id: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: PipelineType) => {
            if (data) {
                dispatch(pipelinesActions.refreshOne(data));
            }
        },
        [dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.PIPELINE}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<PipelineType>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useUpdatePipelineApi = ({
    editedData,
}: {
    editedData: Partial<PipelineType>;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdate = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(pipelinesActions.update({ ...editedData }));
            }
        },
        [editedData, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.PIPELINE}`;
    apiPath = apiPath.replace(':id', (editedData?.id || 0).toString());

    const { isLoading, error, fetchApi, data } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: editedData,
        initialData: null,
        callbackFunc: dispatchUpdate,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};

export const useDeletePipelinesApi = (ids: number[]) => {
    const dispatch = useAppDispatch();
    const dispatchDeleteDeivce = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(pipelinesActions.deleteMultiple({ ids }));
            }
        },
        [ids, dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.PIPELINES}`;

    const { isLoading, error, fetchApi, data } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        payload: ids,
        initialData: null,
        callbackFunc: dispatchDeleteDeivce,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};

export const useCreatePipelineApi = (title: string) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (response: PipelineType) => {
            dispatch(pipelinesActions.addOne(response));
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.PIPELINES}`;

    return useFetchApi<PipelineType>({
        apiPath,
        method: HTTP_METHOD.POST,
        payload: {
            title,
        },
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};
