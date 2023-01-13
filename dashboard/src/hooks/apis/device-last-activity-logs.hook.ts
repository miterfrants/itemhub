import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { ApiHelpers } from '@/helpers/api.helper';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { DeviceLastActivityLog } from '@/types/devices.type';
import { deviceLastActivityLogsActions } from '@/redux/reducers/device-activity-logs.reducer';

interface GetDeviceLastActivityLogsResponseData {
    logs: DeviceLastActivityLog[];
}

export const useGetDeviceLastActivityLogApi = ({
    deviceIds,
}: {
    deviceIds: number[];
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDeviceLastActivityLogs = useCallback(
        (data: GetDeviceLastActivityLogsResponseData) => {
            if (data) {
                dispatch(deviceLastActivityLogsActions.refresh(data));
            }
        },
        [dispatch]
    );
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.DEVICE_LAST_ACTIVITY_LOGS}`,
        queryStrings: {
            deviceIds: deviceIds.join(','),
        },
    });

    const { isLoading, error, fetchApi } =
        useFetchApi<GetDeviceLastActivityLogsResponseData>({
            apiPath,
            method: HTTP_METHOD.GET,
            initialData: null,
            callbackFunc: dispatchRefreshDeviceLastActivityLogs,
        });

    return {
        isGetingDeviceLastActivityLogs: isLoading,
        getDeviceLastActivityLogsError: error,
        getDeviceLastActivityLogsApi: fetchApi,
    };
};
