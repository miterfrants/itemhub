import { useEffect } from 'react';
import { useGetLastGroupDeviceActivityApi } from '@/hooks/apis/group-devices.hook';
const PseudoGroupDeviceLastActivity = ({
    groupId,
    deviceId,
}: {
    groupId: number;
    deviceId: number;
}) => {
    const { fetchApi: getLastDeviceActivity } =
        useGetLastGroupDeviceActivityApi(groupId, deviceId);

    useEffect(() => {
        getLastDeviceActivity();
    }, [groupId, deviceId, getLastDeviceActivity]);
    return null;
};

export default PseudoGroupDeviceLastActivity;
