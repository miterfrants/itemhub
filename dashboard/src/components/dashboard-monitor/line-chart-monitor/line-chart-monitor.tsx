import Spinner from '@/components/spinner/spinner';
import { useGetDevicePinApi } from '@/hooks/apis/device-pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import { useEffect, useRef, useState, useCallback } from 'react';

import { PinItem } from '@/types/devices.type';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ScriptableContext,
    ChartOptions,
} from 'chart.js';
import lineChartOption from '@/constants/line-chart-options';
import moment from 'moment';
import { InnerYAxesTicks } from '@/chart-plugins/inner-y-axes-ticks';
import { InnerXAxesTicks } from '@/chart-plugins/inner-x-axes-ticks';
import {
    useGetGroupDevicePinApi,
    useGetGroupSensorLogsApi,
} from '@/hooks/apis/group-device-pin.hook';
import { ERROR_KEY } from '@/constants/error-key';
import { useGetDashboardMonitorsApi } from '@/hooks/apis/dashboard-monitor.hook';
import { ComputedFunctionHelpers } from '@/helpers/computed-function.helper';
import { SensorLogType } from '@/types/sensor-log.type';

enum TIME_RANGE {
    NONE = 0,
    THREE_HOURS_AGO = 1,
    TWENTY_FOUR_HOURS_AGO = 2,
    THREE_DAYS_AGO = 3,
    A_WEEK_AGO = 4,
    A_MOUNTH_AGO = 5,
}

