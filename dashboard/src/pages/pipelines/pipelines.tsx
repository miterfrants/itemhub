import { Link } from 'react-router-dom';
import PageTitle from '@/components/page-title/page-title';
import pencilIcon from '@/assets/images/pencil.svg';
import trashIcon from '@/assets/images/trash.svg';
import Pagination from '@/components/pagination/pagination';
import ReactTooltip from 'react-tooltip';
import Spinner from '@/components/spinner/spinner';
import {
    useDeletePipelinesApi,
    useGetPipelinesApi,
} from '@/hooks/apis/pipelines.hook';
import { useQuery } from '@/hooks/query.hook';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/hooks/redux.hook';
import {
    PipelineState,
    selectPipelines,
} from '@/redux/reducers/pipelines.reducer';
import EmptyDataToCreateItem from '@/components/empty-data-to-create-item/empty-data-to-create-item';
import { RESPONSE_STATUS } from '@/constants/api';
import { useDispatch } from 'react-redux';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';
import { PipelineType } from '@/types/pipeline.type';

const Pipelines = () => {
    const query = useQuery();
    const dispatch = useDispatch();
    const limit = Number(query.get('limit') || 10);
    const [page, setPage] = useState(Number(query.get('page')) || 1);
    const [searchTitle, setSearchTitle] = useState(query.get('title') || '');
    const [refreshFlag, setRefreshFlag] = useState(false);
    const state: PipelineState = useAppSelector(selectPipelines);
    const [pipelines, setPipelines] = useState(state.pipelines || []);
    const [rowNum, setRowNum] = useState(state.rowNum || 0);
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState(0);
    const { isLoading: isGetting, fetchApi: getPipelines } = useGetPipelinesApi(
        {
            page,
            limit,
            title: searchTitle,
        }
    );

    const { data: responseOfDelete } = useDeletePipelinesApi([
        shouldBeDeleteId,
    ]);

    useEffect(() => {
        document.title = 'ItemHub - Pipeline 列表';
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getPipelines();
        // eslint-disable-next-line
    }, [query, page, refreshFlag]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setRefreshFlag(!refreshFlag);
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    useEffect(() => {
        setPipelines(state.pipelines || []);
        setRowNum(state.rowNum || 0);
    }, [state]);

    const deleteOne = (id: number | undefined) => {
        if (!id) {
            return;
        }
        const shouldBeDelete = (state.pipelines || []).find(
            (item: PipelineType) => item.id === id
        );
        if (!shouldBeDelete) {
            return;
        }
        dispatch(
            dialogActions.open({
                message: `刪除後將無法復原, 請輸入 DELETE 完成刪除 ${shouldBeDelete.title}`,
                title: '確認刪除 Pipeline ?',
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
        <div className="devices">
            <PageTitle
                title="Pipeline 列表"
                primaryButtonWording="新增 Pipeline"
                secondaryButtonWording="重新整理"
            />
            <div className="card">
                {!isGetting && !pipelines ? (
                    <EmptyDataToCreateItem itemName="Pipeline" />
                ) : (
                    <>
                        {isGetting || pipelines === null ? (
                            <div className="w-100 d-flex justify-content-center my-4">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="mt-3 mt-lg-45">
                                <div className="row bg-black bg-opacity-5 text-black text-opacity-45 fs-5 py-25 px-3 m-0 d-none d-lg-flex">
                                    <div className="col-10">名稱</div>
                                    <div className="col-2">操作</div>
                                </div>
                                <div className="pipeline-list">
                                    {pipelines.map(({ id, title }) => {
                                        return (
                                            <div
                                                className="row list border-bottom border-black border-opacity-10 p-0 py-lg-4 px-lg-3 mx-0"
                                                key={id}
                                            >
                                                <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                    名稱
                                                </div>
                                                <div className="col-10 col-lg-10 p-3 p-lg-0">
                                                    <div className="fw-bold lh-base mb-2 mb-lg-0">
                                                        {title}
                                                    </div>
                                                </div>
                                                <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                    操作
                                                </div>
                                                <div className="col-10 col-lg-2 p-3 p-lg-25 d-flex flex-wrap">
                                                    <Link
                                                        className="me-4 mb-3"
                                                        to={`/dashboard/pipelines/${id}?title=${searchTitle}`}
                                                        data-tip="編輯"
                                                    >
                                                        <img
                                                            className="icon"
                                                            src={pencilIcon}
                                                        />
                                                    </Link>
                                                    <div
                                                        className="me-4 mb-3"
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
                                        pipelines.length > 0
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
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Pipelines;
