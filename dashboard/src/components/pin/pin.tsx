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
import { useToggleGroupDeviceSwitchPinApi } from '@/hooks/apis/group-device-pin.hook';
import { useGetComputedFunctions } from '@/hooks/apis/computed-functions.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectComputedFunctions } from '@/redux/reducers/computed-functions.reducer';
import { useDispatch } from 'react-redux';
import { computedFunctionDialogActions } from '@/redux/reducers/computed-function-dialog.reducer';
import { ComputedFunctions } from '@/types/computed-functions.type';
import { ComputedFunctionHelpers } from '@/helpers/computed-function.helper';

const Pin = (props: {
    pinItem: PinItem;
    isEditMode: boolean;
    groupId: number | undefined;
}) => {
    const { isEditMode, pinItem, groupId } = props;
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
    const dispatch = useDispatch();
    const [isInitialized, setIsInitialized] = useState(false);
    const [computedFunc, setComputedFunc] = useState<
        ComputedFunctions | undefined
    >(undefined);
    const [sensorComputedValue, setSensorComputedValue] = useState('');
    const isNameChangedRef = useRef(false);
    const isSwitch = pinType === 1;

    const { updateDeviceSwitchPinApi } = useUpdateDeviceSwitchPinApi({
        deviceId,
        pin,
        value: value || 0,
    });

    const { fetchApi: getComputedFunctions } = useGetComputedFunctions({
        devicePins: [
            {
                deviceId,
                pin,
            },
        ],
        groupId,
    });

    const computedFunctionsPool = useAppSelector(selectComputedFunctions);

    const { fetchApi: toggleGroupDevicePin } = useToggleGroupDeviceSwitchPinApi(
        {
            groupId: groupId || 0,
            deviceId,
            pin,
            value: value || 0,
        }
    );

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

        if (groupId) {
            toggleGroupDevicePin();
        } else {
            updateDeviceSwitchPinApi();
        }

        // eslint-disable-next-line
    }, [value, isSwitch]);

    useEffect(() => {
        setName(nameFromProps || '');
    }, [nameFromProps]);

    useEffect(() => {
        setValue(valueFromPorps || 0);
    }, [valueFromPorps]);

    useEffect(() => {
        if (isSwitch) {
            return;
        }
        getComputedFunctions();
        // eslint-disable-next-line
    }, [isSwitch]);

    useEffect(() => {
        if (
            isSwitch ||
            isSwitch === undefined ||
            !valueFromPorps ||
            !computedFunc ||
            !computedFunc.func
        ) {
            setSensorComputedValue(`${valueFromPorps?.toString() || ''}`);
            return;
        }

        const func = ComputedFunctionHelpers.Eval(computedFunc.func);

        if (func === null) {
            setSensorComputedValue(`${valueFromPorps?.toString() || ''}`);
            return;
        }
        setSensorComputedValue(
            `${valueFromPorps?.toString() || ''} -> ${func(valueFromPorps)}`
        );

        // eslint-disable-next-line
    }, [isSwitch, valueFromPorps, computedFunc]);

    useEffect(() => {
        if (computedFunctionsPool.length === 0 || isSwitch) {
            return;
        }
        const computedFunc = computedFunctionsPool.find(
            (item) => item.deviceId === deviceId && item.pin === pin
        );
        setComputedFunc(computedFunc);
        // eslint-disable-next-line
    }, [computedFunctionsPool]);

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
                    <div className="text-black text-opacity-65 me-2 mb-2 text-nowrap">
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
                        : {sensorComputedValue}
                        <div
                            onClick={() => {
                                dispatch(
                                    computedFunctionDialogActions.open({
                                        id: computedFunc?.id,
                                        deviceId,
                                        pin,
                                        groupId,
                                        func: computedFunc?.func,
                                    })
                                );
                            }}
                            className="ms-3"
                            role="button"
                            data-tip="轉換公式"
                        >
                            <span
                                className={
                                    computedFunc &&
                                    computedFunc.func &&
                                    computedFunc.func.trim().length > 0
                                        ? 'text-warn'
                                        : ''
                                }
                            >
                                <i>f</i>(x)
                            </span>
                        </div>
                        <div className="ms-4">
                            <Link
                                to={
                                    groupId
                                        ? `/dashboard/groups/${groupId}/devices/${deviceId}/${pin}/statistics${search}`
                                        : `/dashboard/devices/${deviceId}/${pin}/statistics${search}`
                                }
                                role="button"
                                data-tip="查詢歷史統計資料"
                            >
                                <img src={analyticsIcon} />
                            </Link>
                        </div>
                        <ReactTooltip effect="solid" />
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
