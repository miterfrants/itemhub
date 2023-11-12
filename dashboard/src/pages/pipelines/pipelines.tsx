import './pipelines.scss';
import { Link, useNavigate } from 'react-router-dom';
import PageTitle from '@/components/page-title/page-title';
import pencilIcon from '@/assets/images/pencil.svg';
import playIcon from '@/assets/images/play.svg';
import pauseIcon from '@/assets/images/pause.svg';
import trashIcon from '@/assets/images/trash.svg';
import Pagination from '@/components/pagination/pagination';
import ReactTooltip from 'react-tooltip';
import Spinner from '@/components/spinner/spinner';
import {
    useDeletePipelinesApi,
    useGetPipelinesApi,
    useRunOrStopPipelineApi,
} from '@/hooks/apis/pipelines.hook';
import { useQuery } from '@/hooks/query.hook';
import { useEffect, useRef, useState } from 'react';
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
import { useGetPipelineItemTypes } from '@/hooks/apis/universal.hook';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import historyIcon from '@/assets/images/history.png';
import { pipelineExecuteLogDialogActions } from '@/redux/reducers/pipeline-execute-log-dialog.reducer';
import LastPipelineLog from '@/components/logs/last-pipeline-log';

const Pipelines = () => {
    const query = useQuery();
    const dispatch = useDispatch();
    const limit = Number(query.get('limit') || 60);
    const page = Number(query.get('page') || 1);
    const searchTitle = query.get('title') || '';
    const navigate = useNavigate();
    const [refreshFlag, setRefreshFlag] = useState(false);
    const state: PipelineState = useAppSelector(selectPipelines);
    const [pipelines, setPipelines] = useState(state.pipelines || []);
    const [rowNum, setRowNum] = useState(state.rowNum || 0);
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState(0);
    const pipelineIds = useRef<number[]>([]);
    const [shouldBeTogglePipeline, setShouldBeTogglePipeline] = useState<
        PipelineType | undefined
    >(undefined);
    const { isLoading: isGetting, fetchApi: getPipelines } = useGetPipelinesApi(
        {
            limit,
            page,
            title: searchTitle,
        }
    );

    const { fetchApi: getPipelineItemTypes } = useGetPipelineItemTypes();

    const { pipelineItemTypes } = useAppSelector(selectUniversal);

    const { data: responseOfDelete, fetchApi: deletePipeline } =
        useDeletePipelinesApi([shouldBeDeleteId]);

    // toggle pipeline
    const {
        fetchApi: togglePipeline,
        error: errorOfToggle,
        data: respOfToggle,
    } = useRunOrStopPipelineApi({
        isRun: shouldBeTogglePipeline ? !shouldBeTogglePipeline.isRun : false,
        id: shouldBeTogglePipeline ? shouldBeTogglePipeline.id : 0,
    });

    useEffect(() => {
        document.title = 'ItemHub - 自動化觸發流程列表';
        if (!pipelineItemTypes || pipelineItemTypes.length === 0) {
            getPipelineItemTypes();
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getPipelines();
        // eslint-disable-next-line
    }, [query, refreshFlag]);

    useEffect(() => {
        if (!respOfToggle) {
            return;
        }
        setShouldBeTogglePipeline(undefined);
    }, [respOfToggle]);

    useEffect(() => {
        if (!errorOfToggle) {
            return;
        }
        setShouldBeTogglePipeline(undefined);
    }, [errorOfToggle]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setRefreshFlag(!refreshFlag);
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    useEffect(() => {
        setPipelines(state.pipelines || []);
        pipelineIds.current = state?.pipelines
            ? state?.pipelines.map((item) => item.id)
            : [];
        setRowNum(state.rowNum || 0);
    }, [state]);

    useEffect(() => {
        if (!shouldBeDeleteId) {
            return;
        }
        deletePipeline();
        // eslint-disable-next-line
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (!shouldBeTogglePipeline) {
            return;
        }
        togglePipeline();
        // eslint-disable-next-line
    }, [shouldBeTogglePipeline]);

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
        <div className="pipelines">
            <PageTitle
                title="自動化觸發流程列表"
                primaryButtonWording="新增 自動化觸發流程"
                secondaryButtonWording="重新整理"
                primaryButtonVisible
                primaryButtonCallback={() => {
                    navigate('create');
                }}
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
                                    <div className="col-3">名稱</div>
                                    <div className="col-5">執行紀錄</div>
                                    <div className="col-2">狀態</div>
                                    <div className="col-2">操作</div>
                                </div>
                                <div className="pipeline-list">
                                    {pipelines.map(({ id, title, isRun }) => {
                                        return (
                                            <div
                                                className="row list border-bottom border-black border-opacity-10 p-0 py-lg-4 px-lg-3 mx-0 align-items-center"
                                                key={id}
                                            >
                                                <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                    名稱
                                                </div>
                                                <div className="col-10 col-lg-3 p-3 p-lg-0">
                                                    <div className="fw-bold lh-base mb-2 mb-lg-0">
                                                        {id} {title}
                                                    </div>
                                                </div>
                                                <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                    執行紀錄
                                                </div>
                                                <div className="col-10 col-lg-5 p-3 p-lg-0">
                                                    <img
                                                        src={historyIcon}
                                                        role="button"
                                                        onClick={() => {
                                                            dispatch(
                                                                pipelineExecuteLogDialogActions.open(
                                                                    {
                                                                        pipelineId:
                                                                            id,
                                                                    }
                                                                )
                                                            );
                                                        }}
                                                        className="me-2 opacity-75 btn-history"
                                                    />
                                                    <LastPipelineLog
                                                        pipelineId={id}
                                                    />
                                                </div>
                                                <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                    狀態
                                                </div>
                                                <div className="col-10 col-lg-2 p-3 p-lg-0">
                                                    {isRun ? '執行中' : '暫停'}
                                                </div>

                                                <div className="col-2 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                    操作
                                                </div>
                                                <div className="col-10 col-lg-2 p-3 p-lg-25 d-flex flex-wrap">
                                                    <div
                                                        className="me-4"
                                                        role="button"
                                                        data-tip={
                                                            isRun
                                                                ? '暫停'
                                                                : '執行'
                                                        }
                                                        onClick={() => {
                                                            setShouldBeTogglePipeline(
                                                                pipelines.find(
                                                                    (item) =>
                                                                        item.id ===
                                                                        id
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        <img
                                                            className="icon"
                                                            src={
                                                                isRun
                                                                    ? pauseIcon
                                                                    : playIcon
                                                            }
                                                        />
                                                    </div>
                                                    <Link
                                                        className="me-4"
                                                        to={`/dashboard/pipelines/${id}?title=${searchTitle}`}
                                                        data-tip="編輯"
                                                    >
                                                        <img
                                                            className="icon"
                                                            src={pencilIcon}
                                                        />
                                                    </Link>
                                                    <div
                                                        className="me-4"
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
