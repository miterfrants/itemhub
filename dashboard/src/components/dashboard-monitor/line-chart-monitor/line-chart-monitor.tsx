import Spinner from '@/components/spinner/spinner';
import { useGetDevicePinApi } from '@/hooks/apis/device.pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import debounce from 'lodash.debounce';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Area,
    AreaChart,
    AreaSeries,
    Gradient,
    GradientStop,
    Line,
    Margins,
} from 'reaviz';

import { PinItem } from '@/types/devices.type';
import Toggle from '@/components/toggle/toggle';

const LineChartMonitor = (props: { deviceId: number; pin: string }) => {
    const { deviceId, pin } = props;

    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [isLiveData, setIsLiveData] = useState<boolean>(false);
    const timer: any = useRef(null);

    const [lineChartMargin, setLineChartMargin] = useState<Margins | undefined>(
        [50, 50, 0, 50]
    );

    const resizeHandler = useRef(
        debounce(() => {
            const chartWidth = elementContainerRef.current?.offsetWidth || 0;
            setChartWidth(chartWidth);
            setChartHeight(
                elementContainerRef.current?.offsetHeight
                    ? elementContainerRef.current?.offsetHeight - 80
                    : 0
            );
            if (chartWidth <= 700) {
                setLineChartMargin([20, 20, 0, 10]);
            }
        }, 800)
    );

    const {
        data: responseOfSensorLogs,
        fetchApi: getSensorLogs,
        isLoading,
    } = useGetSensorLogsApi({
        deviceId: deviceId,
        pin: pin,
        page: 1,
        limit: 200,
    });

    const { data: responseOfLastSensorLogs, fetchApi: getLastSensorLogs } =
        useGetSensorLogsApi({
            deviceId: deviceId,
            pin: pin,
            page: 1,
            limit: 1,
        });

    const elementContainerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(0);

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

        resizeHandler.current();
        const resizeHanlder = resizeHandler.current;
        window.addEventListener('resize', resizeHanlder);
        return () => {
            clearTimeout(timer.current);
            window.removeEventListener('resize', resizeHanlder);
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!responseOfSensorLogs || responseOfSensorLogs.length === 0) {
            return;
        }
        setLineChartData(
            responseOfSensorLogs.map((item) => {
                return {
                    key: new Date(item.createdAt),
                    data: item.value,
                    id: item.id,
                };
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
        const targetLog = lineChartData.find((item) => item.id === newLog.id);
        if (targetLog) {
            return;
        }
        setLineChartData([
            {
                key: new Date(newLog.createdAt),
                data: newLog.value,
                id: newLog.id,
            },
            ...lineChartData,
        ]);
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

    return (
        <div
            ref={elementContainerRef}
            className="line-chart-monitor w-100 h-100"
        >
            {isLoading ? (
                <div className="">
                    <Spinner />
                </div>
            ) : (
                <div className="d-flex align-items-center h-100 justify-content-center">
                    {lineChartData.length <= 0 ? (
                        <h2 className="mb-0 px-45 my-3">暫無資料</h2>
                    ) : (
                        <div
                            className={`${
                                lineChartData.length > 0 ? '' : 'd-none'
                            }`}
                        >
                            <div
                                className="position-absolute cursor-point px-4 d-flex flex-column align-items-start"
                                onClick={() => setIsLiveData(!isLiveData)}
                            >
                                <div>
                                    <Toggle value={isLiveData ? 1 : 0} />
                                </div>
                                <div>及時監控: {isLiveData ? 'on' : 'off'}</div>
                            </div>
                            <h3 className="mb-0 w-100 text-center px-45 my-3">
                                {devicePin?.device?.name} - {devicePin?.name}
                            </h3>
                            <div>
                                <AreaChart
                                    width={chartWidth}
                                    height={chartHeight}
                                    margins={lineChartMargin}
                                    data={lineChartData}
                                    series={
                                        <AreaSeries
                                            area={
                                                <Area
                                                    gradient={
                                                        <Gradient
                                                            color="red"
                                                            stops={[
                                                                <GradientStop
                                                                    key="index"
                                                                    offset={0.1}
                                                                    color="#4ac5ff"
                                                                    stopOpacity={
                                                                        0.2
                                                                    }
                                                                />,
                                                                <GradientStop
                                                                    key="index"
                                                                    offset={1}
                                                                    color="#4ac5ff"
                                                                    stopOpacity={
                                                                        1
                                                                    }
                                                                />,
                                                            ]}
                                                        />
                                                    }
                                                />
                                            }
                                            line={
                                                <Line
                                                    strokeWidth={2}
                                                    color={'#ff0000'}
                                                />
                                            }
                                            colorScheme={'#4ac5ff'}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LineChartMonitor;
