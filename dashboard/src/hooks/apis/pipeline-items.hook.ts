import { useFetchApi } from '@/hooks/apis/fetch.hook';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { PipelineItemType } from '@/types/pipeline.type';
import { useAppDispatch } from '../redux.hook';
import { pipelineItemsActions } from '@/redux/reducers/pipeline-items.reducer';
import { useCallback } from 'react';
import { ResponseOK } from '@/types/response.type';

export const useGetAllPipelineItems = (pipelineId: number) => {
    let apiPath = `${API_URL}${END_POINT.PIPELINE_ITEMS}`;
    apiPath = apiPath.replace(':pipelineId', pipelineId.toString());

    const dispatch = useAppDispatch();
    const dispatchUpdatePipelineItems = useCallback(
        (data: PipelineItemType[]) => {
            dispatch(pipelineItemsActions.updatePipelineItems(data));
        },
        // eslint-disable-next-line
        [pipelineId, dispatch]
    );

    const { isLoading, data, error, fetchApi } = useFetchApi<
        PipelineItemType[]
    >({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchUpdatePipelineItems,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useCreatePipelineItem = (payload: PipelineItemType) => {
    let apiPath = `${API_URL}${END_POINT.PIPELINE_ITEMS}`;
    apiPath = apiPath.replace(':pipelineId', payload.pipelineId.toString());
    const { isLoading, data, error, fetchApi } = useFetchApi<PipelineItemType>({
        apiPath,
        method: HTTP_METHOD.POST,
        payload,
        initialData: null,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useDeletePipelineItem = (payload: PipelineItemType) => {
    let apiPath = `${API_URL}${END_POINT.PIPELINE_ITEM}`;
    apiPath = apiPath.replace(':pipelineId', payload.pipelineId.toString());
    apiPath = apiPath.replace(':id', (payload.id || '').toString());
    const dispatch = useAppDispatch();
    const dispatchDeletePipelineItem = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    pipelineItemsActions.deleteMultiple({
                        pipelineItemIds: [payload.id || 0],
                    })
                );
            }
        },
        [payload.id, dispatch]
    );
    const { isLoading, data, error, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        payload,
        initialData: null,
        callbackFunc: dispatchDeletePipelineItem,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useUpdatePipelineItem = (payload: PipelineItemType) => {
    let apiPath = `${API_URL}${END_POINT.PIPELINE_ITEM}`;
    apiPath = apiPath.replace(':pipelineId', payload.pipelineId.toString());
    apiPath = apiPath.replace(':id', (payload.id || '').toString());
    const dispatch = useAppDispatch();
    const dispatchCallback = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(pipelineItemsActions.updatePipelineItem(payload));
            }
        },
        [payload, dispatch]
    );
    const { isLoading, data, error, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload,
        initialData: null,
        callbackFunc: dispatchCallback,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};
