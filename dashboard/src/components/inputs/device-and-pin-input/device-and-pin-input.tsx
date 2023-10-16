import { useState, useEffect } from 'react';
import AutocompletedSearch from '@/components/inputs/autocompleted-search/autocompleted-search';
import { useGetAllDevicesApi } from '@/hooks/apis/devices.hook';
import { useGetDevicePinsApi } from '@/hooks/apis/device-pin.hook';
import { KeyValuePair } from '@/types/common.type';
import { useAppSelector } from '@/hooks/redux.hook';
import { DeviceItem, PinItem } from '@/types/devices.type';
import { PIN_TYPES } from '@/constants/pin-type';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { useGetGroupAllDevicesApi } from '@/hooks/apis/group-devices.hook';
import { useGetGroupDevicePinsApi } from '@/hooks/apis/group-device-pin.hook';
import { selectDeviceSummaries } from '@/redux/reducers/device-summaries.reducer';
import { selectGroupDeviceSummaries } from '@/redux/reducers/group-device-summaries.reducer';

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
    excludeDeviceIds,
    groupId,
    allowNullableDeviceId,
}: {
    isDeviceNameError: boolean;
    defaultDeviceId?: number;
    deviceNameLabel: string;
    isPinError: boolean;
    pinType?: number | undefined;
    pinLabel: string;
    defaultPinValue: string;
    updatePin: (pin: string) => void;
    updateDeviceId: (id: number | undefined) => void;
    isDisabled: boolean;
    sensorOnly?: boolean;
    switchOnly?: boolean;
    excludeDeviceIds?: number[];
    groupId?: number;
    allowNullableDeviceId?: boolean;
}) => {
    const { getAllDevicesApi } = useGetAllDevicesApi();
    const { fetchApi: getGroupAllDevicesApi } = useGetGroupAllDevicesApi(
        groupId || 0
    );
    const [devicePins, setDevicePins] = useState<PinItem[]>();

    const devicesFromPerson = useAppSelector(selectDeviceSummaries);
    const devicesFromGroup = useAppSelector(selectGroupDeviceSummaries);
    const [filteredDevices, setFilteredDevices] = useState<DeviceItem[]>(
        [] as DeviceItem[]
    );
    const { deviceModes } = useAppSelector(selectUniversal);
    const sensorPinType = deviceModes.find(
        (item) => item.key === PIN_TYPES.SENSOR
    );
    const switchPinType = deviceModes.find(
        (item) => item.key === PIN_TYPES.SWITCH
    );
    const [deviceId, setDeviceId] = useState<undefined | number>(
        defaultDeviceId
    );

    const { devicePins: devicePinsFromPerson, getDevicePinsApi } =
        useGetDevicePinsApi({
            id: deviceId || 0,
            pinType,
        });

    const { data: devicePinsFromGroup, fetchApi: getGroupDevicePins } =
        useGetGroupDevicePinsApi({
            deviceId: deviceId || 0,
            groupId: groupId || 0,
        });

    useEffect(() => {
        if (groupId) {
            getGroupAllDevicesApi();
        } else {
            getAllDevicesApi();
        }
        // eslint-disable-next-line
    }, [groupId]);

    useEffect(() => {
        const devices = groupId ? devicesFromGroup : devicesFromPerson;

        setFilteredDevices(
            devices.filter((device) => {
                if (!excludeDeviceIds) {
                    return true;
                }
                return !excludeDeviceIds.includes(device.id);
            })
        );
    }, [devicesFromGroup, devicesFromPerson, excludeDeviceIds, groupId]);

    useEffect(() => {
        if (devicePinsFromGroup && devicePinsFromGroup.length > 0) {
            setDevicePins(devicePinsFromGroup);
        } else if (devicePinsFromPerson && devicePinsFromPerson.length > 0) {
            setDevicePins(devicePinsFromPerson);
        }
    }, [devicePinsFromPerson, devicePinsFromGroup]);

    useEffect(() => {
        if (!deviceId) {
            setDevicePins([]);
            return;
        }
        if (groupId) {
            getGroupDevicePins();
        } else {
            getDevicePinsApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceId, groupId]);

    useEffect(() => {
        setDeviceId(defaultDeviceId);
    }, [defaultDeviceId]);

    return filteredDevices.length > 0 ? (
        <div className="d-flex flex-column flex-md-row w-100 mb-3">
            <div className="form-group w-100 pe-md-3 mb-3 mb-md-0">
                <label className="mb-1">{deviceNameLabel}</label>
                {filteredDevices.length > 0 && (
                    <AutocompletedSearch
                        datalistId={deviceNameLabel}
                        placeholder="請輸入裝置名稱搜尋"
                        defaultValue={deviceId}
                        isDisabled={isDisabled}
                        isError={isDeviceNameError}
                        errorMessage="請輸入裝置名稱"
                        allowNullable={allowNullableDeviceId}
                        onValueChanged={(
                            newValue: number | string | undefined
                        ) => {
                            setDeviceId(
                                newValue === undefined
                                    ? undefined
                                    : Number(newValue)
                            );
                            updateDeviceId(
                                newValue === undefined
                                    ? undefined
                                    : Number(newValue)
                            );
                        }}
                        allSuggestions={(filteredDevices || []).map(
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
                    {!devicePins ? (
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
