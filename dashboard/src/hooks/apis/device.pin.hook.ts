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
import { pinsActions } from '@/redux/reducers/pins.reducer';

export const useGetDevicePinsApi = ({ id }: { id: number }) => {
    const dispatch = useAppDispatch();
    const dispatchAppendPins = useCallback(
        (data: PinItem[]) => {
            dispatch(pinsActions.updatePins(data));
        },
        // eslint-disable-next-line
        [id, dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.DEVICE_PINS}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, data, fetchApi } = useFetchApi<PinItem[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchAppendPins,
    });

    return {
        isLoading,
        error,
        devicePins: data,
        getDevicePinsApi: fetchApi,
    };
};

export const useGetDevicePinApi = ({
    id,
    pin,
}: {
    id: number;
    pin: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchAppendPins = useCallback(
        (data: PinItem) => {
            dispatch(pinsActions.updatePins([data]));
        },
        // eslint-disable-next-line
        [id, dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.DEVICE_PIN}`;
    apiPath = apiPath.replace(':id', id.toString()).replace(':pin', pin);

    const { isLoading, error, data, fetchApi } = useFetchApi<PinItem>({
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

export const useUpdateDevicePinNameApi = ({
    deviceId,
    pin,
    name,
    callbackFunc,
}: {
    deviceId: number;
    pin: string;
    name: string | null;
    callbackFunc: () => void;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdatePin = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                if (callbackFunc) callbackFunc();
                dispatch(pinsActions.updatePin({ name, deviceId, pin }));
            }
        },
        [name, deviceId, pin, dispatch, callbackFunc]
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

export const useBundleFirmwareApi = ({ id }: { id: number }) => {
    let apiPath = `${API_URL}${END_POINT.DEVICE_BUNDLE_FIRMWARE}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, data, fetchApi } = useFetchApi<{
        bundleId: string;
    }>({
        apiPath,
        method: HTTP_METHOD.POST,
        initialData: null,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};

export const useCreatePinsApi = (id: number, pins: PinItem[]) => {
    const dispatch = useAppDispatch();
    const dispatchAppendPins = useCallback(
        (data: PinItem[]) => {
            if (data.length > 0) {
                dispatch(pinsActions.updatePins(data));
            }
        },
        [dispatch, pins]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE_PINS}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<PinItem[]>({
        apiPath,
        method: HTTP_METHOD.POST,
        payload: pins,
        initialData: null,
        callbackFunc: dispatchAppendPins,
    });
};

export const useUpdatePinsApi = (id: number, pins: PinItem[]) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(pinsActions.updatePins(pins));
            }
        },
        [dispatch, pins]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE_PINS}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: pins,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useDeletePinsApi = (id: number, pins: PinItem[]) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    pinsActions.deleteMultiple({
                        pins: pins.map((item) => item.pin),
                    })
                );
            }
        },
        [dispatch, pins]
    );
    let apiPath = `${API_URL}${END_POINT.DEVICE_PINS}?pins=${pins
        .map((item) => item.pin)
        .join(',')}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};
