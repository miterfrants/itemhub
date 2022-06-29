import PageTitle from '@/components/page-title/page-title';
import { useEffect, useState } from 'react';
import {
    useDeleteDashboardMonitorsApi,
    useGetDashboardMonitorsApi,
} from '../../hooks/apis/dashboard-monitor.hook';
import { useSelector, useDispatch } from 'react-redux';
import { selectDashboardMonitors } from '@/redux/reducers/dashboard-monitor.reducer';
import { DashboardMonitorItem } from '@/types/dashboard-monitors.type';
import CurrentValueMonitor from '@/components/dashboard-monitor/current-value-monitor/current-value-monitor';
import LineChartMonitor from '@/components/dashboard-monitor/line-chart-monitor/line-chart-monitor';
import SwitchMonitor from '@/components/dashboard-monitor/switch-monitor/switch-monitor';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';

const Dashboard = () => {
    const { fetchApi: getDashboardMonitors } = useGetDashboardMonitorsApi();
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState<number | null>(
        null
    );
    const { fetchApi: deleteDashboardMonitors, data: responseOfDelete } =
        useDeleteDashboardMonitorsApi([shouldBeDeleteId || 0]);

    const dashboardMonitors = useSelector(selectDashboardMonitors);
    const dispatch = useDispatch();

    useEffect(() => {
        document.title = 'ItemHub - 監控中心';
        if (dashboardMonitors.length > 0) {
            return;
        }
        getDashboardMonitors();
    }, []);

    useEffect(() => {
        if (shouldBeDeleteId) {
            dispatch(
                dialogActions.open({
                    message: '請輸入 DELETE 完成刪除',
                    title: '確認刪除 ?',
                    type: DialogTypeEnum.PROMPT,
                    checkedMessage: 'DELETE',
                    callback: deleteDashboardMonitors,
                    promptInvalidMessage: '輸入錯誤',
                })
            );
        }
        // eslint-disable-next-line
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (responseOfDelete?.status === 'OK') {
            dispatch(
                toasterActions.pushOne({
                    message: '成功刪除監控面板',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    return (
        <div className="dashboard" data-testid="Dashboard">
            <PageTitle title="監控中心" />
            <div className="card">
                <div className="row">
                    {dashboardMonitors.map((item: DashboardMonitorItem) => (
                        <div
                            key={item.id}
                            className={`mb-4 col-12 col-sm-${
                                item.column * 4
                            } position-relative`}
                        >
                            <div
                                className={`monitor-item d-flex align-items-center justify-content-center p-4 ${
                                    item.row === 1 && item.column === 3
                                        ? 'one-third'
                                        : (item.row === 1 &&
                                              item.column === 2) ||
                                          (item.row === 2 && item.column === 3)
                                        ? 'half'
                                        : ''
                                }`}
                            >
                                <div className="border border-grey-200 bg-grey-100 rounded-3 w-100 h-100 d-flex justify-content-center align-items-center overflow-hidden">
                                    {item.mode === 0 ? (
                                        <CurrentValueMonitor
                                            deviceId={item.deviceId}
                                            pin={item.pin}
                                        />
                                    ) : item.mode === 1 ? (
                                        <LineChartMonitor
                                            deviceId={item.deviceId}
                                            pin={item.pin}
                                        />
                                    ) : (
                                        <SwitchMonitor
                                            deviceId={item.deviceId}
                                            pin={item.pin}
                                        />
                                    )}
                                </div>
                            </div>

                            <div
                                role="button"
                                className="btn-close position-absolute top-0 end-0 me-4 mt-3 d-none d-sm-block"
                                onClick={() => {
                                    setShouldBeDeleteId(item.id);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
