import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { ResponseOK } from '@/types/response.type';
import { GroupDevicesType } from '@/types/group-devices.type';
import { groupDevicesActions } from '@/redux/reducers/group-devices.reducer';

export const useGetGroupDevicesApi = ({ groupId }: { groupId: number }) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: GroupDevicesType[]) => {
            if (data) {
                dispatch(groupDevicesActions.append(data));
            }
        },
        [dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.MY_GROUP_DEVICES}`;
    apiPath = apiPath.replace(':groupId', groupId.toString());

    const { isLoading, error, fetchApi, data } = useFetchApi<
        GroupDevicesType[]
    >({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isLoading,
        data,
        error,
        fetchApi,
    };
};

export const useCreateGroupDeviceApi = ({
    groupId,
    deviceId,
}: {
    groupId: number;
    deviceId: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: GroupDevicesType[]) => {
            if (data) {
                dispatch(groupDevicesActions.append(data));
            }
        },
        [dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.MY_GROUP_DEVICES}`;
    apiPath = apiPath.replace(':groupId', groupId.toString());

    const { isLoading, error, fetchApi, data } = useFetchApi<
        GroupDevicesType[]
    >({
        apiPath,
        method: HTTP_METHOD.POST,
        initialData: null,
        payload: [deviceId],
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isLoading,
        data,
        error,
        fetchApi,
    };
};

export const useDeleteGroupDevicesApi = ({
    groupId,
    id,
}: {
    groupId: number;
    id: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(groupDevicesActions.deleteMultiple({ ids: [id] }));
            }
        },
        // eslint-disable-next-line
        [dispatch, groupId, id]
    );
    let apiPath = `${API_URL}${END_POINT.MY_GROUP_DEVICES}`;
    apiPath = apiPath.replace(':groupId', groupId.toString());

    const { isLoading, error, fetchApi, data } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        initialData: null,
        payload: [id],
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};
