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
import { GroupUsersType } from '@/types/group-users.type';
import { groupUsersActions } from '@/redux/reducers/group-users.reducer';

export const useGetGroupUsersApi = ({ groupId }: { groupId: number }) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: GroupUsersType[]) => {
            if (data) {
                dispatch(groupUsersActions.append(data));
            }
        },
        [dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.MY_GROUP_USERS}`;
    apiPath = apiPath.replace(':id', groupId.toString());

    const { isLoading, error, fetchApi, data } = useFetchApi<GroupUsersType[]>({
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

export const useDeleteGroupUsersApi = ({
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
                dispatch(groupUsersActions.deleteMultiple({ ids: [id] }));
            }
        },
        // eslint-disable-next-line
        [dispatch, groupId, id]
    );
    let apiPath = `${API_URL}${END_POINT.MY_GROUP_USERS}`;
    apiPath = apiPath.replace(':id', groupId.toString());

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
