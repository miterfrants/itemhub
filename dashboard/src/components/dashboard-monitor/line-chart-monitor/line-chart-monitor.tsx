import Spinner from '@/components/spinner/spinner';

import { useGetDevicePinApi } from '@/hooks/apis/device.pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import { useEffect, useRef, useState } from 'react';
import { AreaChart, AreaSeries } from 'reaviz';

const LineChartMonitor = (props: { deviceId: number; pin: string }) => {
    const { deviceId, pin } = props;

    const [lineChartData, setLineChartData] = useState<any[]>([]);
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

    const { data: responseDevicePin, fetchApi: getDevicePin } =
        useGetDevicePinApi({ id: deviceId, pin: pin });

    useEffect(() => {
        getSensorLogs();
        getDevicePin();
        setChartWidth(elementContainerRef.current?.offsetWidth || 0);
        setChartHeight(elementContainerRef.current?.offsetHeight || 0);
        window.addEventListener('resize', resizeHandler);
        return () => window.removeEventListener('reisze', resizeHandler);
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

    const resizeHandler = () => {
        setChartWidth(elementContainerRef.current?.offsetWidth || 0);
        setChartHeight(elementContainerRef.current?.offsetHeight || 0);
    };

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
                <div>
                    <AreaChart
                        width={chartWidth}
                        height={chartHeight}
                        margins={[50, 50]}
                        data={lineChartData}
                        series={<AreaSeries colorScheme={'#4ac5ff'} />}
                    />
                </div>
            )}
        </div>
    );
};

export default LineChartMonitor;
