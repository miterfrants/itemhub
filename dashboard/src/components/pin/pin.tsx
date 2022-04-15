import { useUpdateDeviceSwitchPinApi } from '@/hooks/apis/devices.hook';
import { useEffect, useState, useRef } from 'react';
import { useUpdateDevicePinNameApi } from '@/hooks/apis/devices.hook';
import { useDebounce } from '@/hooks/debounce.hook';
import { PinItem } from '@/types/devices.type';

const Pin = (props: { pinItem: PinItem; isEditMode: boolean }) => {
    const { isEditMode, pinItem } = props;
    const {
        deviceId,
        pin,
        createdAt,
        mode,
        value: valueFromPorps,
        name: nameFromProps,
    } = pinItem;
    const [value, setValue] = useState(valueFromPorps);
    const [name, setName] = useState(nameFromProps);
    const isNameChangedRef = useRef(false);
    const isSwitch = mode === 1;

    const { isLoading: isChanging, updateDeviceSwitchPinApi } =
        useUpdateDeviceSwitchPinApi({
            deviceId,
            pin,
            value,
        });

    const { updateDevicePinNameApi, isLoading: isNameUpdating } =
        useUpdateDevicePinNameApi({
            deviceId,
            pin,
            name,
            callbackFunc: () => {
                isNameChangedRef.current = false;
            },
        });
    const debounceUpdatePinName = useDebounce(updateDevicePinNameApi, 800);

    const toggleSwitch = () => {
        setValue(value === 1 ? 0 : 1);
    };

    const updateLocalPinName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        isNameChangedRef.current = true;
        debounceUpdatePinName();
    };

    useEffect(() => {
        if (value && !isSwitch) {
            return;
        }
        updateDeviceSwitchPinApi();
    }, [value, isSwitch]);

    return (
        <div className="pin d-flex align-items-center">
            <div className="name me-2">
                {isEditMode ? (
                    <div>
                        <input
                            className="form-control me-2"
                            title={pin}
                            placeholder={pin}
                            value={name || ''}
                            onChange={updateLocalPinName}
                        />
                        <div>
                            {isNameChangedRef.current
                                ? '名稱有異動'
                                : isNameUpdating
                                ? '更新中'
                                : ''}
                        </div>
                    </div>
                ) : (
                    <div className="me-2"> {name || pin}</div>
                )}
            </div>

            {isSwitch ? (
                <div className="state d-flex align-items-center">
                    開關:
                    <div>{value === 1 ? '開' : '關'}</div>
                    {isEditMode ? (
                        <button
                            className="btn border ms-3"
                            onClick={toggleSwitch}
                            disabled={isChanging}
                        >
                            切換
                        </button>
                    ) : null}
                </div>
            ) : (
                <div>
                    感測器: {value}
                    <span>(最後收到資料的時間 {createdAt})</span>
                </div>
            )}
        </div>
    );
};

export default Pin;
