import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { ApiHelpers } from '@/helpers/api.helper';
import { DeviceItem, DeviceLastActivityLog } from '@/types/devices.type';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { groupDevicesActions } from '@/redux/reducers/group-devices.reducer';
import { groupDeviceSummariesActions } from '@/redux/reducers/group-device-summaries.reducer';

interface GetDevicesResponseData {
    devices: DeviceItem[];
    rowNum: number;
}

export const useGetGroupAllDevicesApi = (groupId: number) => {
    const apiPath = `${API_URL}${END_POINT.GROUP_ALL_DEVICES}`.replace(
        ':groupId',
        groupId.toString()
    );

    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: DeviceItem[]) => {
            if (data) {
                dispatch(groupDeviceSummariesActions.update(data));
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
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useGetGroupDevicesApi = ({
    groupId,
    page,
    limit,
    name,
}: {
    groupId: number;
    page: number;
    limit: number;
    name: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: GetDevicesResponseData) => {
            if (data) {
                dispatch(groupDevicesActions.refresh(data));
            }
        },
        [dispatch]
    );
    let apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.GROUP_DEVICES}`,
        queryStrings: {
            page,
            limit,
            name,
        },
    });
    apiPath = apiPath.replace(':groupId', groupId.toString());

    const { isLoading, error, fetchApi, data } =
        useFetchApi<GetDevicesResponseData>({
            apiPath,
            method: HTTP_METHOD.GET,
            initialData: null,
            callbackFunc: dispatchRefreshDevices,
        });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};
export const useGetGroupDeviceApi = ({
    groupId,
    deviceId,
}: {
    groupId: number;
    deviceId: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchAction = useCallback(
        (data: DeviceItem) => {
            if (data) {
                dispatch(groupDevicesActions.refreshOne(data));
            }
        },
        // eslint-disable-next-line
        [dispatch, groupId, deviceId]
    );

    const apiPath = `${API_URL}${END_POINT.GROUP_DEVICE}`
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString());

    const { isLoading, error, fetchApi, data } = useFetchApi<DeviceItem>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchAction,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};

export const useGetLastGroupDeviceActivityApi = (
    groupId: number,
    deviceId: number
) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: DeviceLastActivityLog) => {
            if (data) {
                dispatch(
                    groupDevicesActions.refreshLastActivity({
                        deviceId: deviceId,
                        lastActivity: data.createdAt,
                    })
                );
            }
        },
        [dispatch, deviceId]
    );

    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_LAST_ACTIVITY}`;
    apiPath = apiPath
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString());

    return useFetchApi<DeviceLastActivityLog>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
        skipErrorToaster: true,
    });
};

export const useGetGroupLastDeviceImageThumbnailApi = (
    groupId: number,
    deviceId: number
) => {
    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_LAST_DEVICE_IMAGE_THUMBNAIL}`;
    apiPath = apiPath
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString());

    return useFetchApi<any>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        skipErrorToaster: true,
    });
};

export const useGetGroupLastDeviceImageApi = (
    groupId: number,
    deviceId: number
) => {
    let apiPath = `${API_URL}${END_POINT.GROUP_DEVICE_LAST_DEVICE_IMAGE}`;
    apiPath = apiPath
        .replace(':groupId', groupId.toString())
        .replace(':deviceId', deviceId.toString());

    return useFetchApi<any>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        skipErrorToaster: true,
    });
};
