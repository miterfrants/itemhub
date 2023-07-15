import { useEffect, useState } from 'react';
import Pin from '@/components/pin/pin';
import { useAppSelector } from '@/hooks/redux.hook';
import { PinItem } from '@/types/devices.type';
import { useGetGroupDevicePinsApi } from '@/hooks/apis/group-device-pin.hook';
import { selectGroupDevicePins } from '@/redux/reducers/group-device-pins.reducer';

const GroupPins = (props: { deviceId: number; groupId: number }) => {
    const { deviceId, groupId } = props;
    const {
        isLoading,
        fetchApi: getDevicePinsApi,
        data: responseOfGetPins,
    } = useGetGroupDevicePinsApi({
        deviceId,
        groupId,
    });

    const devicePinsFromStore = useAppSelector(selectGroupDevicePins);
    const [isGetted, setIsGetted] = useState<boolean>(false);
    const [devicePins, setDevicePins] = useState<PinItem[] | undefined>(
        undefined
    );

    useEffect(() => {
        const devicePins =
            devicePinsFromStore?.filter(
                (item: PinItem) => item.deviceId === Number(deviceId)
            ) || [];
        setDevicePins(devicePins || undefined);
        if (isGetted) {
            return;
        }
        getDevicePinsApi();
        // eslint-disable-next-line
    }, [devicePinsFromStore]);

    useEffect(() => {
        setIsGetted(true);
    }, [responseOfGetPins]);

    return (
        // UI 結構等設計稿後再重構調整
        <div className="pins" data-testid="Pins">
            {isLoading || devicePins === undefined ? (
                <div>Loading</div>
            ) : (
                <div className="row">
                    {devicePins
                        .sort((curr, next) =>
                            curr.pinType == 1 && next.pinType == 0
                                ? -1
                                : curr.pinType == 1 && next.pinType == 1
                                ? 0
                                : 1
                        )
                        .map((item) => (
                            <div
                                className={`${
                                    item.pinType === 0
                                        ? 'col-12'
                                        : 'col-12 col-md-3'
                                }`}
                                key={`${item.deviceId}-${item.pin}`}
                            >
                                <Pin
                                    groupId={groupId}
                                    pinItem={item}
                                    isEditMode={false}
                                />
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default GroupPins;
