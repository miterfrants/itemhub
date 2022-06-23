import Toggle from '@/components/toggle/toggle';
import {
    useUpdateDeviceSwitchPinApi,
    useGetDevicePinApi,
} from '@/hooks/apis/device.pin.hook';
import { useEffect, useState } from 'react';
import { PinItem } from '@/types/devices.type';
import Spinner from '@/components/spinner/spinner';

const SwitchMonitor = (props: { deviceId: number; pin: string }) => {
    const { deviceId, pin } = props;

    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [value, setValue] = useState(0);

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
        updateDeviceSwitchPinApi();
    }, [value]);

    useEffect(() => {
        if (!responseOfGetDevicePin) {
            return;
        }
        setDevicePin(responseOfGetDevicePin as PinItem);
        setValue(responseOfGetDevicePin.value || 0);
    }, [responseOfGetDevicePin]);

    return (
        <div
            className="switch-monitor"
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
                    <Toggle value={value} />
                    <div className="d-flex justify-content-center mt-4">
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

export default SwitchMonitor;
