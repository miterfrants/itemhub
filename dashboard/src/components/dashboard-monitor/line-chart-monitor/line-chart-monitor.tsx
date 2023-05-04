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
}) => {
    const {
        deviceId,
        pin,
        isLiveData: isLiveDataFromProps,
        customTitle,
    } = props;

    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [isLiveData, setIsLiveData] = useState<boolean>(isLiveDataFromProps);
    const [xAxisTicks, setXAxisTicks] = useState<any[]>([]);
    const [sensorLogIds, setSensorLogIds] = useState<number[]>([]);
    const [startAt, setStartAt] = useState<string | undefined>(undefined);
    const timer: any = useRef(null);

    const [timeRange, setTimeRange] = useState<TIME_RANGE>(TIME_RANGE.NONE);

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
        data: responseOfSensorLogs,
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

    const startPooling = useCallback(() => {
        if (!isLiveData) {
            return;
        }
        getLastSensorLogs();
        timer.current = setTimeout(startPooling, 5000);
    }, [isLiveData, getLastSensorLogs]);

    useEffect(() => {
        getSensorLogs();
        getDevicePin();

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        setIsLiveData(isLiveDataFromProps);
    }, [isLiveDataFromProps]);

    useEffect(() => {
        if (!responseOfSensorLogs) {
            return;
        }
        responseOfSensorLogs.reverse();
        setLineChartData(responseOfSensorLogs.map((item) => item.value));
        setSensorLogIds(responseOfSensorLogs.map((item) => item.id));
        setXAxisTicks(
            responseOfSensorLogs.map((item) => {
                return new Date(item.createdAt);
            })
        );
    }, [responseOfSensorLogs]);

    useEffect(() => {
        if (
            !responseOfLastSensorLogs ||
            responseOfLastSensorLogs.length === 0
        ) {
            return;
        }
        const newLog = responseOfLastSensorLogs[0];
        const targetLog = sensorLogIds.find((id) => id === newLog.id);
        if (targetLog) {
            return;
        }

        setLineChartData([...lineChartData, newLog.value]);
        setSensorLogIds([...sensorLogIds, newLog.id]);
        setXAxisTicks([...xAxisTicks, new Date(newLog.createdAt)]);
        // eslint-disable-next-line
    }, [responseOfLastSensorLogs]);

    useEffect(() => {
        if (!responseOfGetDevicePin) {
            return;
        }
        setDevicePin(responseOfGetDevicePin as PinItem);
    }, [responseOfGetDevicePin]);

    useEffect(() => {
        if (isLiveData) {
            startPooling();
        } else {
            clearTimeout(timer.current);
        }
    }, [isLiveData, startPooling]);

    useEffect(() => {
        getSensorLogs();
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

    return (
        <div
            ref={elementContainerRef}
            className="line-chart-monitor w-100 h-100"
        >
            <div className="d-flex align-items-center w-100 h-100 justify-content-center">
                <div className="d-flex flex-column w-100 h-100">
                    <div className="d-flex flex-wrap align-items-center justify-content-center">
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
                    {isLoading ? (
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
