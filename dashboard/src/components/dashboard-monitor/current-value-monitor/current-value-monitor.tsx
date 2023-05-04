import Spinner from '@/components/spinner/spinner';
import { useGetDevicePinApi } from '@/hooks/apis/device-pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import { PinItem } from '@/types/devices.type';
import { useEffect, useRef, useState, useCallback } from 'react';
import './current-value-monitor.scss';

const CurrentValueMonitor = (props: {
    deviceId: number;
    pin: string;
    isLiveData: boolean;
}) => {
    const { deviceId, pin, isLiveData: isLiveDataFromProps } = props;
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [isLiveData, setIsLiveData] = useState<boolean>(isLiveDataFromProps);
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
        setIsLiveData(isLiveDataFromProps);
    }, [isLiveDataFromProps]);

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
        <div className="current-value-monitor px-3 w-100">
            {isLoading && !isLoaded ? (
                <div className="d-flex justify-content-center">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className="d-flex align-items-center flex-column mt-2">
                        <h3 className="mt-3 text-center">
                            {currentValue?.toFixed(4) || '暫無資料'}
                        </h3>
                        <div className="device-name">
                            <span
                                className={`align-middle dot rounded-circle ${
                                    devicePin?.device?.online
                                        ? 'dot-green'
                                        : 'dot-grey'
                                }`}
                            />
                            <span>{devicePin?.name || devicePin?.pin}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrentValueMonitor;
