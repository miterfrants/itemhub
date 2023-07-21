import Spinner from '@/components/spinner/spinner';
import { useGetDevicePinApi } from '@/hooks/apis/device-pin.hook';
import { useGetSensorLogsApi } from '@/hooks/apis/sensor-logs.hook';
import { PinItem } from '@/types/devices.type';
import { useEffect, useRef, useState, useCallback } from 'react';
import './current-value-monitor.scss';
import debounce from 'lodash.debounce';
import {
    useGetGroupDevicePinApi,
    useGetGroupSensorLogsApi,
} from '@/hooks/apis/group-device-pin.hook';
import { useGetDashboardMonitorsApi } from '@/hooks/apis/dashboard-monitor.hook';
import { ERROR_KEY } from '@/constants/error-key';

const CurrentValueMonitor = (props: {
    deviceId: number;
    pin: string;
    isLiveData: boolean;
    customTitle: string;
    groupId?: number;
}) => {
    const {
        deviceId,
        pin,
        isLiveData: isLiveDataFromProps,
        customTitle,
        groupId,
    } = props;
    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [isLiveData, setIsLiveData] = useState<boolean>(isLiveDataFromProps);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [pointer, setPointer] = useState<number>(4);
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

    const {
        data: responseOfGroupSensorLogs,
        fetchApi: getGroupSensorLogs,
        isLoading: isGettingGroupSensorLogs,
    } = useGetGroupSensorLogsApi({
        deviceId: deviceId,
        pin: pin,
        page: 1,
        limit: 1,
        groupId: groupId || 0,
        skipErrorToaster: true,
    });

    const { fetchApi: getDashboardMonitors } =
        useGetDashboardMonitorsApi(groupId);
    const elementContainerRef = useRef<HTMLDivElement>(null);

    const resizeHandler = useRef(
        debounce(() => {
            const containerWidth =
                elementContainerRef.current?.offsetWidth || 0;

            if (containerWidth < 150) {
                setPointer(2);
            } else {
                setPointer(4);
            }
        }, 800)
    );

    const { data: responseDevicePin, fetchApi: getDevicePin } =
        useGetDevicePinApi({ id: deviceId, pin: pin });
    const {
        data: responseGroupDevicePin,
        fetchApi: getGroupDevicePin,
        error: errorOfGetGroupDevicePin,
    } = useGetGroupDevicePinApi({
        deviceId: deviceId,
        pin: pin,
        groupId: groupId || 0,
        skipErrorToaster: true,
    });

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
        if (groupId) {
            getGroupSensorLogs();
            getGroupDevicePin();
        } else {
            getSensorLogs();
            getDevicePin();
        }

        resizeHandler.current();
        window.addEventListener('resize', resizeHandler.current);
        return () => {
            clearTimeout(timer.current);
            window.removeEventListener('resize', resizeHandler.current);
        };

        //eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!responseOfSensorLogs || responseOfSensorLogs.length === 0) {
            return;
        }
        if (groupId) {
            return;
        }
        setCurrentValue(responseOfSensorLogs[0].value);
        //eslint-disable-next-line
    }, [responseOfSensorLogs]);

    useEffect(() => {
        if (
            !responseOfGroupSensorLogs ||
            responseOfGroupSensorLogs.length === 0
        ) {
            return;
        }
        if (!groupId) {
            return;
        }
        setCurrentValue(responseOfGroupSensorLogs[0].value);
        //eslint-disable-next-line
    }, [responseOfGroupSensorLogs]);

    useEffect(() => {
        setDevicePin(responseDevicePin);
    }, [responseDevicePin]);

    useEffect(() => {
        setDevicePin(responseGroupDevicePin);
    }, [responseGroupDevicePin]);

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

    useEffect(() => {
        if (!errorOfGetGroupDevicePin) {
            return;
        }

        // 這個狀況應該只有在 group device 被 owner 拿掉了
        if (
            errorOfGetGroupDevicePin.errorKey ===
            ERROR_KEY.GROUP_DEVICE_HAS_REMOVED
        ) {
            // restore group dashboard monitors store
            getDashboardMonitors();
        }
        // eslint-disable-next-line
    }, [errorOfGetGroupDevicePin]);
    return (
        <div
            ref={elementContainerRef}
            className="current-value-monitor w-100 h-100"
        >
            {(isLoading && !isLoaded) ||
            (isGettingGroupSensorLogs && !isLoaded) ? (
                <div className="d-flex justify-content-center">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div className="d-flex align-items-center justify-content-center flex-column h-100">
                        <h1 className="text-center mb-0 current-value">
                            {currentValue
                                ? currentValue.toFixed(pointer)
                                : '暫無資料'}
                        </h1>
                        <div className="device-name">
                            <span
                                className={`align-middle dot rounded-circle ${
                                    devicePin?.device?.online
                                        ? 'dot-green'
                                        : 'dot-grey'
                                }`}
                            />
                            <span>
                                {customTitle ||
                                    devicePin?.name ||
                                    devicePin?.pin}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CurrentValueMonitor;
