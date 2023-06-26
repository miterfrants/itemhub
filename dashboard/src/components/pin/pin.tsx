import {
    useUpdateDevicePinNameApi,
    useUpdateDeviceSwitchPinApi,
} from '@/hooks/apis/device-pin.hook';
import { useEffect, useState, useRef } from 'react';
import { useDebounce } from '@/hooks/debounce.hook';
import { PinItem } from '@/types/devices.type';
import moment from 'moment';
import Toggle from '../toggle/toggle';
import ReactTooltip from 'react-tooltip';
import analyticsIcon from '@/assets/images/analytics.svg';
import { Link, useLocation } from 'react-router-dom';

const Pin = (props: { pinItem: PinItem; isEditMode: boolean }) => {
    const { isEditMode, pinItem } = props;
    const { search } = useLocation();
    const {
        deviceId,
        pin,
        createdAt,
        pinType: pinType,
        value: valueFromPorps,
        name: nameFromProps,
    } = pinItem;
    const [value, setValue] = useState(0);
    const [name, setName] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const isNameChangedRef = useRef(false);
    const isSwitch = pinType === 1;

    const { updateDeviceSwitchPinApi } = useUpdateDeviceSwitchPinApi({
        deviceId,
        pin,
        value: value || 0,
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
        debounceUpdatePinName(null);
    };

    useEffect(() => {
        // 完成 setValue 再執行 setIsInitialized true
        if (!isInitialized && pinItem.value === value) {
            setIsInitialized(true);
        }
        if (!isInitialized || value === undefined || !isSwitch) {
            return;
        }
        updateDeviceSwitchPinApi();
        // eslint-disable-next-line
    }, [value, isSwitch]);

    useEffect(() => {
        setName(nameFromProps || '');
    }, [nameFromProps]);

    useEffect(() => {
        setValue(valueFromPorps || 0);
    }, [valueFromPorps]);

    return (
        <div
            className="pin d-flex flex-wrap align-items-center mb-2"
            role={isSwitch ? 'button' : ''}
            onClick={isSwitch ? toggleSwitch : () => {}}
        >
            <div className="name">
                {isEditMode ? (
                    <div>
                        <input
                            className="form-control"
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
                    <div className="text-black text-opacity-65 me-2 mb-2">
                        {' '}
                        {name || pin}
                    </div>
                )}
            </div>

            {isSwitch ? (
                <div className="ms-2 mb-2">
                    <Toggle value={value} />
                </div>
            ) : (
                <>
                    <div className="text-black text-opacity-65 mb-2 d-flex align-items-center">
                        : {value}
                        <div className="ms-4">
                            <Link
                                to={`/dashboard/devices/${deviceId}/${pin}/statistics${search}`}
                                role="button"
                                data-tip="查詢歷史統計資料"
                            >
                                <img src={analyticsIcon} />
                            </Link>
                            <ReactTooltip effect="solid" />
                        </div>
                    </div>
                    <div className="fs-5 mb-0 text-black text-opacity-45 fw-normal w-100">
                        最後回傳時間
                        {` ${moment(createdAt).format('YYYY-MM-DD HH:mm')}`}
                    </div>
                </>
            )}
        </div>
    );
};

export default Pin;
