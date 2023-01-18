import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { ApiHelpers } from '@/helpers/api.helper';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import { DeviceLastActivityLog } from '@/types/devices.type';
import { deviceLastActivityLogsActions } from '@/redux/reducers/device-activity-logs.reducer';

export const useGetDeviceLastActivityLogApi = ({
    deviceId,
}: {
    deviceId: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDeviceLastActivityLog = useCallback(
        (data: DeviceLastActivityLog) => {
            if (data) {
                dispatch(deviceLastActivityLogsActions.refresh(data));
            }
        },
        [dispatch]
    );
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.DEVICE_LAST_ACTIVITY_LOGS}`,
        queryStrings: {
            deviceId: deviceId,
        },
    });

    const { isLoading, error, fetchApi } = useFetchApi<DeviceLastActivityLog>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDeviceLastActivityLog,
    });

    return {
        isGetingDeviceLastActivityLog: isLoading,
        getDeviceLastActivityLogError: error,
        getDeviceLastActivityLogApi: fetchApi,
    };
};
