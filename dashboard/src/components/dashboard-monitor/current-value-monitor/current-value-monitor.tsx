import Spinner from '@/components/spinner/spinner';
import Toggle from '@/components/toggle/toggle';
import { useGetDevicePinApi } from '@/hooks/apis/device.pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import { PinItem } from '@/types/devices.type';
import { useEffect, useRef, useState, useCallback } from 'react';

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
        <div className="current-value-monitor">
            {isLoading && !isLoaded ? (
                <div className="">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div
                        className="position-absolute cursor-point px-4 d-flex flex-column align-items-start top-0 start-0 py-4"
                        onClick={() => setIsLiveData(!isLiveData)}
                    >
                        <div>
                            <Toggle value={isLiveData ? 1 : 0} />
                        </div>
                        <div>及時監控: {isLiveData ? 'on' : 'off'}</div>
                    </div>
                    <div>
                        <h2 className="d-none d-lg-block mb-0 text-center px-45 my-3">
                            {currentValue?.toFixed(4) || '暫無資料'}
                        </h2>
                        <h3 className="d-none d-md-block d-lg-none mb-0 text-center px-45 my-3">
                            {currentValue?.toFixed(4) || '暫無資料'}
                        </h3>
                        <div className="d-block d-md-none mb-0 text-center px-45 my-3">
                            {currentValue?.toFixed(4) || '暫無資料'}
                        </div>
                        <div className="d-flex justify-content-center mt-4">
                            <h3 className="d-none d-md-block px-45 my-3">
                                {devicePin?.device?.name} -{' '}
                                {devicePin?.name || devicePin?.pin}
                            </h3>

                            <div className="d-block d-md-none px-45 my-3">
                                {devicePin?.device?.name} -{' '}
                                {devicePin?.name || devicePin?.pin}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrentValueMonitor;
