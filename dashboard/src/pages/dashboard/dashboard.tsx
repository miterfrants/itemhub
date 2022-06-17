import PageTitle from '@/components/page-title/page-title';
import { useEffect } from 'react';
import { useGetDashboardMonitorsApi } from '../../hooks/apis/dashboard-monitor.hook';
import { useSelector } from 'react-redux';
import { selectDashboardMonitors } from '@/redux/reducers/dashboard-monitor.reducer';
import { DashboardMonitorItem } from '@/types/dashboard-monitors.type';
import CurrentValueMonitor from '@/components/dashboard-monitor/current-value-monitor/current-value-monitor';
import LineChartMonitor from '@/components/dashboard-monitor/line-chart-monitor/line-chart-monitor';
import SwitchMonitor from '@/components/dashboard-monitor/switch-monitor/switch-monitor';

const Dashboard = () => {
    const { fetchApi: getDashboardMonitors } = useGetDashboardMonitorsApi();
    const dashboardMonitors = useSelector(selectDashboardMonitors);

    useEffect(() => {
        if (dashboardMonitors.length > 0) {
            return;
        }
        getDashboardMonitors();
    }, []);

    return (
        <div className="dashboard" data-testid="Dashboard">
            <PageTitle title="監控中心" />
            <div className="card">
                <div className="row">
                    {dashboardMonitors.map((item: DashboardMonitorItem) => (
                        <div
                            key={item.id}
                            className={`mb-4 col-${item.column * 4}`}
                        >
                            <div
                                className={`monitor-item d-flex align-items-center justify-content-center p-4 ${
                                    item.row === 1 ? 'half' : ''
                                }`}
                            >
                                <div className="border border-grey-200 rounded-3 w-100 h-100 d-flex justify-content-center align-items-center">
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
