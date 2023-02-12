import Spinner from '@/components/spinner/spinner';
import Toggle from '@/components/toggle/toggle';
import { useGetDevicePinApi } from '@/hooks/apis/device.pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import { PinItem } from '@/types/devices.type';
import { useEffect, useRef, useState, useCallback } from 'react';
import './current-value-monitor.scss';

const CurrentValueMonitor = (props: { deviceId: number; pin: string }) => {
    const { deviceId, pin } = props;
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [isLiveData, setIsLiveData] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const timer: any = useRef(null);
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

    const startPooling = useCallback(() => {
        if (!isLiveData) {
            return;
        }
        getSensorLogs();
        timer.current = setTimeout(startPooling, 5000);
    }, [isLiveData, getSensorLogs]);

    useEffect(() => {
        getSensorLogs();
        getDevicePin();
        return () => {
            clearTimeout(timer.current);
        };
        //eslint-disable-next-line
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

    useEffect(() => {
        if (isLiveData) {
            startPooling();
        } else {
            clearTimeout(timer.current);
        }
    }, [isLiveData, startPooling]);

    useEffect(() => {
        if (isLoading) {
            setIsLoaded(true);
        }
    }, [isLoading]);
    return (
        <div className="current-value-monitor p-3 w-100">
            {isLoading && !isLoaded ? (
                <div className="">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div
                        className="position-absolute cursor-point d-flex flex-row align-items-center top-0 start-0 mt-3 ms-3"
                        onClick={() => setIsLiveData(!isLiveData)}
                    >
                        <div className="me-2">
                            <Toggle value={isLiveData ? 1 : 0} />
                        </div>
                        <div>{isLiveData ? 'real-time' : 'static'}</div>
                    </div>
                    <div className="d-flex align-items-center flex-column mt-4">
                        <h3 className="mb-0 text-center">
                            {currentValue?.toFixed(4) || '暫無資料'}
                        </h3>
                        <div className="d-flex justify-content-center mt-2">
                            <h3 className="mb-0 device-name ps-2">
                                <div
                                    className={`align-middle dot rounded-circle ${
                                        devicePin?.device?.online
                                            ? 'dot-green'
                                            : 'dot-grey'
                                    }`}
                                />
                                {devicePin?.device?.name} -{' '}
                                {devicePin?.name || devicePin?.pin}
                            </h3>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrentValueMonitor;
