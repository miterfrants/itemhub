import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { devicesActions } from '@/redux/reducers/devices.reducer';
import { ApiHelpers } from '@/helpers/api.helper';
import {
    DeviceItem,
    DeviceLastActivityLog,
    PinItem,
} from '@/types/devices.type';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { ResponseOK } from '@/types/response.type';

interface GetDevicesResponseData {
    devices: DeviceItem[];
    rowNum: number;
}

export const useGetDevicesApi = ({
    page,
    limit,
    name,
}: {
    page: number;
    limit: number;
    name: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: GetDevicesResponseData) => {
            if (data) {
                dispatch(devicesActions.refresh(data));
            }
        },
        [dispatch]
    );
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.DEVICES}`,
        queryStrings: {
            page,
            limit,
            name,
        },
    });

    const { isLoading, error, fetchApi } = useFetchApi<GetDevicesResponseData>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isGetingDevices: isLoading,
        getDevicesError: error,
        getDevicesApi: fetchApi,
    };
};

export const useGetAllDevicesApi = () => {
    const apiPath = `${API_URL}${END_POINT.All_DEVICES}`;

    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: DeviceItem[]) => {
            if (data) {
                dispatch(
                    devicesActions.refresh({
                        devices: data,
                        rowNum: data.length,
                    })
                );
            }
        },
        [dispatch]
    );
    const { isLoading, data, error, fetchApi } = useFetchApi<DeviceItem[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isGetingAllDevices: isLoading,
        getAllDevicesError: error,
        allDevices: data || [],
        getAllDevicesApi: fetchApi,
    };
};

export const useGetDeviceApi = (id: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: DeviceItem) => {
            if (data) {
                dispatch(devicesActions.refreshOne(data));
            }
        },
        [dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<DeviceItem>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useGetLastDeviceActivityApi = (id: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: DeviceLastActivityLog) => {
            if (data) {
                dispatch(
                    devicesActions.refreshLastActivity({
                        deviceId: id,
                        lastActivity: data.createdAt,
                    })
                );
            }
        },
        [dispatch, id]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE_LAST_ACTIVITY}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<DeviceLastActivityLog>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
        skipErrorToaster: true,
    });
};

export const useUpdateDeviceApi = ({
    id,
    editedData,
}: {
    id: number;
    editedData: Partial<DeviceItem>;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdate = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(devicesActions.update({ ...editedData, id }));
            }
        },
        [editedData, id, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.DEVICE}`;
    apiPath = apiPath.replace(':id', id.toString());

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
        updateDeviceApi: fetchApi,
        data,
    };
};

export const useDeleteDevicesApi = (ids: number[]) => {
    const dispatch = useAppDispatch();
    const dispatchDeleteDeivce = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(devicesActions.deleteMultiple({ ids }));
            }
        },
        [ids, dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.DEVICES}`;

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

export const useBundleFirmwareApi = ({ id }: { id: number }) => {
    let apiPath = `${API_URL}${END_POINT.DEVICE_BUNDLE_FIRMWARE}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, data, fetchApi, httpStatus } = useFetchApi<{
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
        httpStatus,
    };
};

export const useCreateDeviceApi = (
    name: string,
    microcontroller: number,
    protocol: number
) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (response: DeviceItem) => {
            dispatch(devicesActions.addOne(response));
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.DEVICES}`;

    return useFetchApi<DeviceItem>({
        apiPath,
        method: HTTP_METHOD.POST,
        payload: {
            name,
            microcontroller,
            protocol,
        },
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};
