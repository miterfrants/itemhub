import './pipeline-execute-log-dialog.scss';
import { useGetPaginationPipelineExecuteLogsApi } from '@/hooks/apis/pipeline-execute-logs.hook';
import { useGetPipelineItemTypes } from '@/hooks/apis/universal.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import {
    pipelineExecuteLogDialogActions,
    selectPipelineExecuteLogDialog,
} from '@/redux/reducers/pipeline-execute-log-dialog.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import moment from 'moment';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

const PipelineExecuteLogDialog = () => {
    const dialog = useAppSelector(selectPipelineExecuteLogDialog);
    const dispatch = useDispatch();
    const { pipelineId, isOpen } = dialog;
    const page = useRef(1);
    const { fetchApi: getPaginationLogs, data: paginationLogs } =
        useGetPaginationPipelineExecuteLogsApi({
            pipelineId: pipelineId || 0,
            page: page.current,
            limit: 20,
        });

    const { fetchApi: getPipelineItemTypes } = useGetPipelineItemTypes();

    const { pipelineItemTypes } = useAppSelector(selectUniversal);

    useEffect(() => {
        getPaginationLogs();

        // eslint-disable-next-line
    }, [pipelineId]);

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
            <div className="container-fluid text-black bg-white card">
                {paginationLogs?.pipelineExecuteLogs.map((log) => {
                    const itemType = pipelineItemTypes?.find(
                        (item) => item.value === log?.item.itemType
                    );
                    return (
                        <div key={log.id} className="row">
                            <div className="col-5">
                                {moment(log.createdAt).format(
                                    'yyyy-MM-dd hh:mm:ss'
                                )}
                            </div>
                            <div className="col-3">{itemType?.label}</div>
                            <div className="col-4">{log?.message}</div>
                        </div>
                    );
                })}
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
