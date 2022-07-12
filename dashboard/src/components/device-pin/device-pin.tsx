// refactor: 把它拆成多個 component 避免一段程式這麼長
import { useState, useEffect, useRef } from 'react';
// import { useNavigate, useParams, useLocation } from 'react-router-dom';
// import {
//     useCreateDeviceApi,
//     useGetDeviceApi,
//     useUpdateDeviceApi,
// } from '@/hooks/apis/devices.hook';
import {
    // useDeletePinsApi,
    useGetDevicePinsApi,
    // useUpdatePinsApi,
} from '@/hooks/apis/device.pin.hook';

import { useAppSelector } from '@/hooks/redux.hook';
// import { selectDevices } from '@/redux/reducers/devices.reducer';
// import { useDispatch } from 'react-redux';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { CreaetPinItem, PinItem } from '@/types/devices.type';
import { selectDevicePins } from '@/redux/reducers/pins.reducer';
import { DEVICE_MODE } from '@/constants/device-mode';
import ReactTooltip from 'react-tooltip';
import { Microcontroller } from '@/types/universal.type';
import closeIcon from '@/assets/images/dark-close.svg';

const DevicePin = ({
    deviceId,
    microcontrollerId,
    updateSelectedPins,
    removeSelectedPins,
    isSelectedPinsValid,
}: {
    deviceId: number;
    microcontrollerId: number;
    updateSelectedPins: (pins: CreaetPinItem) => void;
    removeSelectedPins: (pin: string) => void;
    isSelectedPinsValid: boolean;
}) => {
    const devicePinsFromStore = useAppSelector(selectDevicePins);

    const [selectedPins, setSelectedPins] = useState([] as PinItem[]);
    const devicePinsRef = useRef<PinItem[]>([]);
    const { microcontrollers } = useAppSelector(selectUniversal);
    const { deviceModes } = useAppSelector(selectUniversal);
    const [selectedMicrocontroller, setSelectedMicrocontroller] =
        useState<null | Microcontroller>(null);

    const [isEditPinNameOpen, setIsEditPinNameOpen] = useState(false);
    const pinNameInputRef = useRef<HTMLInputElement>(null);
    const [originalPin, setOriginalPin] = useState('');
    const [switchMode, setSwitchMode] = useState(1);
    const [sensorMode, setSensorMode] = useState(0);

    const { getDevicePinsApi } = useGetDevicePinsApi({
        id: Number(deviceId),
    });

    const editPinName = (name: string) => {
        setOriginalPin(name);
        setIsEditPinNameOpen(true);
    };

    const getShortPinName = (name: string) => {
        const pinName = selectedPins?.find((pins) => {
            return pins.pin === name;
        })?.name;

        if (!pinName) {
            return name;
        }
        if (pinName?.length <= 2) {
            return pinName;
        }
        return `${pinName.substring(0, 2)}...`;
    };

    const getFullPinName = (name: string) => {
        const newPinName = selectedPins?.find((pins) => {
            return pins.pin === name;
        })?.name;

        if (!newPinName) {
            return;
        }

        return newPinName;
    };

    const closeEditPinName = () => {
        setIsEditPinNameOpen(false);
    };

    const updatePinName = () => {
        const pinData = selectedPins?.find((item) => {
            return item.pin === originalPin;
        });

        if (!pinData) {
            return;
        }
        const newPinData: CreaetPinItem = {
            pin: pinData.name || '',
            mode: sensorMode,
            name: pinNameInputRef.current?.value || '',
            value: null,
        };
        console.log(pinData);

        if (pinNameInputRef.current) {
            updateSelectedPins(newPinData);
            selectPins(
                pinData.pin,
                pinData.mode,
                pinNameInputRef.current.value,
                pinData.value
            );
            pinNameInputRef.current.value = '';
        }

        setIsEditPinNameOpen(false);
        ReactTooltip.rebuild();
    };
    const [isValidData, setIsValidData] = useState({
        selectedPins: true,
    });

    // const validate = () => {
    //     let isValid = true;

    //     if (!selectedPins || selectedPins.length === 0) {
    //         setIsValidData((prev) => {
    //             return {
    //                 ...prev,
    //                 selectedPins: false,
    //             };
    //         });
    //         isValid = false;
    //     }
    // };

    const selectPins = (
        pin: string,
        mode: number,
        name: string,
        value: number | null
    ) => {
        setSelectedPins(() => {
            const newSelected = [...(selectedPins || [])];
            const targetIndex = newSelected
                ?.map((item) => {
                    return item.pin;
                })
                .indexOf(pin);

            if (targetIndex !== -1) {
                newSelected?.splice(Number(targetIndex), 1);
            }
            const pushData: PinItem = {
                id: devicePinsRef.current.filter(
                    (item) =>
                        item.pin === pin && item.deviceId === Number(deviceId)
                )[0]?.id,
                deviceId: Number(deviceId),
                pin,
                mode,
                name,
                value,
            };

            newSelected.push({ ...pushData });
            return newSelected;
        });
        setIsValidData((prev) => {
            return {
                ...prev,
                selectedPins: true,
            };
        });
    };

    useEffect(() => {
        const devicePins =
            devicePinsFromStore?.filter(
                (item: PinItem) => item.deviceId === deviceId
            ) || ([] as PinItem[]);
        if (devicePinsFromStore === null) {
            getDevicePinsApi();
            return;
        }
        setSelectedPins(devicePins);
        devicePinsRef.current = devicePins;
        // eslint-disable-next-line
    }, [devicePinsFromStore]);

    useEffect(() => {
        const switchMode = deviceModes.filter((item) => {
            return item.key === DEVICE_MODE.SWITCH;
        })[0]?.value;

        if (switchMode !== undefined) {
            setSwitchMode(switchMode);
        }

        const sensorMode = deviceModes.filter((item) => {
            return item.key === DEVICE_MODE.SENSOR;
        })[0]?.value;

        if (sensorMode !== undefined) {
            setSensorMode(sensorMode);
        }
    }, [deviceModes]);

    useEffect(() => {
        if (microcontrollerId !== null) {
            const targetMcu = microcontrollers.find(
                (item) => item.id === microcontrollerId
            );
            setSelectedMicrocontroller(
                targetMcu !== undefined ? targetMcu : null
            );
        }

        // eslint-disable-next-line
    }, [microcontrollerId]);

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [selectedPins]);

    useEffect(() => {
        pinNameInputRef.current?.focus();
    }, [isEditPinNameOpen]);

    return (
        <div>
            <div className="mb-4">
                <label>選擇 Pin</label>
                {!isSelectedPinsValid && (
                    <div className="text-danger fs-5">
                        請點選並設定至少一個 Pin
                    </div>
                )}
                <div className="d-flex flex-wrap mt-2">
                    {selectedMicrocontroller?.pins.map((pin, index) => {
                        return (
                            <div
                                className={`${
                                    selectedPins
                                        ?.map((pins) => {
                                            return pins.pin;
                                        })
                                        .includes(pin.name)
                                        ? 'selected'
                                        : ''
                                } position-relative pin p-2 m-1 mb-4`}
                                role="button"
                                key={index}
                            >
                                <div className="text-center pin-selector">
                                    {selectedPins?.filter((pins) => {
                                        return pins.pin === pin.name;
                                    })[0]?.mode === switchMode ? (
                                        <div>開關</div>
                                    ) : (
                                        <div>感應器</div>
                                    )}
                                </div>
                                <div
                                    className="text-center rounded-circle bg-black bg-opacity-5 border-black border-opacity-10 pin-text"
                                    data-tip={getFullPinName(pin.name)}
                                >
                                    {getShortPinName(pin.name)}
                                </div>
                                <ReactTooltip effect="solid" place="bottom" />
                                <div
                                    className={`rounded-2 shadow-lg overflow-hidden bg-white pin-option ${
                                        selectedPins?.find((pins) => {
                                            return pins.pin === pin.name;
                                        })
                                            ? 'pin-option-4'
                                            : 'pin-option-2'
                                    }`}
                                >
                                    <div
                                        className={`lh-1 p-25`}
                                        role="button"
                                        onClick={() => {
                                            const pinData: CreaetPinItem = {
                                                pin: pin.name,
                                                mode: switchMode,
                                                name: pin.name,
                                                value: 0,
                                            };
                                            selectPins(
                                                pin.name,
                                                switchMode,
                                                pin.name,
                                                0
                                            );
                                            updateSelectedPins(pinData);
                                        }}
                                    >
                                        設為開關
                                    </div>
                                    <div
                                        className="lh-1 p-25"
                                        role="button"
                                        onClick={() => {
                                            const pinData: CreaetPinItem = {
                                                pin: pin.name,
                                                mode: sensorMode,
                                                name: pin.name,
                                                value: null,
                                            };
                                            selectPins(
                                                pin.name,
                                                sensorMode,
                                                pin.name,
                                                null
                                            );
                                            updateSelectedPins(pinData);
                                        }}
                                    >
                                        設為感應器
                                    </div>
                                    <div
                                        className={`lh-1 p-25 ${
                                            selectedPins?.find((pins) => {
                                                return pins.pin === pin.name;
                                            })
                                                ? ''
                                                : 'd-none'
                                        }`}
                                        onClick={() => {
                                            editPinName(pin.name);
                                        }}
                                    >
                                        重新命名
                                    </div>
                                    <div
                                        className={`lh-1 p-25 ${
                                            selectedPins?.find((pins) => {
                                                return pins.pin === pin.name;
                                            })
                                                ? ''
                                                : 'd-none'
                                        }`}
                                        onClick={() => {
                                            removeSelectedPins(pin.name);
                                            setSelectedPins(
                                                selectedPins
                                                    ? selectedPins.filter(
                                                          (item) =>
                                                              item.pin !==
                                                              pin.name
                                                      )
                                                    : []
                                            );
                                        }}
                                    >
                                        取消設定
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* 編輯 pin name */}
            <div
                className={`dialog position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center ${
                    isEditPinNameOpen ? '' : 'd-none'
                }`}
            >
                <div
                    className="card py-3 px-0"
                    onKeyUp={(event: React.KeyboardEvent<HTMLDivElement>) => {
                        if (event.key === 'Escape') {
                            closeEditPinName();
                        }
                    }}
                >
                    <h4 className="text-center px-3 mb-0">重新命名</h4>
                    <hr />
                    <div className="px-3">
                        <input
                            placeholder="請輸入 PIN 的名稱"
                            className="form-control"
                            type="text"
                            ref={pinNameInputRef}
                            onKeyUp={(
                                event: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                                if (event.key === 'Escape') {
                                    closeEditPinName();
                                }

                                if (event.key === 'Enter') {
                                    updatePinName();
                                }
                            }}
                        />
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-end px-3">
                        <button
                            className="btn btn-secondary me-3 btn-secondary"
                            onClick={closeEditPinName}
                        >
                            取消
                        </button>
                        <button
                            className={`btn btn-primary`}
                            onClick={updatePinName}
                        >
                            確認
                        </button>
                    </div>
                    <div
                        role="button"
                        className="close-button position-absolute top-0 px-3 py-25"
                        onClick={closeEditPinName}
                    >
                        <img src={closeIcon} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevicePin;
