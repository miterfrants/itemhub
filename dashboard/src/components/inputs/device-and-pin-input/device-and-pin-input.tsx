import { useState, useEffect } from 'react';
import AutocompletedSearch from '@/components/inputs/autocompleted-search/autocompleted-search';
import { useGetAllDevicesApi } from '@/hooks/apis/devices.hook';
import { useGetDevicePinsApi } from '@/hooks/apis/device-pin.hook';
import { KeyValuePair } from '@/types/common.type';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import { DeviceItem } from '@/types/devices.type';
import { PIN_TYPES } from '@/constants/pin-type';
import { selectUniversal } from '@/redux/reducers/universal.reducer';

const DeviceAndPinInputs = ({
    isDeviceNameError,
    defaultDeviceId = 0,
    deviceNameLabel,
    isPinError,
    pinType,
    pinLabel,
    defaultPinValue,
    updatePin,
    updateDeviceId,
    isDisabled,
    sensorOnly,
    switchOnly,
}: {
    isDeviceNameError: boolean;
    defaultDeviceId: number;
    deviceNameLabel: string;
    isPinError: boolean;
    pinType?: number | undefined;
    pinLabel: string;
    defaultPinValue: string;
    updatePin: (pin: string) => void;
    updateDeviceId: (id: number) => void;
    isDisabled: boolean;
    sensorOnly?: boolean;
    switchOnly?: boolean;
}) => {
    const { getAllDevicesApi } = useGetAllDevicesApi();
    const allDevices: DeviceItem[] = useAppSelector(selectDevices).devices;
    const { deviceModes } = useAppSelector(selectUniversal);
    const sensorPinType = deviceModes.find(
        (item) => item.key === PIN_TYPES.SENSOR
    );
    const switchPinType = deviceModes.find(
        (item) => item.key === PIN_TYPES.SWITCH
    );
    const [deviceId, setDeviceId] = useState(defaultDeviceId);
    const { devicePins, getDevicePinsApi } = useGetDevicePinsApi({
        id: deviceId,
        pinType,
    });

    useEffect(() => {
        getAllDevicesApi();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        getDevicePinsApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allDevices, deviceId]);

    useEffect(() => {
        setDeviceId(defaultDeviceId);
    }, [defaultDeviceId]);

    return allDevices.length > 0 ? (
        <div className="d-flex flex-column flex-md-row w-100 mb-3">
            <div className="form-group w-100 pe-md-3 mb-3 mb-md-0">
                <label className="mb-1">{deviceNameLabel}</label>
                {allDevices.length > 0 && (
                    <AutocompletedSearch
                        datalistId={deviceNameLabel}
                        placeholder="請輸入裝置名稱搜尋"
                        defaultValue={deviceId}
                        isDisabled={isDisabled}
                        isError={isDeviceNameError}
                        errorMessage="請輸入裝置名稱"
                        onValueChanged={(
                            newValue: number | string | undefined
                        ) => {
                            setDeviceId(Number(newValue));
                            updateDeviceId(Number(newValue));
                        }}
                        allSuggestions={(allDevices || []).map(
                            ({ name, id }) =>
                                ({
                                    key: name,
                                    value: id,
                                } as KeyValuePair)
                        )}
                    />
                )}
            </div>
            <div className="form-group w-100 ps-md-3">
                <label className="mb-1">{pinLabel}</label>
                <select
                    className={`form-select ${isPinError && 'border-danger'}`}
                    value={defaultPinValue}
                    disabled={isDisabled}
                    onChange={(e) => {
                        const newSourcePin = e.target.value;
                        updatePin(newSourcePin);
                    }}
                >
                    {devicePins === null ? (
                        <option key="not-yet-fetch-pins" value="" />
                    ) : devicePins.length === 0 ? (
                        <option key="no-pins-data" value="">
                            此裝置目前無 Pins，請重新選擇裝置
                        </option>
                    ) : (
                        <>
                            <option key="not-yet-choose-pins" value="">
                                請選擇 PIN
                            </option>
                            {devicePins
                                .filter(
                                    (item) =>
                                        (sensorOnly &&
                                            item.pinType ===
                                                sensorPinType?.value) ||
                                        (switchOnly &&
                                            item.pinType ===
                                                switchPinType?.value) ||
                                        (!sensorOnly && !switchOnly)
                                )
                                .map(({ name, pin }, index) => {
                                    return (
                                        <option
                                            key={`${name}-${index}`}
                                            value={pin}
                                        >
                                            {name || 'PIN'}
                                        </option>
                                    );
                                })}
                        </>
                    )}
                </select>
                {isPinError && (
                    <div className="text-danger mt-15 fs-5">請輸入裝置 Pin</div>
                )}
            </div>
        </div>
    ) : (
        <div>目前沒有裝置</div>
    );
};

export default DeviceAndPinInputs;
