import { useEffect } from 'react';
import { useGetLastDeviceActivityApi } from '../../hooks/apis/devices.hook';
const PseudoDeviceLastActivity = ({ deviceId }: { deviceId: number }) => {
    const { fetchApi: getLastDeviceActivity } =
        useGetLastDeviceActivityApi(deviceId);

    useEffect(() => {
        getLastDeviceActivity();
    }, [deviceId, getLastDeviceActivity]);
    return null;
};

export default PseudoDeviceLastActivity;
