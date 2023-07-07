import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '@/components/page-title/page-title';
import pencilIcon from '@/assets/images/pencil.svg';
import trashIcon from '@/assets/images/trash.svg';
import Pagination from '@/components/pagination/pagination';
import ReactTooltip from 'react-tooltip';
import Spinner from '@/components/spinner/spinner';
import { useQuery } from '@/hooks/query.hook';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux.hook';
import EmptyDataToCreateItem from '@/components/empty-data-to-create-item/empty-data-to-create-item';
import { useDispatch } from 'react-redux';
import { GroupState, selectGroups } from '@/redux/reducers/groups.reducer';
import { useDeleteGroupsApi, useGetGroupsApi } from '@/hooks/apis/groups.hook';
import { GroupType } from '@/types/group.type';
import { DialogTypeEnum, dialogActions } from '@/redux/reducers/dialog.reducer';
import { RESPONSE_STATUS } from '@/constants/api';
import {
    ToasterTypeEnum,
    toasterActions,
} from '@/redux/reducers/toaster.reducer';

const Groups = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const limit = Number(query.get('limit') || 10);
    const page = Number(query.get('page') || 1);
    const [searchName] = useState(query.get('name') || '');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const [isGetted, setIsGetted] = useState(false);
    const state: GroupState = useAppSelector(selectGroups);
    const [groups, setGroups] = useState<GroupType[]>([]);
    const [rowNum, setRowNum] = useState(0);
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState(0);

    const { data: responseOfDelete, fetchApi: deleteGroup } =
        useDeleteGroupsApi([shouldBeDeleteId]);

    const { isLoading: isGetting, fetchApi: getGroups } = useGetGroupsApi({
        limit: Number(query.get('limit') || 10),
        page: Number(query.get('page') || 1),
        name: searchName,
    });

    useEffect(() => {
        document.title = 'ItemHub - 群組列表';
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getGroups();
        // eslint-disable-next-line
    }, [query, refreshFlag]);

    useEffect(() => {
        if (state.groups === undefined) {
            return;
        }
        setGroups(state.groups);
        setRowNum(state.rowNum);
        setIsGetted(true);
    }, [state]);

    useEffect(() => {
        if (!shouldBeDeleteId) {
            return;
        }
        deleteGroup();
        // eslint-disable-next-line
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setRefreshFlag(!refreshFlag);
            dispatch(
                toasterActions.pushOne({
                    message: '刪除成功',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    const deleteOne = (id: number) => {
        if (!id) {
            return;
        }
        const shouldBeDelete = (state.groups || []).find(
            (item: GroupType) => item.id === id
        );
        if (!shouldBeDelete) {
            return;
        }
        dispatch(
            dialogActions.open({
                message: `刪除後將無法復原, 請輸入 DELETE 完成刪除 ${shouldBeDelete.name}`,
                title: '確認刪除群組 ?',
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

    return (
        <div className="groups">
            <PageTitle
                title="群組列表"
                primaryButtonWording="新增群組"
                secondaryButtonWording="重新整理"
                primaryButtonVisible
                primaryButtonCallback={() => {
                    navigate('create');
                }}
            />
            <div className="card">
                {isGetted && (state.groups || []).length == 0 ? (
                    <EmptyDataToCreateItem itemName="Groups" />
                ) : (
                    <>
                        {!isGetted && isGetting ? (
                            <div className="w-100 d-flex justify-content-center my-4">
                                <Spinner />
                            </div>
                        ) : (
                            isGetted &&
                            (state.groups || []).length > 0 && (
                                <div className="mt-3 mt-lg-45">
                                    <div className="row bg-black bg-opacity-5 text-black text-opacity-45 fs-5 py-25 px-3 m-0 d-none d-lg-flex">
                                        <div className="col-10">名稱</div>
                                        <div className="col-2">操作</div>
                                    </div>
                                    <div>
                                        {groups.map(({ id, name }) => {
                                            return (
                                                <div
                                                    className="row list border-bottom border-black border-opacity-10 p-0 py-lg-4 px-lg-3 mx-0 align-items-center"
                                                    key={id}
                                                >
                                                    <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3 text-nowrap">
                                                        名稱
                                                    </div>
                                                    <div className="col-10 col-lg-10 p-3 p-lg-0">
                                                        <div className="fw-bold lh-base mb-lg-0">
                                                            {name}
                                                        </div>
                                                    </div>
                                                    <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3 text-nowrap">
                                                        操作
                                                    </div>
                                                    <div className="col-10 col-lg-2 p-lg-25 d-flex flex-wrap align-items-center">
                                                        <Link
                                                            className="p-2 me-3"
                                                            to={`/dashboard/groups/${id}?name=${searchName}`}
                                                            data-tip="編輯"
                                                        >
                                                            <img
                                                                className="icon"
                                                                src={pencilIcon}
                                                            />
                                                        </Link>
                                                        <div
                                                            className="p-2"
                                                            role="button"
                                                            onClick={() => {
                                                                deleteOne(id);
                                                            }}
                                                            data-tip="刪除"
                                                        >
                                                            <img
                                                                className="icon"
                                                                src={trashIcon}
                                                            />
                                                        </div>
                                                        <ReactTooltip effect="solid" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div
                                        className={`${
                                            groups.length > 0
                                                ? 'd-flex'
                                                : 'd-none'
                                        } justify-content-end w-100 mt-5`}
                                    >
                                        <Pagination
                                            rowNum={rowNum}
                                            page={page}
                                            limit={limit}
                                        />
                                    </div>
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Groups;
