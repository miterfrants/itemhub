import { useEffect, useState } from 'react';
import { useGetDevicePinsApi } from '@/hooks/apis/device.pin.hook';
import Pin from '@/components/pin/pin';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectDevicePins } from '@/redux/reducers/pins.reducer';
import { PinItem } from '@/types/devices.type';

const Pins = (props: { deviceId: number; isEditMode: boolean }) => {
    const { deviceId, isEditMode } = props;
    const { isLoading, getDevicePinsApi } = useGetDevicePinsApi({
        id: Number(deviceId),
    });

    const devicePinsFromStore = useAppSelector(selectDevicePins);

    const [devicePins, setDevicePins] = useState<PinItem[] | null>(null);

    useEffect(() => {
        const devicePins =
            devicePinsFromStore?.filter(
                (item: PinItem) => item.deviceId === Number(deviceId)
            ) || [];
        setDevicePins(devicePins || null);
        if (devicePinsFromStore !== null) {
            return;
        }
        getDevicePinsApi();
        // eslint-disable-next-line
    }, [devicePinsFromStore]);

    return (
        // UI 結構等設計稿後再重構調整
        <div className="pins" data-testid="Pins">
            {isLoading || devicePins === null ? (
                <div>Loading</div>
            ) : (
                <div>
                    {devicePins.map((item) => (
                        <Pin
                            pinItem={item}
                            isEditMode={isEditMode}
                            key={`${item.deviceId}-${item.pin}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Pins;
