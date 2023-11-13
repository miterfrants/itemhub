import { useGetPaginationLogsApi } from '@/hooks/apis/logs.hook';
import { LogType } from '@/types/log.type';
import moment from 'moment';
import { useEffect, useState } from 'react';

const LastPipelineLog = (props: { pipelineId: number }) => {
    const { pipelineId } = props;
    const [log, setLog] = useState<LogType | undefined>();
    const { fetchApi: getLastLog, data: paginationLogs } =
        useGetPaginationLogsApi({
            pipelineId,
            page: 1,
            limit: 1,
        });

    useEffect(() => {
        getLastLog();
    }, []);

    useEffect(() => {
        if (paginationLogs?.logs && paginationLogs?.logs.length > 0) {
            setLog(paginationLogs?.logs[0]);
        }
    }, [paginationLogs]);
    return (
        <span>
            {!log
                ? '無執行記錄'
                : `${moment(log.createdAt).format('yyyy-MM-DD HH:mm:ss')} ${
                      log.message ? log.message : '沒有訊息'
                  }`}
        </span>
    );
};

export default LastPipelineLog;
