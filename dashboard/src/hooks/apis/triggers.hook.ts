import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { triggersActions } from '@/redux/reducers/triggers.reducer';
import { ApiHelpers } from '@/helpers/api.helper';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { TriggerItem } from '@/types/triggers.type';
import { ResponseOK } from '@/types/response.type';

interface GetTriggersResponse {
    triggers: TriggerItem[];
    rowNum: number;
}

export interface EditedTrigger {
    name: string;
    sourceDeviceId: number;
    sourcePin: string;
    sourceThreshold: number;
    destinationDeviceId: number | null;
    destinationPin: string | null;
    destinationDeviceTargetState: number | null;
    operator: number;
    type: number;
    email: string | null;
}

export const useGetTriggersApi = ({
    page,
    limit,
    name,
    sourceDeviceName,
    destinationDeviceName,
}: {
    page: number;
    limit: number;
    name: string;
    sourceDeviceName: string;
    destinationDeviceName: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshTriggers = useCallback(
        (data: GetTriggersResponse) => {
            if (data) {
                dispatch(triggersActions.refreshTriggers(data));
            }
        },
        [dispatch]
    );

    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.TRIGGERS}`,
        queryStrings: {
            page,
            limit,
            name,
            sourceDeviceName,
            destinationDeviceName,
        },
    });

    const { isLoading, error, fetchApi } = useFetchApi<GetTriggersResponse>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshTriggers,
    });

    return {
        isGettingTriggers: isLoading,
        getTriggersError: error,
        getTriggersApi: fetchApi,
    };
};

export const useGetTriggerApi = (id: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshTrigger = useCallback(
        (data: TriggerItem) => {
            if (data) {
                dispatch(triggersActions.refreshTrigger(data));
            }
        },
        [dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.TRIGGER}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, fetchApi } = useFetchApi<TriggerItem>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshTrigger,
    });

    return {
        isGettingTrigger: isLoading,
        getTriggerError: error,
        getTriggerApi: fetchApi,
    };
};

export const useCreateTriggerApi = ({
    sourceDeviceId,
    sourcePin,
    sourceThreshold,
    destinationDeviceId,
    destinationPin,
    destinationDeviceTargetState,
    operator,
    name,
    type,
    email,
}: EditedTrigger) => {
    const dispatch = useAppDispatch();
    const dispatchAddTrigger = useCallback(
        (data: TriggerItem) => {
            if (data) {
                dispatch(triggersActions.addTrigger(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.TRIGGERS}`;
    const { isLoading, error, data, fetchApi } = useFetchApi<TriggerItem>({
        apiPath,
        method: HTTP_METHOD.POST,
        payload: {
            name,
            sourceDeviceId,
            sourcePin,
            sourceThreshold,
            destinationDeviceId,
            destinationPin,
            destinationDeviceTargetState,
            operator,
            type,
            email,
        },
        initialData: null,
        callbackFunc: dispatchAddTrigger,
    });

    return {
        isCreatingTrigger: isLoading,
        createTriggerError: error,
        createTriggerResponse: data,
        createTriggerApi: fetchApi,
    };
};

export const useUpdateTriggerApi = ({
    trigerId,
    updatedData,
}: {
    trigerId: number;
    updatedData: EditedTrigger;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdateTrigger = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    triggersActions.updateTrigger({
                        id: trigerId,
                        ...updatedData,
                    })
                );
            }
        },
        [trigerId, updatedData, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.TRIGGER}`;
    apiPath = apiPath.replace(':id', trigerId.toString());

    const { isLoading, error, data, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: updatedData,
        initialData: null,
        callbackFunc: dispatchUpdateTrigger,
    });

    return {
        isUpdatingTrigger: isLoading,
        updateTriggerError: error,
        updateTriggerResponse: data,
        updateTriggerApi: fetchApi,
    };
};

export const useDeleteTriggersApi = (ids: number[]) => {
    const dispatch = useAppDispatch();
    const dispatchDeleteTriggers = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(triggersActions.deleteTriggers(ids));
            }
        },
        [ids, dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.TRIGGERS}`;

    const { isLoading, error, data, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        payload: ids,
        initialData: null,
        callbackFunc: dispatchDeleteTriggers,
    });

    return {
        isDeletingTriggers: isLoading,
        deleteTriggersError: error,
        deleteTriggersResponse: data,
        deleteTriggersApi: fetchApi,
    };
};
