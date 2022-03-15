import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { devicesActions } from '@/redux/reducers/devices.reducer';
import { DeviceItem, PinItem } from '@/types/devices.type';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { ResponseOK } from '@/types/response.type';
import { pinsActions } from '@/redux/reducers/pins.reducer';

interface GetDevicesResponseData {
    devices: DeviceItem[];
    rowNum: number;
}

export const useGetDevicesApi = ({
    page,
    limit,
}: {
    page: number;
    limit: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: GetDevicesResponseData) => {
            if (data) {
                dispatch(devicesActions.refreshDevices(data.devices));
            }
        },
        [dispatch]
    );
    const apiPath = `${API_URL}${END_POINT.DEVICES}?page=${page}&limit=${limit}`;

    const { isLoading, error, fetchApi } = useFetchApi<GetDevicesResponseData>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isLoading,
        error,
        getDevicesApi: fetchApi,
    };
};

export const useGetDeviceApi = ({ id }: { id: number }) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevice = useCallback(
        (data: DeviceItem) => {
            dispatch(devicesActions.refreshDevice(data));
        },
        [dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, fetchApi } = useFetchApi<DeviceItem>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDevice,
    });

    return {
        isLoading,
        error,
        getDeviceApi: fetchApi,
    };
};

export const useUpdateDeviceApi = ({
    id,
    editedData,
}: {
    id: number;
    editedData: Partial<DeviceItem>;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(devicesActions.updateDevice({ ...editedData, id }));
            }
        },
        [editedData, id, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: editedData,
        initialData: null,
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isLoading,
        error,
        updateDeviceApi: fetchApi,
    };
};

export const useGetDevicePinsApi = ({ id }: { id: number }) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshPins = useCallback(
        (data: PinItem[]) => {
            dispatch(pinsActions.refreshPins(data));
        },
        [id, dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.DEVICE_PINS}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, data, fetchApi } = useFetchApi<PinItem[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshPins,
    });

    return {
        isLoading,
        error,
        devicePins: data,
        getDevicePinsApi: fetchApi,
    };
};

export const useUpdateDevicePinNameApi = ({
    deviceId,
    pin,
    name,
    callback,
}: {
    deviceId: number;
    pin: string;
    name: string | null;
    callback: () => void;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdatePin = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                callback();
                dispatch(pinsActions.updatePin({ name, deviceId, pin }));
            }
        },
        [name, deviceId, pin, dispatch, callback]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE_PIN}`;
    apiPath = apiPath.replace(':id', deviceId.toString()).replace(':pin', pin);

    const { isLoading, error, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: {
            name: name,
        },
        initialData: null,
        callbackFunc: dispatchUpdatePin,
    });

    return {
        isLoading,
        error,
        updateDevicePinNameApi: fetchApi,
    };
};

export const useUpdateDeviceSwitchPinApi = ({
    deviceId,
    pin,
    value,
}: {
    deviceId: number;
    pin: string;
    value: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdatePin = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(pinsActions.updatePin({ value, deviceId, pin }));
            }
        },
        [value, deviceId, pin, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE_SWITCH_PIN}`;
    apiPath = apiPath.replace(':id', deviceId.toString()).replace(':pin', pin);

    const { isLoading, error, fetchApi } = useFetchApi<ResponseOK>({
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
        updateDeviceSwitchPinApi: fetchApi,
    };
};
