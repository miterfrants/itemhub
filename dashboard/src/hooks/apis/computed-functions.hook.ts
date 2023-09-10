import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { ApiHelpers } from '@/helpers/api.helper';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { ComputedFunctions } from '@/types/computed-functions.type';
import { computedFunctionsActions } from '@/redux/reducers/computed-functions.reducer';

export const useGetComputedFunctions = ({
    devicePins,
    monitorIds,
    groupId,
}: {
    devicePins?: {
        deviceId: number;
        pin: string;
    }[];
    monitorIds?: number[];
    groupId?: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: ComputedFunctions[]) => {
            if (data) {
                dispatch(computedFunctionsActions.refresh(data));
            }
        },
        [dispatch]
    );
    const queryStrings = {};
    devicePins?.forEach((devicePin, index) => {
        queryStrings[`devicePins[${index}].deviceId`] = devicePin.deviceId;
        queryStrings[`devicePins[${index}].pin`] = devicePin.pin;
    });
    monitorIds?.forEach((id, index) => {
        queryStrings[`monitorIds[${index}]`] = id;
    });
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.MY_COMPUTED_FUNCTIONS}`,
        queryStrings: {
            ...queryStrings,
            groupId,
        },
    });

    const { isLoading, error, fetchApi, data } = useFetchApi<
        ComputedFunctions[]
    >({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};

export const useCreateComputedFunction = ({
    deviceId,
    pin,
    monitorId,
    groupId,
    func,
    sourceDeviceId,
    sourcePin,
}: {
    deviceId?: number | null;
    pin?: string | null;
    monitorId?: number | null;
    groupId?: number | null;
    func?: string | null;
    sourceDeviceId?: null | number;
    sourcePin?: null | string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: ComputedFunctions) => {
            if (data) {
                dispatch(computedFunctionsActions.refresh([data]));
            }
        },
        [dispatch]
    );
    const { isLoading, error, fetchApi, data } = useFetchApi<ComputedFunctions>(
        {
            apiPath: `${API_URL}${END_POINT.MY_COMPUTED_FUNCTIONS}`,
            payload: {
                deviceId,
                pin,
                monitorId,
                groupId,
                func,
                sourceDeviceId,
                sourcePin,
            },
            method: HTTP_METHOD.POST,
            initialData: null,
            callbackFunc: dispatchRefresh,
        }
    );

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};

export const useUpdateComputedFunction = ({
    id,
    func,
    sourceDeviceId,
    sourcePin,
    groupId,
}: {
    id?: number | null;
    func?: string | null;
    sourceDeviceId?: number;
    sourcePin?: string;
    groupId?: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(() => {
        dispatch(
            computedFunctionsActions.updateFunc({
                id: id || 0,
                func: func || '',
                sourceDeviceId,
                sourcePin,
            })
        );
    }, [id, func, sourceDeviceId, sourcePin, dispatch]);
    const apiPath = `${API_URL}${END_POINT.MY_COMPUTED_FUNCTION}`.replace(
        ':id',
        (id || 0).toString()
    );
    const { isLoading, error, fetchApi, data } = useFetchApi<ComputedFunctions>(
        {
            apiPath,
            payload: {
                id,
                func,
                sourceDeviceId,
                sourcePin,
                groupId,
            },
            method: HTTP_METHOD.PATCH,
            initialData: null,
            callbackFunc: dispatchRefresh,
        }
    );

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};
