import { useEffect } from 'react';
import { useAppSelector } from '@/hooks/redux.hook';
import { DeviceItem } from '@/types/devices.type';
import { useGetDeviceApi } from '@/hooks/apis/devices.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';

const DeviceOnlineStatus = (props: { deviceId: number }) => {
    const { deviceId } = props;
    const { fetchApi: getDeviceApi } = useGetDeviceApi(Number(deviceId));

    const devicesFromStore = useAppSelector(selectDevices).devices;
    const device: DeviceItem | null =
        (devicesFromStore || []).find(
            (item: DeviceItem) => item.id === deviceId
        ) || null;

    useEffect(() => {
        if (!devicesFromStore || devicesFromStore.length === 0) {
            getDeviceApi();
        }
    }, [devicesFromStore]);

    return (
        <div className="d-inline-flex">
            {device === null ? (
                <div>loading</div>
            ) : (
                <div
                    className={`dot rounded-circle ${
                        device.online ? 'dot-green' : 'dot-grey'
                    }`}
                />
            )}
        </div>
    );
};

export default DeviceOnlineStatus;
