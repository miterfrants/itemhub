import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { universalActions } from '@/redux/reducers/universal.reducer';
import { API_URL, END_POINT, HTTP_METHOD } from '@/constants/api';
import {
    DeviceMode,
    TriggerOerator,
    Microcontroller,
    DashboardMonitorMode,
    Protocols,
    UniversalOption,
} from '@/types/universal.type';

export const useGetTriggerOperatorsApi = () => {
    const dispatch = useAppDispatch();
    const dispatchSetTriggerOperators = useCallback(
        (data: TriggerOerator[]) => {
            if (data) {
                dispatch(universalActions.setTriggerOperators(data));
            }
        },
        [dispatch]
    );
    const apiPath = `${API_URL}${END_POINT.TRIGGER_OPERATORS}`;

    const { isLoading, error, fetchApi } = useFetchApi<TriggerOerator[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchSetTriggerOperators,
    });

    return {
        gettingTriggerOperators: isLoading,
        gettingTriggerOperatorsErr: error,
        getTriggerOperatorsApi: fetchApi,
    };
};

export const useGetMicrocontrollersApi = () => {
    const dispatch = useAppDispatch();
    const dispatchSetMicrocontrollers = useCallback(
        (data: Microcontroller[]) => {
            if (data) {
                dispatch(universalActions.setMicrocontrollers(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.MICROCONTROLLER}`;

    const { isLoading, error, fetchApi } = useFetchApi<Microcontroller[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchSetMicrocontrollers,
    });

    return {
        gettingMicrocontrollers: isLoading,
        gettingMicrocontrollersErr: error,
        getMicrocontrollersApi: fetchApi,
    };
};

export const useGetDeviceModesApi = () => {
    const dispatch = useAppDispatch();
    const dispatchSetDeviceModes = useCallback(
        (data: DeviceMode[]) => {
            if (data) {
                dispatch(universalActions.setDeviceModes(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.PIN_TYPES}`;

    const { isLoading, error, fetchApi } = useFetchApi<DeviceMode[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchSetDeviceModes,
    });

    return {
        isLoading,
        error,
        getDeviceModesApi: fetchApi,
    };
};

export const useGetDashboardMonitorModesApi = () => {
    const dispatch = useAppDispatch();
    const dispatchSetDashboardMonitorModes = useCallback(
        (data: DashboardMonitorMode[]) => {
            if (data) {
                dispatch(universalActions.setDashboardMonitorModes(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.DASHBOARD_MONITOR_MODE}`;

    const { isLoading, error, fetchApi } = useFetchApi<DeviceMode[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchSetDashboardMonitorModes,
    });

    return {
        isLoading,
        error,
        getDashboardMonitorModesApi: fetchApi,
    };
};

export const useGetProtocols = () => {
    const dispatch = useAppDispatch();
    const dispatchGetProtocols = useCallback(
        (data: Protocols[]) => {
            if (data) {
                dispatch(universalActions.setProtocols(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.PROTOCOLS}`;

    const { isLoading, error, fetchApi } = useFetchApi<DeviceMode[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchGetProtocols,
    });

    return {
        isLoading,
        error,
        getProtocols: fetchApi,
    };
};

export const useGetPipelineItemTypes = () => {
    const dispatch = useAppDispatch();
    const dispatchGet = useCallback(
        (data: UniversalOption[]) => {
            if (data) {
                dispatch(universalActions.setPipelineItemTypes(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.PIPELINE_ITEM_TYPES}`;

    const { isLoading, error, fetchApi } = useFetchApi<DeviceMode[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchGet,
    });

    return {
        isLoading,
        error,
        fetchApi,
    };
};

export const useGetPipelineNotificationTypes = () => {
    const dispatch = useAppDispatch();
    const dispatchGet = useCallback(
        (data: UniversalOption[]) => {
            if (data) {
                dispatch(universalActions.setPipelineNotificationTypes(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.PIPELINE_NOTIFICATION_TYPES}`;

    const { isLoading, error, fetchApi } = useFetchApi<UniversalOption[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchGet,
    });

    return {
        isLoading,
        error,
        fetchApi,
    };
};

export const useGetPipelineStaticMethods = () => {
    const dispatch = useAppDispatch();
    const dispatchGet = useCallback(
        (data: UniversalOption[]) => {
            if (data) {
                dispatch(universalActions.setPipelineDeviceStaticMethods(data));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.PIPELINE_DEVICE_STATIC_METHODS}`;

    const { isLoading, error, fetchApi } = useFetchApi<UniversalOption[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchGet,
    });

    return {
        isLoading,
        error,
        fetchApi,
    };
};
