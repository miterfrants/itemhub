import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { PinItem } from '@/types/devices.type';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { ResponseOK } from '@/types/response.type';
import { groupDevicePinsActions } from '@/redux/reducers/group-device-pins.reducer';
import { ApiHelpers } from '@/helpers/api.helper';

export const useGetGroupDevicePinsApi = ({
    groupId,
    deviceId,
}: {
    groupId: number;
    deviceId: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchAppendPins = useCallback(
        (data: PinItem[]) => {
            dispatch(groupDevicePinsActions.updatePins(data));
        },
        // eslint-disable-next-line
        [groupId, deviceId, dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_PINS}`;
    apiPath = apiPath.replace(':groupId', groupId.toString());
    apiPath = apiPath.replace(':deviceId', deviceId.toString());

    const { isLoading, error, data, fetchApi } = useFetchApi<PinItem[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchAppendPins,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useGetGroupDevicePinApi = ({
    groupId,
    deviceId,
    pin,
    skipErrorToaster,
}: {
    groupId: number;
    deviceId: number;
    pin: string;
    skipErrorToaster?: boolean;
}) => {
    const dispatch = useAppDispatch();
    const dispatchAppendPins = useCallback(
        (data: PinItem) => {
            dispatch(groupDevicePinsActions.updatePins([data]));
        },
        // eslint-disable-next-line
        [groupId, deviceId, pin, dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_PIN}`;
    apiPath = apiPath
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString())
        .replace(':pin', pin);

    const { isLoading, error, data, fetchApi } = useFetchApi<PinItem>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchAppendPins,
        skipErrorToaster,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useToggleGroupDeviceSwitchPinApi = ({
    groupId,
    deviceId,
    pin,
    value,
}: {
    groupId: number;
    deviceId: number;
    pin: string;
    value: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdatePin = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    groupDevicePinsActions.updatePin({ value, deviceId, pin })
                );
            }
        },
        [value, deviceId, pin, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_SWITCH_PIN}`;
    apiPath = apiPath
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString())
        .replace(':pin', pin);

    const { isLoading, error, fetchApi, data } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: {
            value,
        },
        initialData: null,
        callbackFunc: dispatchUpdatePin,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};
export const useGetGroupSensorLogsApi = ({
    deviceId,
    pin,
    page,
    limit,
    startAt,
    endAt,
    groupId,
    skipErrorToaster,
}: {
    deviceId: number;
    pin: string;
    page: number;
    limit: number;
    startAt?: string;
    endAt?: string;
    groupId: number;
    skipErrorToaster?: boolean;
}) => {
    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_SENSOR_LOGS}`;
    apiPath = apiPath
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString())
        .replace(':pin', pin);
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
        skipErrorToaster: skipErrorToaster,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useGetGroupSensorLogsAggregateApi = ({
    groupId,
    deviceId,
    pin,
    page,
    limit,
    startAt,
    endAt,
    statisticalMethods,
}: {
    groupId: number;
    deviceId: number;
    pin: string;
    page?: number;
    limit?: number;
    startAt?: string;
    endAt?: string;
    statisticalMethods?: number;
}) => {
    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_SENSOR_LOGS_AGGREGATE}`;
    apiPath = apiPath
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString())
        .replace(':pin', pin);
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
