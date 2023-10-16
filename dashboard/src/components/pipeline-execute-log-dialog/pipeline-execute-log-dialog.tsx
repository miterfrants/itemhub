import './pipeline-execute-log-dialog.scss';
import { useGetPaginationPipelineExecuteLogsApi } from '@/hooks/apis/pipeline-execute-logs.hook';
import { useGetPipelineItemTypes } from '@/hooks/apis/universal.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import {
    pipelineExecuteLogDialogActions,
    selectPipelineExecuteLogDialog,
} from '@/redux/reducers/pipeline-execute-log-dialog.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { PipelineExecuteLogType } from '@/types/pipeline-execute-log.type';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const PipelineExecuteLogDialog = () => {
    const dialog = useAppSelector(selectPipelineExecuteLogDialog);
    const dispatch = useDispatch();
    const { pipelineId, isOpen } = dialog;
    const [page, setPage] = useState(1);
    const [logs, setLogs] = useState<PipelineExecuteLogType[]>([]);
    const [isEnd, setIsEnd] = useState(false);
    const { fetchApi: getPaginationLogs, data: paginationLogs } =
        useGetPaginationPipelineExecuteLogsApi({
            pipelineId: pipelineId || 0,
            page: page,
            limit: 50,
        });

    const { fetchApi: getPipelineItemTypes } = useGetPipelineItemTypes();

    const { pipelineItemTypes } = useAppSelector(selectUniversal);

    const debounceCheckBottom = debounce((element) => {
        const isBottom =
            Math.round(element.scrollHeight - element.scrollTop) ===
            Math.round(element.clientHeight);
        if (isBottom) setPage(page + 1);
    }, 300);

    useEffect(() => {
        if (page === 0 || !pipelineId || pipelineId === 0 || isEnd) {
            return;
        }
        getPaginationLogs();

        // eslint-disable-next-line
    }, [page, pipelineId]);

    useEffect(() => {
        if (JSON.stringify(paginationLogs?.pipelineExecuteLogs) === '[]') {
            setIsEnd(true);
            return;
        }
        if (!isOpen) {
            setLogs([]);
            setIsEnd(false);
            return;
        }
        const filteredLogs = logs.filter(
            (log) =>
                !paginationLogs?.pipelineExecuteLogs
                    .map((item) => item.id)
                    .includes(log.id)
        );
        setLogs([
            ...filteredLogs,
            ...(paginationLogs?.pipelineExecuteLogs || []),
        ]);
        // eslint-disable-next-line
    }, [paginationLogs, isOpen]);

    useEffect(() => {
        if (!pipelineItemTypes || pipelineItemTypes.length === 0) {
            getPipelineItemTypes();
        }
        // eslint-disable-next-line
    }, []);

    return (
        <div
            className={`pipeline-execute-log-dialog dialog position-fixed top-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 ${
                isOpen ? '' : 'd-none'
            }`}
        >
            <div className="text-black bg-white card my-3 position-relative">
                <div
                    className="container-fluid overflow-y-scroll"
                    onScroll={(e) => {
                        const element = e.currentTarget;
                        debounceCheckBottom(element);
                    }}
                >
                    {logs.map((log) => {
                        const itemType = pipelineItemTypes?.find(
                            (item) => item.value === log?.item.itemType
                        );
                        return (
                            <div key={log.id} className="row">
                                <div className="col-5">
                                    {moment(log.createdAt).format(
                                        'yyyy-MM-DD hh:mm:ss'
                                    )}
                                </div>
                                <div className="col-3">{itemType?.label}</div>
                                <div className="col-4">{log?.message}</div>
                            </div>
                        );
                    })}
                </div>
                <div
                    onClick={() => {
                        dispatch(pipelineExecuteLogDialogActions.close());
                    }}
                    className="position-absolute top-0 btn-close end-0 me-3 mt-2"
                    role="button"
                />
            </div>
        </div>
    );
};

export default PipelineExecuteLogDialog;
