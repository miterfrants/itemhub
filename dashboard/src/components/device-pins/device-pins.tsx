// refactor: 把它拆成多個 component 避免一段程式這麼長
import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { PinItem } from '@/types/devices.type';
import { PIN_TYPES } from '@/constants/device-mode';
import ReactTooltip from 'react-tooltip';
import { Pins } from '@/types/universal.type';
import closeIcon from '@/assets/images/dark-close.svg';
import { MCU_TYPE } from '@/constants/mcu-type';

const DevicePins = ({
    deviceId,
    microcontrollerId,
    selectedPinList,
    customPinList,
    updateSelectedPins,
    removeSelectedPins,
    isSelectedPinsValid,
}: {
    deviceId: number;
    microcontrollerId: number;
    selectedPinList: PinItem[];
    customPinList: Pins[];
    updateSelectedPins: (pins: PinItem) => void;
    removeSelectedPins: (pin: string) => void;
    isSelectedPinsValid: boolean;
}) => {
    const { microcontrollers } = useAppSelector(selectUniversal);
    const { deviceModes } = useAppSelector(selectUniversal);
    const [isEditPinNameOpen, setIsEditPinNameOpen] = useState(false);
    const pinNameInputRef = useRef<HTMLInputElement>(null);
    const [originalPin, setOriginalPin] = useState('');
    const [switchMode, setSwitchMode] = useState(1);
    const [sensorMode, setSensorMode] = useState(0);
    const [microcontrollerPins, setMicrocontrollerPins] = useState<Pins[]>([]);

    const editPinName = (name: string) => {
        setOriginalPin(name);
        setIsEditPinNameOpen(true);
    };

    const getShortPinName = (name: string) => {
        const pinName = selectedPinList?.find((pins) => {
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
        const newPinName = selectedPinList?.find((pins) => {
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
        const pinData = selectedPinList?.find((item) => {
            return item.pin === originalPin;
        });

        if (!pinData) {
            return;
        }

        const newPinData: PinItem = {
            deviceId: deviceId,
            pin: pinData.pin || '',
            pinNumber: pinData.pinNumber || '',
            mode: pinData.mode,
            name: pinNameInputRef.current?.value || '',
            value: null,
        };

        if (pinNameInputRef.current) {
            updateSelectedPins(newPinData);
            pinNameInputRef.current.value = '';
        }
        setIsEditPinNameOpen(false);
    };

    useEffect(() => {
        const switchMode = deviceModes.filter((item) => {
            return item.key === PIN_TYPES.SWITCH;
        })[0]?.value;

        if (switchMode !== undefined) {
            setSwitchMode(switchMode);
        }

        const sensorMode = deviceModes.filter((item) => {
            return item.key === PIN_TYPES.SENSOR;
        })[0]?.value;

        if (sensorMode !== undefined) {
            setSensorMode(sensorMode);
        }
    }, [deviceModes]);

    useEffect(() => {
        if (!microcontrollerId) {
            return;
        }

        const targetMcu = microcontrollers.find(
            (item) => item.id === microcontrollerId
        );

        if (!targetMcu) {
            return;
        }

        if (targetMcu?.key == MCU_TYPE.CUSTOM) {
            setMicrocontrollerPins(customPinList);
        } else {
            setMicrocontrollerPins(targetMcu.pins);
        }

        // eslint-disable-next-line
    }, [microcontrollerId, customPinList]);

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
                    {microcontrollerPins.map((pin, index) => {
                        return (
                            <div
                                className={`${
                                    selectedPinList
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
                                    {selectedPinList?.filter((pins) => {
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
                                        selectedPinList?.find((pins) => {
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
                                            const pinData: PinItem = {
                                                deviceId: deviceId,
                                                pin: pin.name,
                                                pinNumber: pin.pinNumber,
                                                mode: switchMode,
                                                name: pin.name,
                                                value: 0,
                                            };
                                            updateSelectedPins(pinData);
                                        }}
                                    >
                                        設為開關
                                    </div>
                                    <div
                                        className="lh-1 p-25"
                                        role="button"
                                        onClick={() => {
                                            const pinData: PinItem = {
                                                deviceId: deviceId,
                                                pin: pin.name,
                                                pinNumber: pin.pinNumber,
                                                mode: sensorMode,
                                                name: pin.name,
                                                value: null,
                                            };
                                            updateSelectedPins(pinData);
                                        }}
                                    >
                                        設為感應器
                                    </div>
                                    <div
                                        className={`lh-1 p-25 ${
                                            selectedPinList?.find((pins) => {
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
                                            selectedPinList?.find((pins) => {
                                                return pins.pin === pin.name;
                                            })
                                                ? ''
                                                : 'd-none'
                                        }`}
                                        onClick={() => {
                                            removeSelectedPins(pin.name);
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
                                if (
                                    !event.nativeEvent.isComposing &&
                                    event.key === 'Enter'
                                ) {
                                    updatePinName();
                                }
                            }}
                        />
                    </div>
                    <hr />
                    <div className="d-flex align-items-center justify-content-end px-3">
                        <button
                            className="btn btn-secondary me-3 btn-secondary"
                            onClick={() => {
                                closeEditPinName();
                            }}
                        >
                            取消
                        </button>
                        <button
                            className={`btn btn-primary`}
                            onClick={() => {
                                updatePinName();
                                setIsEditPinNameOpen(false);
                            }}
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

export default DevicePins;
