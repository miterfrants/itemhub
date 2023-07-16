import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { ApiHelpers } from '@/helpers/api.helper';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { GroupNameType, GroupType } from '@/types/group.type';
import { groupsActions } from '@/redux/reducers/groups.reducer';
import { ResponseOK } from '@/types/response.type';
import { JoinGroupType } from '@/types/join-group.type';

interface GetResponseData {
    groups: GroupType[];
    rowNum: number;
}

export const useGetGroupsApi = ({
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
        (data: GetResponseData) => {
            if (data) {
                dispatch(groupsActions.refresh(data));
            }
        },
        [dispatch]
    );
    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.GROUPS}`,
        queryStrings: {
            page,
            limit,
            name,
        },
    });

    const { isLoading, error, fetchApi } = useFetchApi<GetResponseData>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isLoading,
        error,
        fetchApi,
    };
};

export const useDeleteGroupsApi = (ids: number[]) => {
    const dispatch = useAppDispatch();
    const dispatchDelete = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(groupsActions.deleteMultiple({ ids }));
            }
        },
        [ids, dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.GROUPS}`;

    const { isLoading, error, fetchApi, data } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        payload: ids,
        initialData: null,
        callbackFunc: dispatchDelete,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};

export const useGetGroupApi = (id: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: GroupType) => {
            if (data) {
                dispatch(groupsActions.refreshOne(data));
            }
        },
        [dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.GROUP}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<GroupType>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useCreateGroupApi = (data: Partial<GroupType>) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (response: GroupType) => {
            if (response) {
                dispatch(groupsActions.refreshOne(response));
            }
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.GROUPS}`;

    return useFetchApi<GroupType>({
        apiPath,
        payload: {
            ...data,
        },
        method: HTTP_METHOD.POST,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useUpdateGroupApi = (data: GroupType) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (response: ResponseOK) => {
            if (response.status === RESPONSE_STATUS.OK) {
                dispatch(groupsActions.refreshOne(data));
            }
        },
        [dispatch, data]
    );

    let apiPath = `${API_URL}${END_POINT.GROUP}`;
    apiPath = apiPath.replace(':id', (data.id || 0).toString());

    return useFetchApi<ResponseOK>({
        apiPath,
        payload: {
            name: data.name,
        },
        method: HTTP_METHOD.PATCH,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useJoinGroupApi = (data: JoinGroupType) => {
    let apiPath = `${API_URL}${END_POINT.JOIN_GROUP}`;
    apiPath = apiPath.replace(':groupId', (data.groupId || 0).toString());
    apiPath = apiPath.replace(
        ':invitationId',
        (data.invitationId || 0).toString()
    );

    return useFetchApi<ResponseOK>({
        apiPath,
        payload: {
            id: data.groupId,
            token: data.token,
        },
        method: HTTP_METHOD.POST,
        initialData: null,
    });
};

export const useGetGroupNamesApi = (groupIds: number[]) => {
    const apiPath = `${API_URL}${END_POINT.GROUP_NAMES}?${groupIds
        .map((item) => `groupIds=${item}`)
        .join('&')}`;

    const { isLoading, error, fetchApi, data } = useFetchApi<GroupNameType[]>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
    });

    return {
        isLoading,
        error,
        fetchApi,
        data,
    };
};
