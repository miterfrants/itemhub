import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { InvitationType } from '@/types/invitation.type';
import { invitationsActions } from '@/redux/reducers/invitations.reducer';
import { ResponseOK } from '@/types/response.type';

export const useGetInvitationsApi = ({ groupId }: { groupId: number }) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: InvitationType[]) => {
            if (data) {
                dispatch(invitationsActions.append(data));
            }
        },
        [dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.INVITATIONS}`;
    apiPath = apiPath.replace(':id', groupId.toString());

    const { isLoading, error, fetchApi } = useFetchApi<InvitationType[]>({
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

export const useCreateInvitationsApi = ({
    groupId,
    emails,
}: {
    groupId: number;
    emails: string[];
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefreshDevices = useCallback(
        (data: InvitationType[]) => {
            if (data) {
                dispatch(invitationsActions.append(data));
            }
        },
        [dispatch]
    );
    let apiPath = `${API_URL}${END_POINT.INVITATIONS}`;
    apiPath = apiPath.replace(':id', groupId.toString());

    const { isLoading, error, fetchApi } = useFetchApi<InvitationType[]>({
        apiPath,
        method: HTTP_METHOD.POST,
        payload: emails,
        initialData: null,
        callbackFunc: dispatchRefreshDevices,
    });

    return {
        isLoading,
        error,
        fetchApi,
    };
};

export const useDeleteInvitationsApi = ({
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
                dispatch(invitationsActions.deleteMultiple({ ids: [id] }));
            }
        },
        // eslint-disable-next-line
        [dispatch, groupId, id]
    );
    let apiPath = `${API_URL}${END_POINT.INVITATION}`;
    apiPath = apiPath.replace(':id', groupId.toString());
    apiPath = apiPath.replace(':invitationId', id.toString());

    const { isLoading, error, fetchApi, data } = useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
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
