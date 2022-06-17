import Spinner from '@/components/spinner/spinner';

import { useGetDevicePinApi } from '@/hooks/apis/device.pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import debounce from 'lodash.debounce';
import { useEffect, useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    AreaSeries,
    Gradient,
    GradientStop,
    Line,
} from 'reaviz';
import { SetCookieParams } from '@/types/helpers.type';

const LineChartMonitor = (props: { deviceId: number; pin: string }) => {
    const { deviceId, pin } = props;

    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const resizeHandler = useRef(
        debounce(() => {
            setChartWidth(elementContainerRef.current?.offsetWidth || 0);
            setChartHeight(elementContainerRef.current?.offsetHeight || 0);
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

    const elementContainerRef = useRef<HTMLDivElement>(null);
    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(0);

    const { fetchApi: getDevicePin } = useGetDevicePinApi({
        id: deviceId,
        pin: pin,
    });

    useEffect(() => {
        getSensorLogs();
        getDevicePin();
        setChartWidth(elementContainerRef.current?.offsetWidth || 0);
        setChartHeight(elementContainerRef.current?.offsetHeight || 0);
        const resizeHanlder = resizeHandler.current;
        window.addEventListener('resize', resizeHanlder);
        return () => window.removeEventListener('resize', resizeHanlder);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!responseOfSensorLogs || responseOfSensorLogs.length === 0) {
            return;
        }
        setLineChartData(
            responseOfSensorLogs.map((item) => {
                return {
                    key: new Date(item.createdAt.split('T')[0]),
                    data: item.value,
                };
            })
        );
    }, [responseOfSensorLogs]);

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
                        <h1 className="mb-0">目前沒有資料</h1>
                    ) : (
                        <div
                            className={lineChartData.length > 0 ? '' : 'd-none'}
                        >
                            <AreaChart
                                width={chartWidth}
                                height={chartHeight}
                                margins={[50, 50]}
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
                                                                stopOpacity={1}
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
                    )}
                </div>
            )}
        </div>
    );
};

export default LineChartMonitor;
