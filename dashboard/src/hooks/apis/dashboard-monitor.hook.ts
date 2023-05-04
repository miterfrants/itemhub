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

export const useGetDashboardMonitorsApi = () => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDashboardMonitors = useCallback(
        (data: DashboardMonitorItem[]) => {
            if (data) {
                dispatch(dashboardMonitorsActions.update(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.DASHBOARD_MONITORS}`;

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
    pin,
    mode,
    row,
    column,
    customTitle,
}: {
    deviceId: number;
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
        [dispatch]
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
    updatedData,
}: {
    id: number;
    updatedData: {
        sort: number;
        row: number;
        column: number;
        deviceId: number;
        pin: string;
    };
}) => {
    const dispatch = useAppDispatch();
    const dispatchUpdateDashboardMonitor = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    dashboardMonitorsActions.update([
                        {
                            id,
                            ...updatedData,
                        } as DashboardMonitorItem,
                    ])
                );
            }
        },
        [id, updatedData, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.DASHBOARD_MONITORS}`;
    apiPath = apiPath.replace(':id', id.toString());

    const { isLoading, error, data, fetchApi } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        payload: updatedData,
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
