import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { devicesActions } from '@/redux/reducers/devices.reducer';
import { ApiHelpers } from '@/helpers/api.helper';
import { DeviceItem, DeviceLastActivityLog } from '@/types/devices.type';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { ResponseOK } from '@/types/response.type';
import { deviceSummariesActions } from '@/redux/reducers/device-summaries.reducer';

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
    const dispatchRefreshDeviceSummaries = useCallback(
        (data: DeviceItem[]) => {
            if (data) {
                dispatch(deviceSummariesActions.update(data));
            }
        },
        [dispatch]
    );

    const { isLoading, data, error, fetchApi } = useFetchApi<DeviceItem[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDeviceSummaries,
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

    const dispatchUpdateSumamries = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    deviceSummariesActions.update([
                        { ...editedData, id } as DeviceItem,
                    ])
                );
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
        callbackFunc: (data) => {
            console.log(data);
            dispatchUpdate(data);
            dispatchUpdateSumamries(data);
        },
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
    const dispatchDeleteDevice = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(devicesActions.deleteMultiple({ ids }));
            }
        },
        [ids, dispatch]
    );

    const dispatchDeleteDeviceSummary = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(deviceSummariesActions.delete(ids));
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
        callbackFunc: (data) => {
            dispatchDeleteDevice(data);
            dispatchDeleteDeviceSummary(data);
        },
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
    const dispatchUpdateSummaries = useCallback(
        (response: DeviceItem) => {
            dispatch(deviceSummariesActions.update([response]));
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
        callbackFunc: (data) => {
            dispatchRefresh(data);
            dispatchUpdateSummaries(data);
        },
    });
};

export const useGetLastDeviceImageThumbnailApi = (id: number) => {
    let apiPath = `${API_URL}${END_POINT.DEVICE_LAST_DEVICE_IMAGE_THUMBNAIL}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<any>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        skipErrorToaster: true,
    });
};

export const useGetLastDeviceImageApi = (id: number) => {
    let apiPath = `${API_URL}${END_POINT.DEVICE_LAST_DEVICE_IMAGE}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<any>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        skipErrorToaster: true,
    });
};
