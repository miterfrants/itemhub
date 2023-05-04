import PageTitle from '@/components/page-title/page-title';
import { useEffect, useState } from 'react';
import {
    useDeleteDashboardMonitorsApi,
    useGetDashboardMonitorsApi,
    useUpdateDashboardMonitorSortingApi,
} from '../../hooks/apis/dashboard-monitor.hook';
import { useSelector, useDispatch } from 'react-redux';
import {
    dashboardMonitorsActions,
    selectDashboardMonitors,
} from '@/redux/reducers/dashboard-monitor.reducer';
import { DashboardMonitorItem } from '@/types/dashboard-monitors.type';
import CurrentValueMonitor from '@/components/dashboard-monitor/current-value-monitor/current-value-monitor';
import LineChartMonitor from '@/components/dashboard-monitor/line-chart-monitor/line-chart-monitor';
import SwitchMonitor from '@/components/dashboard-monitor/switch-monitor/switch-monitor';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';
import { ReactSortable } from 'react-sortablejs';

const Dashboard = () => {
    const { fetchApi: getDashboardMonitors } = useGetDashboardMonitorsApi();
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState<number | null>(
        null
    );
    const { fetchApi: deleteDashboardMonitors, data: responseOfDelete } =
        useDeleteDashboardMonitorsApi([shouldBeDeleteId || 0]);

    const dashboardMonitors = useSelector(selectDashboardMonitors);
    const [monitors, setMonitors] = useState<any[]>([]);
    const { fetchApi: updateDashboardMonitorSorting } =
        useUpdateDashboardMonitorSortingApi(
            monitors.map((item, index) => ({ id: item.id, sort: index + 1 }))
        );
    const dispatch = useDispatch();

    useEffect(() => {
        document.title = 'ItemHub - 監控中心';
        if (dashboardMonitors.length > 0) {
            return;
        }
        getDashboardMonitors();
    }, []);

    useEffect(() => {
        const sortingDashboard = [...dashboardMonitors].sort((prev, next) => {
            if (prev.sort > next.sort) {
                return 1;
            } else {
                return -1;
            }
        });

        setMonitors(
            sortingDashboard.map((item) => ({ ...item, chosen: true }))
        );
    }, [dashboardMonitors]);

    useEffect(() => {
        const originSorting = dashboardMonitors.map((item) => item.id);
        const sorting = monitors.map((item) => item.id);
        if (JSON.stringify(originSorting) === JSON.stringify(sorting)) {
            return;
        }
        updateDashboardMonitorSorting();
    }, [monitors]);

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
                <div>
                    <ReactSortable
                        className="row"
                        list={monitors}
                        setList={setMonitors}
                    >
                        {monitors.map((item: DashboardMonitorItem) => (
                            <div
                                key={item.id}
                                className={`mb-4 col-12 col-sm-${
                                    item.column * 4
                                } position-relative`}
                            >
                                <div
                                    className={`monitor-item d-flex align-items-center justify-content-center ${
                                        item.mode === 1 ? 'line-chart' : ''
                                    }`}
                                >
                                    <div
                                        className={`border border-grey-200 rounded-3 w-100 h-100 d-flex justify-content-center align-items-center overflow-hidden ${
                                            item.mode !== 1 && 'bg-grey-100'
                                        }`}
                                    >
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
                    </ReactSortable>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
