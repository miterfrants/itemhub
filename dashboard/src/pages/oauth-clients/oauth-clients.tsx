import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@/hooks/query.hook';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import {
    useDeleteOauthClients,
    useGetOauthClients,
} from '@/hooks/apis/oauth-clients.hook';
import { selectOauthClients } from '@/redux/reducers/oauth-clients.reducer';
import Pagination from '@/components/pagination/pagination';
import { RESPONSE_STATUS } from '@/constants/api';
import PageTitle from '@/components/page-title/page-title';
import pencilIcon from '@/assets/images/pencil.svg';
import lightTrashIcon from '@/assets/images/light-trash.svg';
import trashIcon from '@/assets/images/trash.svg';
import plusIcon from '@/assets/images/icon-plus.svg';
import emptyImage from '@/assets/images/empty-image.svg';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';
import ReactTooltip from 'react-tooltip';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import Spinner from '@/components/spinner/spinner';

const OauthClients = () => {
    const query = useQuery();
    const limit = Number(query.get('limit') || 20);
    const page = Number(query.get('page') || 1);

    const { oauthClients, rowNum } = useAppSelector(selectOauthClients);
    const dispatch = useAppDispatch();

    const [selectedIds, setSelectedIds] = useState(Array<number>());
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState(0);
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const hasOauthClientsRef = useRef(false);
    const howToUseLink = `${import.meta.env.VITE_WEBSITE_URL}/how/`;

    const [
        pageTitleSecondaryButtonClassName,
        setPageTitlePrimaryButtonClassName,
    ] = useState('btn btn-danger disabled');

    const { isLoading, fetchApi } = useGetOauthClients({
        page,
        limit,
    });

    const { fetchApi: deleteMultipleApi, data: responseOfDelete } =
        useDeleteOauthClients(selectedIds);

    const {
        isLoading: isDeletingOne,
        fetchApi: deleteApi,
        data: responseOfDeleteOne,
    } = useDeleteOauthClients([shouldBeDeleteId]);

    const navigate = useNavigate();

    useEffect(() => {
        if (oauthClients && oauthClients.length > 0) {
            hasOauthClientsRef.current = true;
        }
    }, [oauthClients]);

    useEffect(() => {
        fetchApi();
    }, [page, refreshFlag]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setRefreshFlag(!refreshFlag);
            setSelectedIds([]);

            dispatch(
                toasterActions.pushOne({
                    message: 'oAuthClient 已經成功刪除',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
    }, [responseOfDelete]);

    useEffect(() => {
        if (responseOfDeleteOne?.status === RESPONSE_STATUS.OK) {
            setRefreshFlag(!refreshFlag);
            setShouldBeDeleteId(0);

            dispatch(
                toasterActions.pushOne({
                    message: 'oAuthClient 已經成功刪除',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
    }, [responseOfDeleteOne]);

    useEffect(() => {
        if (shouldBeDeleteId) {
            deleteApi();
        }
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (selectedIds.length === oauthClients?.length) {
            setIsSelectAll(true);
        } else {
            setIsSelectAll(false);
        }
    }, [selectedIds, oauthClients]);

    const check = (id: number) => {
        setSelectedIds((previous) => {
            const newSelectedIds = [...previous];
            const targetIndex = newSelectedIds.indexOf(id);
            if (targetIndex !== -1) {
                newSelectedIds.splice(targetIndex, 1);
            } else {
                newSelectedIds.push(id);
            }
            let pageTitleSecondaryButtonClassName = 'btn btn-danger';
            if (newSelectedIds.length === 0) {
                pageTitleSecondaryButtonClassName += ' disabled';
            }
            setPageTitlePrimaryButtonClassName(
                pageTitleSecondaryButtonClassName
            );
            return newSelectedIds;
        });
    };

    const jumpToCreatePage = () => {
        navigate('create');
    };

    const checkAllOrNot = () => {
        if (selectedIds.length === oauthClients?.length) {
            setSelectedIds([]);
            setPageTitlePrimaryButtonClassName('btn btn-danger disabled');
        } else {
            setSelectedIds((oauthClients || []).map((item) => item.id));
            setPageTitlePrimaryButtonClassName('btn btn-danger');
        }
    };

    const deleteOne = (id: number) => {
        dispatch(
            dialogActions.open({
                title: '確認刪除 oAuthClient ?',
                message: '刪除後將無法復原, 請輸入 DELETE 完成刪除',
                type: DialogTypeEnum.PROMPT,
                checkedMessage: 'DELETE',
                callback: () => {
                    setShouldBeDeleteId(() => {
                        return id;
                    });
                },
                promptInvalidMessage: '輸入錯誤',
            })
        );
    };

    const deleteMultiple = () => {
        dispatch(
            dialogActions.open({
                title: '確認刪除 oAuthClient ?',
                message: '刪除後將無法復原, 請輸入 DELETE 完成刪除',
                type: DialogTypeEnum.PROMPT,
                checkedMessage: 'DELETE',
                callback: () => {
                    deleteMultipleApi();
                },
                promptInvalidMessage: '輸入錯誤',
            })
        );
    };

    return (
        <div className="oauth-clients" data-testid="oauth-clients">
            <PageTitle
                title="oAuthClient 列表"
                primaryButtonVisible
                primaryButtonWording="新增 oAuthClient"
                primaryButtonCallback={jumpToCreatePage}
                secondaryButtonIcon={lightTrashIcon}
                secondaryButtonClassName={pageTitleSecondaryButtonClassName}
                secondaryButtonVisible
                secondaryButtonWording="刪除選取"
                secondaryButtonCallback={deleteMultiple}
            />
            <div className="card">
                {isLoading || oauthClients === null ? (
                    <div className="w-100 d-flex justify-content-center my-4">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div
                            className={`${
                                hasOauthClientsRef.current
                                    ? 'd-none'
                                    : 'd-block'
                            } p-6 text-center`}
                        >
                            <img src={emptyImage} alt="" />
                            <div className="mt-2">
                                尚未建立任何 oAuthClient，點擊按鈕開始新增吧！
                            </div>
                            <button
                                onClick={jumpToCreatePage}
                                className="btn btn-primary mx-auto mt-3 "
                            >
                                <img className="icon pe-2" src={plusIcon} />
                                <div className="">新增 oAuthClient</div>
                            </button>
                            <a
                                href={howToUseLink}
                                target="_blank"
                                className="text-end fs-5"
                                rel="noreferrer"
                            >
                                如何使用?
                            </a>
                        </div>
                        <div
                            className={`${
                                hasOauthClientsRef.current
                                    ? 'd-block'
                                    : 'd-none'
                            }`}
                        >
                            <div className="text-end">
                                <a
                                    href={howToUseLink}
                                    target="_blank"
                                    className="fs-5"
                                    rel="noreferrer"
                                >
                                    如何使用?
                                </a>
                            </div>
                            <div className="row bg-black bg-opacity-5 text-black text-opacity-45 fs-5 py-25 mb-0 d-none d-lg-flex">
                                <label role="button" className="col-8">
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="checkbox"
                                            className="me-3"
                                            onChange={checkAllOrNot}
                                            checked={isSelectAll}
                                        />
                                        oAuthClient Id
                                    </div>
                                </label>
                                <div className="col-4">操作</div>
                            </div>

                            {oauthClients.map(({ id, clientId }) => (
                                <div
                                    key={id}
                                    className="row py-0 py-lg-4 border-1 border-bottom text-black text-opacity-65 list"
                                    onClick={() => {
                                        check(id);
                                    }}
                                >
                                    <div className="d-flex d-lg-none col-4 bg-black bg-opacity-5 p-3 align-items-center text-wrap text-break">
                                        oAuthClient ID
                                    </div>
                                    <div className="col-8 d-flex align-items-center text-wrap text-break">
                                        <input
                                            type="checkbox"
                                            value={id}
                                            className="me-3"
                                            checked={selectedIds.includes(id)}
                                        />
                                        {clientId}
                                    </div>
                                    <div className="d-flex d-lg-none col-4 bg-black bg-opacity-5 p-3 align-items-center">
                                        操作
                                    </div>
                                    <div className="col-8 col-lg-4 d-flex align-items-center">
                                        <Link
                                            to={`/dashboard/oauth-clients/${id}`}
                                            className="me-4"
                                            data-tip="編輯"
                                        >
                                            <img src={pencilIcon} />
                                        </Link>
                                        <button
                                            onClick={() => {
                                                deleteOne(id);
                                            }}
                                            disabled={isDeletingOne}
                                            className="btn bg-transparent p-0 shadow-none"
                                            data-tip="刪除"
                                        >
                                            <img src={trashIcon} />
                                        </button>
                                        <ReactTooltip effect="solid" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-end w-100 mt-5">
                            <Pagination
                                rowNum={rowNum}
                                page={page}
                                limit={limit}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default OauthClients;
