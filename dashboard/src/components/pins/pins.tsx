import { useEffect, useState } from 'react';
import { useGetDevicePinsApi } from '@/hooks/apis/device-pin.hook';
import Pin from '@/components/pin/pin';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectDevicePins } from '@/redux/reducers/pins.reducer';
import { PinItem } from '@/types/devices.type';

const Pins = (props: {
    deviceId: number;
    isEditMode: boolean;
    isList?: boolean;
}) => {
    const { deviceId, isEditMode, isList } = props;
    const {
        isLoading,
        getDevicePinsApi,
        devicePins: responseOfGetPins,
    } = useGetDevicePinsApi({
        id: Number(deviceId),
    });

    const devicePinsFromStore = useAppSelector(selectDevicePins);
    const [isPinsGetted, setIsPinsGetted] = useState<boolean>(false);

    const [devicePins, setDevicePins] = useState<PinItem[] | null>(null);

    useEffect(() => {
        const devicePins =
            devicePinsFromStore?.filter(
                (item: PinItem) => item.deviceId === Number(deviceId)
            ) || [];
        setDevicePins(devicePins || null);
        if (isPinsGetted) {
            return;
        }
        getDevicePinsApi();
        // eslint-disable-next-line
    }, [devicePinsFromStore]);

    useEffect(() => {
        setIsPinsGetted(true);
    }, [responseOfGetPins]);

    return (
        // UI 結構等設計稿後再重構調整
        <div className="pins" data-testid="Pins">
            {isLoading || devicePins === null ? (
                <div>Loading</div>
            ) : (
                <>
                    {devicePins.length > 0 && isList && (
                        <hr className="border-grey-300" />
                    )}
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
                                        isList
                                            ? item.pinType === 0
                                                ? 'col-12'
                                                : 'col-12 col-md-3'
                                            : 'col-6'
                                    }`}
                                    key={`${item.deviceId}-${item.pin}`}
                                >
                                    <Pin
                                        groupId={undefined}
                                        pinItem={item}
                                        isEditMode={isEditMode}
                                    />
                                </div>
                            ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Pins;
