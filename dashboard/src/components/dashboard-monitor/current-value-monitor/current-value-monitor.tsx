import Spinner from '@/components/spinner/spinner';
import { useGetDevicePinApi } from '@/hooks/apis/device.pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import { PinItem } from '@/types/devices.type';
import { useEffect, useState } from 'react';

const CurrentValueMonitor = (props: { deviceId: number; pin: string }) => {
    const { deviceId, pin } = props;
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const {
        data: responseOfSensorLogs,
        fetchApi: getSensorLogs,
        isLoading,
    } = useGetSensorLogsApi({
        deviceId: deviceId,
        pin: pin,
        page: 1,
        limit: 1,
    });

    const { data: responseDevicePin, fetchApi: getDevicePin } =
        useGetDevicePinApi({ id: deviceId, pin: pin });

    useEffect(() => {
        getSensorLogs();
        getDevicePin();
    }, []);

    useEffect(() => {
        if (!responseOfSensorLogs || responseOfSensorLogs.length === 0) {
            return;
        }
        setCurrentValue(responseOfSensorLogs[0].value);
    }, [responseOfSensorLogs]);

    useEffect(() => {
        setDevicePin(responseDevicePin);
    }, [responseDevicePin]);
    return (
        <div className="current-value-monitor">
            {isLoading ? (
                <div className="">
                    <Spinner />
                </div>
            ) : (
                <div>
                    <h1>{currentValue?.toFixed(4) || '目前沒有資料'}</h1>
                    <div className="d-flex">
                        <h3>
                            {devicePin?.device?.name} -{' '}
                            {devicePin?.name || devicePin?.pin}
                        </h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrentValueMonitor;
