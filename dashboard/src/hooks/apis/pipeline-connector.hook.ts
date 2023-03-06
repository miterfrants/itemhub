import { useFetchApi } from '@/hooks/apis/fetch.hook';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { PipelineConnectorType } from '@/types/pipeline.type';
import { useAppDispatch } from '../redux.hook';
import { pipelineConnectorsActions } from '@/redux/reducers/pipeline-connectors.reducer';
import { useCallback } from 'react';
import { pipelineItemsActions } from '@/redux/reducers/pipeline-items.reducer';
import { ResponseOK } from '@/types/response.type';

export const useGetAllPipelineConnectors = (pipelineId: number) => {
    let apiPath = `${API_URL}${END_POINT.PIPELINE_CONNECTORS}`;
    apiPath = apiPath.replace(':pipelineId', pipelineId.toString());

    const dispatch = useAppDispatch();
    const dispatchAppendConnectors = useCallback(
        (data: PipelineConnectorType[]) => {
            dispatch(pipelineConnectorsActions.updatePipelineConnectors(data));
        },
        // eslint-disable-next-line
        [pipelineId, dispatch]
    );

    const { isLoading, data, error, fetchApi } = useFetchApi<
        PipelineConnectorType[]
    >({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchAppendConnectors,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useCreatePipelineConnector = (payload: PipelineConnectorType) => {
    let apiPath = `${API_URL}${END_POINT.PIPELINE_CONNECTORS}`;
    apiPath = apiPath.replace(':pipelineId', payload.pipelineId.toString());

    const dispatch = useAppDispatch();
    const dispatchAppendConnector = useCallback(
        (data: PipelineConnectorType) => {
            dispatch(
                pipelineConnectorsActions.updatePipelineConnectors([data])
            );
        },
        // eslint-disable-next-line
        [payload.pipelineId, dispatch]
    );
    const { isLoading, data, error, fetchApi } =
        useFetchApi<PipelineConnectorType>({
            apiPath,
            method: HTTP_METHOD.POST,
            payload,
            initialData: null,
            callbackFunc: dispatchAppendConnector,
        });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useDeletePipelineConnector = (payload: {
    pipelineId: number;
    id: number;
}) => {
    const { id } = payload;
    const dispatch = useAppDispatch();
    const dispatchDeleteConnector = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    pipelineItemsActions.deleteMultiple({
                        pipelineItemIds: [id],
                    })
                );
            }
        },
        [id, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.PIPELINE_CONNECTOR}`;
    apiPath = apiPath.replace(':pipelineId', payload.pipelineId.toString());
    apiPath = apiPath.replace(':id', payload.id?.toString());
    const { isLoading, data, error, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        payload,
        initialData: null,
        callbackFunc: dispatchDeleteConnector,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};
