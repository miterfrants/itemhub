import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux.hook';
import {
    useCreateOauthClients,
    useGetOauthClient,
    useRevokeSecretOauthClient,
} from '@/hooks/apis/oauth-clients.hook';
import { selectOauthClients } from '@/redux/reducers/oauth-clients.reducer';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    useUpdateOauthClient,
    useDeleteOauthClients,
} from '@/hooks/apis/oauth-clients.hook';
import { RESPONSE_STATUS } from '@/constants/api';
import PageTitle from '@/components/page-title/page-title';
import refreshIcon from '@/assets/images/refresh.svg';
import lightTrashIcon from '@/assets/images/light-trash.svg';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';
import plusIcon from '@/assets/images/icon-plus.svg';
import { useDispatch } from 'react-redux';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import OauthClientRedirectUri from '@/components/oauth-client-redirect-uri/oauth-client-redirect-uri';

const OauthClient = () => {
    const { id: idFromUrl } = useParams();
    const id: number | null = idFromUrl ? Number(idFromUrl) : null;
    const isCreateMode = id === null;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { oauthClients } = useAppSelector(selectOauthClients);

    const oauthClient = (oauthClients || []).filter(
        (item) => item.id === Number(id)
    )[0];
    const oauthClientId = oauthClient ? oauthClient.clientId : '';

    const [clientId, setClientId] = useState(oauthClientId);

    const { isLoading: isGetting, fetchApi: getApi } = useGetOauthClient(
        Number(id)
    );

    const { fetchApi: updateApi, isLoading: isUpdating } = useUpdateOauthClient(
        { id: Number(id), clientId }
    );

    const {
        fetchApi: revokeSecretApi,
        isLoading: isRevoking,
        data: revokeSecretResponse,
    } = useRevokeSecretOauthClient(Number(id));

    const {
        fetchApi: deleteApi,
        isLoading: isDeleting,
        data: deleteOAuthClientResponse,
    } = useDeleteOauthClients([Number(id)]);

    const {
        fetchApi: createApi,
        isLoading: isCreating,
        data: createOAuthClientResponse,
    } = useCreateOauthClients({ clientId });

    useEffect(() => {
        if (isCreateMode) {
            document.title = 'ItemHub - 新增 oAuthClient';
        } else {
            document.title = 'ItemHub - 編輯 oAuthClient';
        }
    }, []);

    useEffect(() => {
        if (oauthClient || isDeleting || isCreateMode) {
            return;
        }
        getApi();
    }, [getApi, oauthClient, isDeleting, isCreateMode]);

    useEffect(() => {
        setClientId(oauthClientId);
    }, [oauthClientId]);

    useEffect(() => {
        if (deleteOAuthClientResponse?.status === RESPONSE_STATUS.OK) {
            dispatch(
                toasterActions.pushOne({
                    message: 'oAuthClient 已經成功刪除',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
            navigate('/dashboard/oauth-clients', { replace: true });
        }
    }, [deleteOAuthClientResponse]);

    useEffect(() => {
        if (createOAuthClientResponse && !isNaN(createOAuthClientResponse.id)) {
            dispatch(
                toasterActions.pushOne({
                    message: '新增 oAuthClient 成功',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
            navigate(
                `/dashboard/oauth-clients/${createOAuthClientResponse?.id}`
            );
        }
    }, [createOAuthClientResponse]);

    const backToList = () => {
        navigate('/dashboard/oauth-clients');
    };

    const deleteClient = () => {
        dispatch(
            dialogActions.open({
                message: '刪除後將無法復原, 請輸入 DELETE 完成刪除',
                title: '確認刪除 oAuthClient ?',
                type: DialogTypeEnum.PROMPT,
                checkedMessage: 'DELETE',
                callback: deleteApi,
                promptInvalidMessage: '輸入錯誤',
            })
        );
    };

    const breadcrumbs = [
        {
            label: 'oAuthClient 列表',
            pathName: '/dashboard/oauth-clients',
        },
        {
            label: isCreateMode ? '新增' : '編輯',
            pathName: useLocation().pathname,
        },
    ];

    return (
        <div
            className="form-data oauth-client mx-auto"
            data-testid="oauth-client"
        >
            <PageTitle
                title="oAuthClient 詳細內容"
                breadcrumbs={breadcrumbs}
                titleClickCallback={backToList}
                titleBackIconVisible
                primaryButtonVisible={!isCreateMode}
                primaryButtonWording="刪除"
                primaryButtonCallback={deleteClient}
                primaryButtonIcon={lightTrashIcon}
                primaryButtonClassName="btn btn-danger"
            />
            <div className="card">
                {isGetting ? (
                    <div>Loading</div>
                ) : (
                    <div className="p-4">
                        <div className="mb-4">
                            <label className="mb-2">Client Id</label>
                            <input
                                type="text"
                                className="form-control"
                                value={clientId}
                                placeholder="如果不填寫 clientId 系統會自動會幫你隨機產生"
                                onChange={(e) => setClientId(e.target.value)}
                                disabled={!isCreateMode}
                            />
                        </div>
                        <div>
                            <label className="mb-2">Client Secret</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder={
                                    isCreateMode
                                        ? ''
                                        : '****************************'
                                }
                                value={revokeSecretResponse?.secret}
                                disabled
                            />
                        </div>
                        <div className="text-warn mt-3 d-flex">
                            <div className="mt-1 me-1 bg-warn text-white rounded-circle flex-shrink-0">
                                !
                            </div>
                            <div>
                                請立即記下 Client Secret, 為確保安全性,
                                伺服器端不會儲存 Secret 明碼,
                                如果忘記明碼只能重新產生
                            </div>
                        </div>
                        <div className="d-flex justify-content-end mt-5">
                            <button
                                className="btn btn-secondary"
                                onClick={backToList}
                            >
                                返回
                            </button>
                            {isCreateMode ? (
                                <button
                                    className="btn btn-primary ms-3"
                                    disabled={isCreating}
                                    onClick={createApi}
                                >
                                    <img
                                        src={plusIcon}
                                        alt="plus"
                                        className="icon"
                                    />
                                    <div>確定新增</div>
                                </button>
                            ) : (
                                <div>
                                    <button
                                        className="btn btn-primary ms-3"
                                        disabled={isRevoking}
                                        onClick={revokeSecretApi}
                                    >
                                        <img
                                            className="me-2"
                                            src={refreshIcon}
                                        />
                                        {isRevoking
                                            ? 'Revoking'
                                            : 'Revoke Client Secret'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <OauthClientRedirectUri oauthClientId={id} />
        </div>
    );
};

export default OauthClient;
