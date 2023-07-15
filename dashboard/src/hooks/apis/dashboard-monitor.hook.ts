import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { DashboardMonitorItem } from '@/types/dashboard-monitors.type';
import { ResponseOK } from '@/types/response.type';
import { dashboardMonitorsActions } from '@/redux/reducers/dashboard-monitor.reducer';
import { ApiHelpers } from '@/helpers/api.helper';

export const useGetDashboardMonitorsApi = (groupId?: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDashboardMonitors = useCallback(
        (data: DashboardMonitorItem[]) => {
            if (data) {
                dispatch(dashboardMonitorsActions.update(data));
            }
        },
        [dispatch]
    );

    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.DASHBOARD_MONITORS}`,
        queryStrings: {
            groupId: groupId,
        },
    });

    const { isLoading, error, fetchApi, data } = useFetchApi<
        DashboardMonitorItem[]
    >({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDashboardMonitors,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useCreateDashboardMonitorApi = ({
    deviceId,
    groupId,
    pin,
    mode,
    row,
    column,
    customTitle,
}: {
    deviceId: number;
    groupId?: number;
    pin: string;
    mode: number;
    row: number;
    column: number;
    customTitle: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdate = useCallback(
        (data: DashboardMonitorItem) => {
            if (data) {
                dispatch(dashboardMonitorsActions.update([data]));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.DASHBOARD_MONITORS}`;
    const { isLoading, error, data, fetchApi } =
        useFetchApi<DashboardMonitorItem>({
            apiPath,
            method: HTTP_METHOD.POST,
            payload: {
                deviceId,
                groupId,
                pin,
                mode,
                row,
                column,
                sort: 1,
                customTitle,
            },
            initialData: null,
            callbackFunc: dispatchUpdate,
        });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useUpdateDashboardMonitorSortingApi = (
    sortingData: {
        id: number;
        sort: number;
    }[]
) => {
    const dispatch = useAppDispatch();
    const dispatchUpdateSorting = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(dashboardMonitorsActions.updateSorting(sortingData));
            }
        },
        [dispatch, sortingData]
    );

    const apiPath = `${API_URL}${END_POINT.DASHBOARD_MONITORS_SORTING}`;
    const { isLoading, error, data, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: sortingData,
        initialData: null,
        callbackFunc: dispatchUpdateSorting,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useUpdateDashboardMonitorApi = ({
    id,
    deviceId,
    groupId,
    row,
    column,
    pin,
    mode,
    customTitle,
}: {
    id: number;
    deviceId: number;
    groupId?: number;
    row: number;
    column: number;
    pin: string;
    mode: number;
    customTitle: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdateDashboardMonitor = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    dashboardMonitorsActions.update([
                        {
                            id,
                            deviceId,
                            row,
                            column,
                            pin,
                            mode,
                            customTitle,
                            groupId,
                        } as DashboardMonitorItem,
                    ])
                );
            }
        },
        [id, deviceId, groupId, row, column, pin, mode, customTitle, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.DASHBOARD_MONITOR}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, data, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: { id, deviceId, row, column, pin, customTitle, mode, groupId },
        initialData: null,
        callbackFunc: dispatchUpdateDashboardMonitor,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};

export const useDeleteDashboardMonitorsApi = (ids: number[]) => {
    const dispatch = useAppDispatch();
    const dispatchDeleteDashboardMonitors = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(dashboardMonitorsActions.delete(ids));
            }
        },
        [ids, dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.DASHBOARD_MONITORS}`;

    const { isLoading, error, data, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        payload: ids,
        initialData: null,
        callbackFunc: dispatchDeleteDashboardMonitors,
    });

    return {
        isLoading,
        error,
        data,
        fetchApi,
    };
};