const LineChartMonitor = (props: {
    deviceId: number;
    pin: string;
    isLiveData: boolean;
    customTitle: string;
    groupId?: number;
    computedFunctionRaw?: string | null;
    computedSourceDeviceId?: number | null;
    computedSourcePin?: string | null;
}) => {
    const {
        deviceId,
        pin,
        isLiveData: isLiveDataFromProps,
        customTitle,
        groupId,
        computedFunctionRaw,
        computedSourceDeviceId,
        computedSourcePin,
    } = props;
    const [data, setData] = useState<SensorLogType[]>([]);
    const [computedSourceData, setComputedSourceData] = useState<
        SensorLogType[]
    >([]);
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [isLiveData, setIsLiveData] = useState<boolean>(isLiveDataFromProps);
    const [xAxisTicks, setXAxisTicks] = useState<any[]>([]);
    const [startAt, setStartAt] = useState<string | undefined>(undefined);
    const timer: any = useRef(null);
    const [timeRange, setTimeRange] = useState<TIME_RANGE>(TIME_RANGE.NONE);
    const [lastDataCreatedAt, setLastDataCreatedAt] = useState<
        undefined | string
    >();
    const [firstDataCreatedAt, setFirstDataCreatedAt] = useState<
        undefined | string
    >();

    const execComputedFunction = useCallback(
        (value, sourceValue) => {
            if (!computedFunctionRaw) {
                return value;
            }
            const func = ComputedFunctionHelpers.Eval(
                computedFunctionRaw || ''
            );
            if (func) {
                return func(value, sourceValue);
            } else {
                return value;
            }
        },
        [computedFunctionRaw]
    );

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Filler,
        Legend,
        InnerYAxesTicks,
        InnerXAxesTicks
    );

    const {
        data: responseOfGetSensorLogs,
        fetchApi: getSensorLogs,
        isLoading,
    } = useGetSensorLogsApi({
        deviceId: deviceId,
        pin: pin,
        page: 1,
        limit: startAt == undefined ? 200 : 20000,
        startAt: startAt,
    });

    const { data: responseOfLastSensorLogs, fetchApi: getLastSensorLogs } =
        useGetSensorLogsApi({
            deviceId: deviceId,
            pin: pin,
            page: 1,
            limit: 1,
        });

    const {
        data: responseOfGetGroupSensorLogs,
        fetchApi: getGroupSensorLogs,
        isLoading: isGettingGroupSensorLogs,
        error: errorOfGetGroupSensorLogs,
    } = useGetGroupSensorLogsApi({
        deviceId: deviceId,
        pin: pin,
        page: 1,
        limit: startAt == undefined ? 200 : 20000,
        startAt: startAt,
        groupId: groupId || 0,
        skipErrorToaster: true,
    });

    const {
        data: responseOfGetLastGroupSensorLogs,
        fetchApi: getLastGroupSensorLogs,
        error: errorOfGetLastGroupSensorLogs,
    } = useGetGroupSensorLogsApi({
        deviceId: deviceId,
        pin: pin,
        page: 1,
        limit: 1,
        groupId: groupId || 0,
        skipErrorToaster: true,
    });

    const {
        fetchApi: getComputedSourceSensorLogs,
        data: respOfComputedSourceSensorLogs,
    } = useGetSensorLogsApi({
        deviceId: computedSourceDeviceId || 0,
        pin: computedSourcePin || '',
        page: 1,
        limit: 2000,
        endAt: lastDataCreatedAt,
        startAt: firstDataCreatedAt,
    });

    const {
        fetchApi: getComputedSourceGroupSensorLogs,
        data: respOfComputedSourceGroupSensorLogs,
    } = useGetGroupSensorLogsApi({
        deviceId: computedSourceDeviceId || 0,
        pin: computedSourcePin || '',
        page: 1,
        limit: 2000,
        endAt: lastDataCreatedAt,
        startAt: firstDataCreatedAt,
        groupId: groupId || 0,
    });

    const elementContainerRef = useRef<HTMLDivElement>(null);

    const options: ChartOptions = {
        ...lineChartOption,
        plugins: {
            ...lineChartOption.plugins,
            title: {
                ...lineChartOption.plugins?.title,
                text: customTitle || devicePin?.name || '',
            },
        },
        scales: {
            ...lineChartOption.scales,
            y: {
                ...lineChartOption.scales?.y,
                min: Math.min(...lineChartData) - 3,
            },
            x: {
                ...lineChartOption.scales?.x,
                ticks: {
                    ...lineChartOption.scales?.x?.ticks,
                    callback: (val: any, index: number, c: any) => {
                        const createdAt = xAxisTicks[index];
                        const step = Math.floor(c.length / 5);
                        const halfStep = Math.floor(step / 2);
                        const time = `${createdAt
                            .getHours()
                            .toString()
                            .padStart(2, '0')}:${createdAt
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')}`;
                        const date = `${(createdAt.getMonth() + 1)
                            .toString()
                            .padStart(2, '0')}/${createdAt
                            .getDate()
                            .toString()
                            .padStart(2, '0')}`;
                        const text =
                            timeRange === TIME_RANGE.NONE ||
                            timeRange === TIME_RANGE.THREE_HOURS_AGO ||
                            timeRange === TIME_RANGE.TWENTY_FOUR_HOURS_AGO
                                ? time
                                : timeRange === TIME_RANGE.THREE_DAYS_AGO ||
                                  timeRange === TIME_RANGE.A_WEEK_AGO ||
                                  timeRange === TIME_RANGE.A_MOUNTH_AGO
                                ? `${date} ${time}`
                                : '';
                        return index !== 0 && index % step === halfStep
                            ? text
                            : '';
                    },
                },
            },
        },
    };

    const { fetchApi: getDevicePin, data: responseOfGetDevicePin } =
        useGetDevicePinApi({
            id: deviceId,
            pin: pin,
        });
    const { fetchApi: getGroupDevicePin, data: responseOfGetGroupDevicePin } =
        useGetGroupDevicePinApi({
            groupId: groupId || 0,
            deviceId: deviceId,
            pin: pin,
            skipErrorToaster: true,
        });
    const { fetchApi: getDashboardMonitors } =
        useGetDashboardMonitorsApi(groupId);

    const {
        fetchApi: getLastComputedSourceSensorLogs,
        data: respOfLastComputedSourceSensorLogs,
    } = useGetSensorLogsApi({
        deviceId: computedSourceDeviceId || 0,
        pin: computedSourcePin || '',
        limit: 1,
        page: 1,
        endAt: lastDataCreatedAt,
    });

    const {
        fetchApi: getLastComputedSourceGroupSensorLogs,
        data: respOfLastComputedSourceGroupSensorLogs,
    } = useGetGroupSensorLogsApi({
        deviceId: computedSourceDeviceId || 0,
        pin: computedSourcePin || '',
        groupId: groupId || 0,
        limit: 1,
        page: 1,
        endAt: lastDataCreatedAt,
    });

    const startPooling = useCallback(() => {
        if (!isLiveData) {
            return;
        }
        if (groupId) {
            getLastGroupSensorLogs();
        } else {
            getLastSensorLogs();
        }

        if (groupId && computedSourceDeviceId && computedSourcePin) {
            getLastComputedSourceGroupSensorLogs();
        } else if (computedSourceDeviceId && computedSourcePin) {
            getLastComputedSourceSensorLogs();
        }

        timer.current = setTimeout(startPooling, 5000);
        // eslint-disable-next-line
    }, [data, isLiveData, getLastComputedSourceGroupSensorLogs, getLastComputedSourceSensorLogs, getLastSensorLogs, getLastGroupSensorLogs]);

    useEffect(() => {
        if (groupId) {
            getGroupDevicePin();
        } else {
            getDevicePin();
        }
        return () => clearTimeout(timer.current);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (responseOfGetSensorLogs) {
            setData(responseOfGetSensorLogs);
        } else if (responseOfGetGroupSensorLogs) {
            setData(responseOfGetGroupSensorLogs);
        }
    }, [responseOfGetSensorLogs, responseOfGetGroupSensorLogs]);

    useEffect(() => {
        if (
            responseOfLastSensorLogs &&
            responseOfLastSensorLogs.length > 0 &&
            !data.find((item) => item.id === responseOfLastSensorLogs[0].id)
        ) {
            setData([responseOfLastSensorLogs[0], ...data]);
        } else if (
            responseOfGetLastGroupSensorLogs &&
            responseOfGetLastGroupSensorLogs.length > 0 &&
            !data.find(
                (item) => item.id === responseOfGetLastGroupSensorLogs[0].id
            )
        ) {
            setData([responseOfGetLastGroupSensorLogs[0], ...data]);
        }
        // eslint-disable-next-line
    }, [responseOfGetLastGroupSensorLogs, responseOfLastSensorLogs]);

    useEffect(() => {
        if (respOfComputedSourceSensorLogs) {
            setComputedSourceData(respOfComputedSourceSensorLogs);
        } else if (respOfComputedSourceGroupSensorLogs) {
            setComputedSourceData(respOfComputedSourceGroupSensorLogs);
        }
    }, [respOfComputedSourceSensorLogs, respOfComputedSourceGroupSensorLogs]);

    useEffect(() => {
        if (
            respOfLastComputedSourceGroupSensorLogs &&
            respOfLastComputedSourceGroupSensorLogs.length > 0 &&
            !computedSourceData.find(
                (item) =>
                    item.id === respOfLastComputedSourceGroupSensorLogs[0].id
            )
        ) {
            setComputedSourceData([
                respOfLastComputedSourceGroupSensorLogs[0],
                ...computedSourceData,
            ]);
        } else if (
            respOfLastComputedSourceSensorLogs &&
            respOfLastComputedSourceSensorLogs.length > 0 &&
            !computedSourceData.find(
                (item) => item.id === respOfLastComputedSourceSensorLogs[0].id
            )
        ) {
            setComputedSourceData([
                respOfLastComputedSourceSensorLogs[0],
                ...computedSourceData,
            ]);
        }
        // eslint-disable-next-line
    }, [respOfLastComputedSourceGroupSensorLogs,
        respOfLastComputedSourceSensorLogs,
    ]);

    useEffect(() => {
        if (!errorOfGetGroupSensorLogs && !errorOfGetLastGroupSensorLogs) {
            return;
        }

        // 這個狀況應該只有在 group device 被 owner 拿掉了
        if (
            errorOfGetGroupSensorLogs?.errorKey ===
                ERROR_KEY.GROUP_DEVICE_HAS_REMOVED ||
            errorOfGetLastGroupSensorLogs?.errorKey ===
                ERROR_KEY.GROUP_DEVICE_HAS_REMOVED
        ) {
            // restore group dashboard monitors store
            getDashboardMonitors();
        }
        // eslint-disable-next-line
    }, [errorOfGetGroupSensorLogs, errorOfGetLastGroupSensorLogs]);

    useEffect(() => {
        setIsLiveData(isLiveDataFromProps);
    }, [isLiveDataFromProps]);

    useEffect(() => {
        const scopedData = [...data].reverse();
        if (data.length > 0) {
            setLastDataCreatedAt(data[0].createdAt);
        }

        setLineChartData(
            scopedData.map((item) => {
                // default sorting createdAt desc
                const previousSource = computedSourceData.find(
                    (source) => source.createdAt <= item.createdAt
                );
                const nextSource = computedSourceData.find(
                    (source) => source.createdAt >= item.createdAt
                );
                const createdAt = moment(item.createdAt);
                const previousSourceCreatedAt = previousSource
                    ? moment(previousSource.createdAt)
                    : null;
                const nextSourceCreatedAt = nextSource
                    ? moment(nextSource.createdAt)
                    : null;

                const sourceValue =
                    (previousSourceCreatedAt !== null &&
                        nextSourceCreatedAt !== null &&
                        previousSourceCreatedAt.diff(createdAt) >
                            nextSourceCreatedAt.diff(createdAt)) ||
                    previousSource === undefined
                        ? nextSource?.value
                        : previousSource !== undefined
                        ? previousSource.value
                        : 0;
                return execComputedFunction(item.value, sourceValue);
            })
        );
        setXAxisTicks(
            scopedData.map((item) => {
                return new Date(item.createdAt);
            })
        );
        // eslint-disable-next-line
    }, [data, computedSourceData, computedFunctionRaw]);

    useEffect(() => {
        if (responseOfGetDevicePin) {
            setDevicePin(responseOfGetDevicePin as PinItem);
        } else if (responseOfGetGroupDevicePin) {
            setDevicePin(responseOfGetGroupDevicePin as PinItem);
        }
    }, [responseOfGetDevicePin, responseOfGetGroupDevicePin]);

    useEffect(() => {
        if (isLiveData) {
            clearTimeout(timer.current);
            startPooling();
        } else {
            clearTimeout(timer.current);
        }
    }, [isLiveData, startPooling]);

    useEffect(() => {
        if (groupId) {
            getGroupSensorLogs();
        } else {
            getSensorLogs();
        }

        // eslint-disable-next-line
    }, [startAt]);

    useEffect(() => {
        if (timeRange === TIME_RANGE.NONE) {
            setStartAt(undefined);
        } else if (timeRange === TIME_RANGE.THREE_HOURS_AGO) {
            setStartAt(moment().add(-3, 'hour').format('YYYY-MM-DD HH:mm:ss'));
        } else if (timeRange === TIME_RANGE.TWENTY_FOUR_HOURS_AGO) {
            setStartAt(moment().add(-24, 'hour').format('YYYY-MM-DD HH:mm:ss'));
        } else if (timeRange === TIME_RANGE.THREE_DAYS_AGO) {
            setStartAt(moment().add(-3, 'days').format('YYYY-MM-DD HH:mm:ss'));
        } else if (timeRange === TIME_RANGE.A_WEEK_AGO) {
            setStartAt(moment().add(-7, 'days').format('YYYY-MM-DD HH:mm:ss'));
        } else if (timeRange === TIME_RANGE.A_MOUNTH_AGO) {
            setStartAt(
                moment().add(-30, 'month').format('YYYY-MM-DD HH:mm:ss')
            );
        }
    }, [timeRange]);

    useEffect(() => {
        if (groupId) {
            return;
        }
        if (computedSourceDeviceId && computedSourcePin) {
            getComputedSourceSensorLogs();
        }
        // eslint-disable-next-line
    }, [responseOfGetSensorLogs, computedSourceDeviceId, computedSourcePin]);

    useEffect(() => {
        if (computedSourceDeviceId && computedSourcePin && groupId) {
            getComputedSourceGroupSensorLogs();
        }
        // eslint-disable-next-line
    }, [
        responseOfGetGroupSensorLogs,
        computedSourceDeviceId,
        computedSourcePin,
    ]);

    return (
        <div
            ref={elementContainerRef}
            className="line-chart-monitor w-100 h-100"
        >
            <div className="d-flex align-items-center w-100 h-100 justify-content-center">
                <div className="d-flex flex-column w-100 h-100">
                    <div className="d-flex flex-wrap align-items-center justify-content-center">
                        <div
                            className={`dot rounded-circle flex-shirk-0 mb-3 me-3 ${
                                devicePin?.device?.online
                                    ? 'dot-green'
                                    : 'dot-grey'
                            }`}
                        />
                        <button
                            onClick={() =>
                                setTimeRange(TIME_RANGE.THREE_HOURS_AGO)
                            }
                            className="mb-3 mb-sm-3  me-3 btn btn-secondary"
                        >
                            近 3 小時
                        </button>
                        <button
                            onClick={() =>
                                setTimeRange(TIME_RANGE.TWENTY_FOUR_HOURS_AGO)
                            }
                            className="mb-3 mb-sm-3  me-3 btn btn-secondary"
                        >
                            近 24 小時
                        </button>
                        <button
                            onClick={() =>
                                setTimeRange(TIME_RANGE.THREE_DAYS_AGO)
                            }
                            className="mb-3 mb-sm-3  me-3 btn btn-secondary"
                        >
                            近 3 天
                        </button>
                        <button
                            onClick={() => setTimeRange(TIME_RANGE.A_WEEK_AGO)}
                            className="mb-3 mb-sm-3  me-3 btn btn-secondary"
                        >
                            近 1 週
                        </button>
                        <button
                            onClick={() =>
                                setTimeRange(TIME_RANGE.A_MOUNTH_AGO)
                            }
                            className="mb-3 mb-sm-3  me-3 btn btn-secondary"
                        >
                            近 30 天
                        </button>
                    </div>
                    {isLoading || isGettingGroupSensorLogs ? (
                        <div className="w-100 d-flex align-items-center justify-content-center mt-5">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="w-100 flex-grow-1">
                            <div
                                className={`d-flex flex-wrap align-items-center justify-content-center ${
                                    lineChartData.length === 0 ? '' : 'd-none'
                                }`}
                            >
                                <h2 className="mb-0 w-100 px-45 my-3 text-center">
                                    暫無資料
                                </h2>
                                <h3 className="mb-0 w-100 text-center px-45 my-3 d-flex align-items-center justify-content-center">
                                    <div
                                        className={`dot rounded-circle flex-shirk-0 me-2 ${
                                            devicePin?.device?.online
                                                ? 'dot-green'
                                                : 'dot-grey'
                                        }`}
                                    />
                                    {devicePin?.device?.name} -{' '}
                                    {devicePin?.name}
                                </h3>
                            </div>
                            <Line
                                className={
                                    lineChartData.length > 0 ? '' : 'd-none'
                                }
                                options={options}
                                data={{
                                    labels: xAxisTicks,
                                    datasets: [
                                        {
                                            backgroundColor: (
                                                context: ScriptableContext<'line'>
                                            ) => {
                                                const ctx = context.chart.ctx;
                                                const gradient =
                                                    ctx.createLinearGradient(
                                                        0,
                                                        0,
                                                        0,
                                                        300
                                                    );
                                                gradient.addColorStop(
                                                    0,
                                                    'rgba(204, 233, 238, 0.7)'
                                                );
                                                gradient.addColorStop(
                                                    0.8,
                                                    'rgba(152, 214, 223, 1)'
                                                );
                                                return gradient;
                                            },
                                            fill: true,
                                            label: devicePin?.name || '',
                                            data: lineChartData,
                                            borderColor: '#51c7cf',
                                            borderWidth: 1,
                                            tension: 0.4,
                                        },
                                    ],
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LineChartMonitor;
