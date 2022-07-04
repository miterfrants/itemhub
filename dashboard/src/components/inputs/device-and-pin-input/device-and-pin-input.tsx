import { useState, useEffect, useRef } from 'react';
import { DeviceItem, PinItem } from '@/types/devices.type';
import AutocompletedSearch from '@/components/inputs/autocompleted-search/autocompleted-search';

const DeviceAndPinInputs = ({
    allDevices,
    isDeviceNameError,
    initialDeviceName = '',
    deviceNameLabel,
    isPinError,
    pinLabel,
    pinValue,
    pinOptions,
    updatePin,
    updateDeviceId,
    isDisabled,
}: {
    allDevices: DeviceItem[];
    isDeviceNameError: boolean;
    initialDeviceName?: string;
    deviceNameLabel: string;
    isPinError: boolean;
    pinLabel: string;
    pinValue: string;
    pinOptions: PinItem[] | null;
    updatePin: (pin: string) => void;
    updateDeviceId: (id: number) => void;
    isDisabled: boolean;
}) => {
    const hasManualUpdate = useRef(false);
    const [deviceName, setDeviceName] = useState(initialDeviceName);

    const currentDeviceId =
        allDevices.filter(({ name }) => deviceName === name)[0]?.id || 0;

    useEffect(() => {
        if (hasManualUpdate.current) {
            updateDeviceId(currentDeviceId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDeviceId]);

    useEffect(() => {
        setDeviceName(initialDeviceName);
    }, [initialDeviceName]);

    return (
        <div className="d-flex flex-column flex-md-row w-100 mb-3">
            <div className="form-group w-100 pe-md-3 mb-3 mb-md-0">
                <label className="mb-1">{deviceNameLabel}</label>
                <AutocompletedSearch
                    datalistId={deviceNameLabel}
                    placeholder="請輸入裝置名稱搜尋"
                    defaultValue={deviceName}
                    isDisabled={isDisabled}
                    isError={isDeviceNameError}
                    errorMessage="請輸入裝置名稱"
                    updateCurrentValue={(newValue) => {
                        setDeviceName(newValue);
                        if (!hasManualUpdate.current) {
                            hasManualUpdate.current = true;
                        }
                    }}
                    allSuggestions={allDevices.map(({ name }) => name)}
                />
            </div>
            <div className="form-group w-100 ps-md-3">
                <label className="mb-1">
                    {pinLabel} {pinValue}
                </label>
                <select
                    className={`form-select ${isPinError && 'border-danger'}`}
                    value={pinValue}
                    disabled={isDisabled}
                    onChange={(e) => {
                        const newSourcePin = e.target.value;
                        updatePin(newSourcePin);
                    }}
                >
                    {pinOptions === null ? (
                        <option key="not-yet-fetch-pins" value="" />
                    ) : pinOptions.length === 0 ? (
                        <option key="no-pins-data" value="">
                            此裝置目前無 Pins，請重新選擇裝置
                        </option>
                    ) : (
                        <>
                            {pinValue === '' && (
                                <option key="not-yet-choose-pins" value="">
                                    請選擇 PIN
                                </option>
                            )}
                            {pinOptions.map(({ name, pin }, index) => {
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
    );
};

export default DeviceAndPinInputs;
