import PageTitle from '@/components/page-title/page-title';
import { useEffect, useRef, useState } from 'react';
import Flippy, { FrontSide, BackSide } from 'react-flippy';
import { useSelector, useDispatch } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';

import {
    useDeleteDashboardMonitorsApi,
    useGetDashboardMonitorsApi,
    useUpdateDashboardMonitorSortingApi,
} from '@/hooks/apis/dashboard-monitor.hook';

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
import { monitorConfigDialogActions } from '@/redux/reducers/monitor-config-dialog.reducer';
import gearIcon from '@/assets/images/gear.svg';
import Toggle from '@/components/toggle/toggle';
import trashIcon from '@/assets/images/trash.svg';
import displayIcon from '@/assets/images/display.svg';
import { useLocation, useParams } from 'react-router-dom';

const Dashboard = () => {
    const { groupId } = useParams();
    const { pathname } = useLocation();
    const { fetchApi: getDashboardMonitors } = useGetDashboardMonitorsApi(
        groupId ? Number(groupId) : undefined
    );
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState<number | null>(
        null
    );
    const flippyRefs = useRef<any[]>([]);
    const { fetchApi: deleteDashboardMonitors, data: responseOfDelete } =
        useDeleteDashboardMonitorsApi([shouldBeDeleteId || 0]);

    const dashboardMonitorsPool = useSelector(selectDashboardMonitors);
    const dashboardMonitors = dashboardMonitorsPool.filter((item) =>
        groupId ? item.groupId === Number(groupId) : item.groupId === null
    );
    const [monitors, setMonitors] = useState<any[]>([]);
    const { fetchApi: updateDashboardMonitorSorting } =
        useUpdateDashboardMonitorSortingApi(
            monitors.map((item, index) => ({ id: item.id, sort: index + 1 }))
        );
    const dispatch = useDispatch();
    const popupMonitorConfig = (monitorItem: DashboardMonitorItem) => {
        dispatch(
            monitorConfigDialogActions.open({
                callback: () => {},
                ...monitorItem,
            })
        );
    };

    useEffect(() => {
        document.title = 'ItemHub - 監控中心';
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getDashboardMonitors();
        // eslint-disable-next-line
    }, [pathname]);

    useEffect(() => {
        const sortingDashboard = dashboardMonitorsPool
            .filter((item) =>
                groupId
                    ? item.groupId === Number(groupId)
                    : item.groupId === null
            )
            .sort((prev, next) => {
                if (prev.sort > next.sort) {
                    return 1;
                } else {
                    return -1;
                }
            });
        setMonitors(
            sortingDashboard.map((item) => {
                const oldData = monitors.find(
                    (monitor) => monitor.id === item.id
                );
                return {
                    ...item,
                    chosen: true,
                    isLiveData: oldData ? oldData.isLiveData : false,
                };
            })
        );
        // eslint-disable-next-line
    }, [dashboardMonitorsPool]);

    useEffect(() => {
        if (
            !dashboardMonitors ||
            !monitors ||
            dashboardMonitors.length === 0 ||
            monitors.length === 0
        ) {
            return;
        }
        const sortedDashboardMonitors = dashboardMonitorsPool
            .filter((item) =>
                groupId
                    ? item.groupId === Number(groupId)
                    : item.groupId === null
            )
            .sort((item) => item.sort);
        const originSorting = sortedDashboardMonitors.map((item) => item.id);

        const sortedMonitors = [...monitors]
            .filter((item) =>
                groupId
                    ? item.groupId === Number(groupId)
                    : item.groupId === null
            )
            .sort((item) => item.sort);
        const sorting = sortedMonitors.map((item) => item.id);
        if (JSON.stringify(originSorting) === JSON.stringify(sorting)) {
            return;
        }

        updateDashboardMonitorSorting();
        // eslint-disable-next-line
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
                    cancelCallback: () => {
                        setShouldBeDeleteId(null);
                    },
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
            <div className="card monitor-container p-0 p-sm-4">
                <div>
                    <ReactSortable
                        className="row"
                        list={monitors}
                        setList={setMonitors}
                        handle=".sorting-icon"
                    >
                        {monitors.map(
                            (item: DashboardMonitorItem, index: number) => {
                                return (
                                    <div
                                        key={item.id}
                                        className={`mb-4 col-${
                                            item.column * 4
                                        } position-relative`}
                                    >
                                        <Flippy
                                            flipOnClick={false}
                                            flipDirection="horizontal"
                                            ref={(el: any) =>
                                                (flippyRefs.current[index] = el)
                                            }
                                        >
                                            <FrontSide className="bg-white">
                                                <div
                                                    className={`monitor-item ${
                                                        item.mode === 1
                                                            ? 'line-chart'
                                                            : ''
                                                    }`}
                                                >
                                                    <div
                                                        className={`border border-grey-200 rounded-3 w-100 h-100 overflow-hidden d-flex flex-column ${
                                                            item.mode !== 1
                                                                ? 'bg-grey-100'
                                                                : 'bg-white'
                                                        }`}
                                                    >
                                                        <div className="d-flex justify-content-between position-relative">
                                                            <div className="w-100 position-absolute top-0 text-center">
                                                                <span className="sorting-icon">
                                                                    :::::
                                                                </span>
                                                            </div>
                                                            <div
                                                                role="button"
                                                                className="btn-gear me-2 ms-auto mt-1 position-relative"
                                                                onClick={() => {
                                                                    flippyRefs.current[
                                                                        index
                                                                    ].toggle();
                                                                }}
                                                            >
                                                                <img
                                                                    className="gear-icon ps-3"
                                                                    src={
                                                                        gearIcon
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            {item.mode === 0 ? (
                                                                <CurrentValueMonitor
                                                                    customTitle={
                                                                        item.customTitle
                                                                    }
                                                                    isLiveData={
                                                                        item.isLiveData ||
                                                                        false
                                                                    }
                                                                    deviceId={
                                                                        item.deviceId
                                                                    }
                                                                    pin={
                                                                        item.pin
                                                                    }
                                                                    groupId={
                                                                        item.groupId
                                                                    }
                                                                />
                                                            ) : item.mode ===
                                                              1 ? (
                                                                <LineChartMonitor
                                                                    customTitle={
                                                                        item.customTitle
                                                                    }
                                                                    isLiveData={
                                                                        item.isLiveData ||
                                                                        false
                                                                    }
                                                                    deviceId={
                                                                        item.deviceId
                                                                    }
                                                                    pin={
                                                                        item.pin
                                                                    }
                                                                    groupId={
                                                                        item.groupId
                                                                    }
                                                                />
                                                            ) : (
                                                                <SwitchMonitor
                                                                    customTitle={
                                                                        item.customTitle
                                                                    }
                                                                    deviceId={
                                                                        item.deviceId
                                                                    }
                                                                    pin={
                                                                        item.pin
                                                                    }
                                                                    groupId={
                                                                        item.groupId
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </FrontSide>
                                            <BackSide className="bg-white">
                                                <div
                                                    className={`border border-grey-200 rounded-3 w-100 h-100 overflow-hidden d-flex flex-column ${
                                                        item.mode !== 1 &&
                                                        'bg-grey-100'
                                                    }`}
                                                >
                                                    <div className="d-flex justify-content-between position-relative">
                                                        <div className="w-100 position-absolute top-0 text-center">
                                                            <span className="sorting-icon">
                                                                :::::
                                                            </span>
                                                        </div>

                                                        <div
                                                            role="button"
                                                            className="btn-close me-2 ms-auto mt-2 pt-3 position-relative"
                                                            onClick={() => {
                                                                flippyRefs.current[
                                                                    index
                                                                ].toggle();
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="d-flex flex-column justify-content-center h-100 align-items-center">
                                                        <div
                                                            className={`cursor-point d-flex flex-row align-items-center w-100 justify-content-center mb-2 ${
                                                                item.mode ===
                                                                    2 &&
                                                                'd-none'
                                                            }`}
                                                            onClick={() => {
                                                                const newMonitors =
                                                                    monitors.map(
                                                                        (
                                                                            monitor
                                                                        ) => {
                                                                            const isLiveData =
                                                                                monitor.id ===
                                                                                item.id
                                                                                    ? !item.isLiveData
                                                                                    : monitor.isLiveData;
                                                                            return {
                                                                                ...monitor,
                                                                                isLiveData,
                                                                            };
                                                                        }
                                                                    );
                                                                setMonitors(
                                                                    newMonitors
                                                                );
                                                            }}
                                                        >
                                                            <div className="me-2">
                                                                <Toggle
                                                                    value={
                                                                        item.isLiveData
                                                                            ? 1
                                                                            : 0
                                                                    }
                                                                />
                                                            </div>
                                                            <div>
                                                                {item.isLiveData
                                                                    ? 'real-time'
                                                                    : 'static'}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex justify-content-center">
                                                            <button
                                                                onClick={() =>
                                                                    setShouldBeDeleteId(
                                                                        item.id
                                                                    )
                                                                }
                                                                className="btn btn-secondary mx-1 mx-sm-3"
                                                            >
                                                                <img
                                                                    className="me-0 me-sm-2"
                                                                    src={
                                                                        trashIcon
                                                                    }
                                                                />
                                                                <span className="d-none d-sm-inline">
                                                                    刪除
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    popupMonitorConfig(
                                                                        item
                                                                    )
                                                                }
                                                                className="btn btn-secondary mx-1 mx-sm-3"
                                                            >
                                                                <img
                                                                    className="me-0 me-sm-2"
                                                                    src={
                                                                        displayIcon
                                                                    }
                                                                />
                                                                <span className="d-none d-sm-inline">
                                                                    版面
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </BackSide>
                                        </Flippy>
                                    </div>
                                );
                            }
                        )}
                    </ReactSortable>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
