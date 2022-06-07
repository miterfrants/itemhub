import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux.hook';
import { useFetchApi } from '@/hooks/apis/fetch.hook';
import { oauthClientsActions } from '@/redux/reducers/oauth-clients.reducer';
import { ApiHelpers } from '@/helpers/api.helper';
import {
    API_URL,
    END_POINT,
    HTTP_METHOD,
    RESPONSE_STATUS,
} from '@/constants/api';
import { OauthClient } from '@/types/oauth-clients.type';
import { ResponseOK } from '@/types/response.type';

interface PaginationOauthClientType {
    oauthClients: OauthClient[];
    rowNum: number;
}

export const useGetOauthClients = ({
    page,
    limit,
}: {
    page: number;
    limit: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: PaginationOauthClientType) => {
            if (data) {
                dispatch(oauthClientsActions.refresh(data));
            }
        },
        [dispatch]
    );

    const apiPath = ApiHelpers.AppendQueryStrings({
        basicPath: `${API_URL}${END_POINT.OAUTH_CLIENTS}`,
        queryStrings: {
            page,
            limit,
            isDeviceClient: false,
        },
    });

    return useFetchApi<PaginationOauthClientType>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useGetOauthClient = (id: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: OauthClient) => {
            if (data) {
                dispatch(oauthClientsActions.refreshOne(data));
            }
        },
        [dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.OAUTH_CLIENT}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<OauthClient>({
        apiPath,
        method: HTTP_METHOD.GET,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useUpdateOauthClient = ({
    id,
    clientId,
}: {
    id: number;
    clientId: string;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    oauthClientsActions.updateOne({
                        clientId,
                        id,
                    })
                );
            }
        },
        [clientId, id, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.OAUTH_CLIENT}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.PATCH,
        initialData: null,
        payload: {
            clientId,
        },
        callbackFunc: dispatchRefresh,
    });
};

export const useRevokeSecretOauthClient = (id: number) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: { secret: string }) => {
            if (data.secret) {
                dispatch(
                    oauthClientsActions.updateOne({
                        id,
                        clientSecrets: data.secret,
                    })
                );
            }
        },
        [id, dispatch]
    );

    let apiPath = `${API_URL}${END_POINT.OAUTH_CLIENT_REVOKE_SECRET}`;
    apiPath = apiPath.replace(':id', id.toString());

    return useFetchApi<{ secret: string }>({
        apiPath,
        method: HTTP_METHOD.POST,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useDeleteOauthClients = (ids: number[]) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (data: ResponseOK) => {
            if (data.status === RESPONSE_STATUS.OK) {
                dispatch(
                    oauthClientsActions.deleteMultiple({
                        ids,
                    })
                );
            }
        },
        [ids, dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.OAUTH_CLIENTS}`;

    return useFetchApi<ResponseOK>({
        apiPath,
        method: HTTP_METHOD.DELETE,
        payload: ids,
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};

export const useCreateOauthClients = ({
    clientId,
    deviceId,
}: {
    clientId: string;
    deviceId?: number;
}) => {
    const dispatch = useAppDispatch();
    const dispatchRefresh = useCallback(
        (response: OauthClient) => {
            dispatch(oauthClientsActions.addOne(response));
        },
        [dispatch]
    );

    const apiPath = `${API_URL}${END_POINT.OAUTH_CLIENTS}`;

    return useFetchApi<OauthClient>({
        apiPath,
        method: HTTP_METHOD.POST,
        payload: {
            clientId,
            deviceId,
        },
        initialData: null,
        callbackFunc: dispatchRefresh,
    });
};
