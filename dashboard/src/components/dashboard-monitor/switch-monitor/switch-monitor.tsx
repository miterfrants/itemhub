import Toggle from '@/components/toggle/toggle';
import {
    useUpdateDeviceSwitchPinApi,
    useGetDevicePinApi,
} from '@/hooks/apis/device-pin.hook';
import { useEffect, useRef, useState } from 'react';
import { PinItem } from '@/types/devices.type';
import Spinner from '@/components/spinner/spinner';
import debounce from 'lodash.debounce';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectLayout } from '@/redux/reducers/layout.reducer';
import {
    useGetGroupDevicePinApi,
    useToggleGroupDeviceSwitchPinApi,
} from '@/hooks/apis/group-device-pin.hook';
import { ERROR_KEY } from '@/constants/error-key';
import { useGetDashboardMonitorsApi } from '@/hooks/apis/dashboard-monitor.hook';

const SwitchMonitor = (props: {
    deviceId: number;
    pin: string;
    customTitle: string;
    groupId?: number;
}) => {
    const { deviceId, pin, customTitle, groupId } = props;

    const [devicePin, setDevicePin] = useState<PinItem | null>(null);
    const [value, setValue] = useState<undefined | number>(undefined);
    const [defaultValue, setDefaultValue] = useState<undefined | number>(
        undefined
    );

    const { updateDeviceSwitchPinApi } = useUpdateDeviceSwitchPinApi({
        deviceId,
        pin,
        value: value || 0,
    });

    const { fetchApi: toggleGroupDevicePin } = useToggleGroupDeviceSwitchPinApi(
        {
            deviceId,
            pin,
            value: value || 0,
            groupId: groupId || 0,
        }
    );

    const { fetchApi: getDashboardMonitors } =
        useGetDashboardMonitorsApi(groupId);

    const {
        fetchApi: getDevicePin,
        data: responseOfGetDevicePin,
        isLoading,
    } = useGetDevicePinApi({
        id: deviceId,
        pin,
    });

    const {
        fetchApi: getGroupDevicePin,
        data: responseOfGetGroupDevicePin,
        isLoading: isGettingGroupDevicePin,
        error: errorOfGetGroupDevicePin,
    } = useGetGroupDevicePinApi({
        deviceId: deviceId,
        groupId: groupId || 0,
        pin,
        skipErrorToaster: true,
    });

    const elementContainerRef = useRef<HTMLDivElement>(null);
    const toggleButtonRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number>(1);
    const [titleVerticalOffset, setTitleVerticalOffset] = useState<number>(0);
    const layout = useAppSelector(selectLayout);

    const resizeHandler = useRef(
        debounce(() => {
            const containerWidth =
                elementContainerRef.current?.offsetWidth || 0;
            const boxShadowWidth = 4;
            const toggleButtonWidth = toggleButtonRef.current?.offsetWidth || 0;
            const horizontalPadding = 80;
            if (!toggleButtonRef.current) {
                return;
            }
            let targetScale =
                (containerWidth - horizontalPadding) /
                (toggleButtonWidth + boxShadowWidth);
            const maxScale = 7;
            const minScale = 1.3;
            const scaleRange = maxScale - minScale;
            if (targetScale > maxScale) {
                targetScale = maxScale;
            } else if (targetScale < minScale) {
                targetScale = minScale;
            }
            setTitleVerticalOffset(
                targetScale * 10 * ((0.5 / scaleRange) * targetScale + 0.4)
            );
            setScale(targetScale);
        }, 800)
    );

    useEffect(() => {
        if (groupId) {
            getGroupDevicePin();
        } else {
            getDevicePin();
        }

        resizeHandler.current();
        window.addEventListener('resize', resizeHandler.current);
        return () => {
            window.removeEventListener('resize', resizeHandler.current);
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        resizeHandler.current();
    }, [layout]);

    useEffect(() => {
        if (defaultValue === undefined) {
            // 還沒從 API 拿到資料
            return;
        }
        if (groupId) {
            toggleGroupDevicePin();
        } else {
            updateDeviceSwitchPinApi();
        }
        // eslint-disable-next-line
    }, [value]);

    useEffect(() => {
        if (!responseOfGetDevicePin) {
            return;
        }
        setDevicePin(responseOfGetDevicePin as PinItem);
        setDefaultValue(responseOfGetDevicePin.value || 0);
    }, [responseOfGetDevicePin]);

    useEffect(() => {
        if (!responseOfGetGroupDevicePin) {
            return;
        }
        setDevicePin(responseOfGetGroupDevicePin as PinItem);
        setDefaultValue(responseOfGetGroupDevicePin.value || 0);
    }, [responseOfGetGroupDevicePin]);

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
            className="switch-monitor w-100 px-1 h-100"
            onClick={() => {
                let result = 0;
                if (value === undefined && defaultValue === 0) {
                    result = 1;
                } else if (value !== undefined) {
                    result = value === 0 ? 1 : 0;
                }
                setValue(result);
            }}
        >
            {isLoading || isGettingGroupDevicePin ? (
                <div className="w-100 d-flex align-items-center justify-content-center mt-5">
                    <Spinner />
                </div>
            ) : (
                <div className="d-flex flex-column h-100 justify-content-center">
                    <div
                        className="toggle-button-container d-flex justify-content-center"
                        style={{ transform: `scale(${scale})` }}
                    >
                        <div ref={toggleButtonRef}>
                            <Toggle
                                value={
                                    value === undefined
                                        ? defaultValue || 0
                                        : value
                                }
                            />
                        </div>
                    </div>
                    <div
                        className="d-flex title justify-content-center device-name text-center"
                        style={{
                            transform: `translateY(${titleVerticalOffset}px)`,
                        }}
                    >
                        <div
                            className={`align-middle dot rounded-circle ${
                                devicePin?.device?.online
                                    ? 'dot-green'
                                    : 'dot-grey'
                            }`}
                        />
                        {customTitle || devicePin?.name || devicePin?.pin}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SwitchMonitor;
