import Toggle from '@/components/toggle/toggle';
import {
    useUpdateDeviceSwitchPinApi,
    useGetDevicePinApi,
} from '@/hooks/apis/device-pin.hook';
import { useEffect, useState } from 'react';
import { PinItem } from '@/types/devices.type';
import Spinner from '@/components/spinner/spinner';

const SwitchMonitor = (props: { deviceId: number; pin: string }) => {
    const { deviceId, pin } = props;

    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [value, setValue] = useState(0);
    const [isFirstTimeGetPinValue, setIsFirstTimeGetPinValue] = useState<
        null | boolean
    >(null);

    const { updateDeviceSwitchPinApi } = useUpdateDeviceSwitchPinApi({
        deviceId,
        pin,
        value,
    });

    const {
        fetchApi: getDevicePin,
        data: responseOfGetDevicePin,
        isLoading,
    } = useGetDevicePinApi({
        id: deviceId,
        pin,
    });

    useEffect(() => {
        getDevicePin();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (isFirstTimeGetPinValue === null) {
            return;
        }
        if (isFirstTimeGetPinValue) {
            setIsFirstTimeGetPinValue(false); // 避免從其他裝置改狀態, 這邊一拿到新狀態發現不一樣就打 updateDeviceSwitchPinApi
            return;
        }
        updateDeviceSwitchPinApi();
        // eslint-disable-next-line
    }, [value]);

    useEffect(() => {
        if (!responseOfGetDevicePin) {
            return;
        }
        setDevicePin(responseOfGetDevicePin as PinItem);
        setValue(responseOfGetDevicePin.value || 0);
        setIsFirstTimeGetPinValue(true);
    }, [responseOfGetDevicePin]);

    return (
        <div
            className="switch-monitor w-100 p-3"
            onClick={() => {
                setValue(value === 1 ? 0 : 1);
            }}
        >
            {isLoading ? (
                <div className="">
                    <Spinner />
                </div>
            ) : (
                <div>
                    <div className="toggle-button-container mt-45">
                        <Toggle value={value} />
                    </div>
                    <div className="d-flex justify-content-center device-name text-center">
                        <span className="d-none d-md-inline ps-2">
                            <div
                                className={`align-middle dot rounded-circle ${
                                    devicePin?.device?.online
                                        ? 'dot-green'
                                        : 'dot-grey'
                                }`}
                            />
                            {devicePin?.device?.name} -
                        </span>{' '}
                        {devicePin?.name || devicePin?.pin}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SwitchMonitor;
