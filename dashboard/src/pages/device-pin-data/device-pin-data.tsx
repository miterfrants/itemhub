import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    useCreateDeviceApi,
    useGetDeviceApi,
    useUpdateDeviceApi,
} from '@/hooks/apis/devices.hook';
import {
    useCreatePinsApi,
    useDeletePinsApi,
    useGetDevicePinsApi,
    useUpdatePinsApi,
} from '@/hooks/apis/device.pin.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import { RESPONSE_STATUS } from '@/constants/api';
import PageTitle from '@/components/page-title/page-title';
import DevicePin from '@/components/device-pin/device-pin';
import { useDispatch } from 'react-redux';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import arduinoNano33Iot from '@/assets/images/arduino-nano-33-iot.svg';
import particleIoPhoton from '@/assets/images/particle-io-photon.jpeg';
import esp01s from '@/assets/images/esp-01s.svg';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { DeviceItem, PinItem } from '@/types/devices.type';
import { selectDevicePins } from '@/redux/reducers/pins.reducer';
import ReactTooltip from 'react-tooltip';
import { Microcontroller, Pins } from '@/types/universal.type';
import { MCU_TYPE } from '@/constants/mcu-type';
import { ValidationHelpers } from '@/helpers/validation.helper';

const DevicePinData = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { id: idFromUrl } = useParams();
    const { search, pathname } = useLocation();
    const id: number | null = idFromUrl ? Number(idFromUrl) : null;
    const isCreateMode = id === null;
    const devicesFromStore = useAppSelector(selectDevices).devices;
    const devicePinsFromStore = useAppSelector(selectDevicePins);

    const [name, setName] = useState('');
    const [customPinName, setCustomPinName] = useState('');
    const customPinNameRef = useRef<HTMLInputElement>(null);
    const [microcontrollerId, setMicrocontrollerId] = useState<number | null>(
        null
    );
    const [device, setDevice] = useState<DeviceItem | null>(null);

    const [selectedPins, setSelectedPins] = useState([] as PinItem[]);
    const devicePinsRef = useRef<PinItem[]>([]);
    const { microcontrollers } = useAppSelector(selectUniversal);
    const [microcontrollerImg, setMicrocontrollerIdImg] = useState('');
    const [selectedMicrocontroller, setSelectedMicrocontroller] =
        useState<null | Microcontroller>(null);

    const [customPins, setCustomPins] = useState<Pins[]>([]);
    const [validateCustomPinName, setValidateCustomPinName] =
        useState<boolean>(false);

    const [shouldBeAddedPins, setShouldBeAddedPins] = useState<
        PinItem[] | null
    >([]);

    const [shouldBeUpdatedPins, setShouldBeUpdatedPins] = useState<
        PinItem[] | null
    >([]);

    const [shouldBeDeletedPins, setShouldBeDeletedPins] = useState<
        PinItem[] | null
    >([]);

    const { isLoading: isGetting, fetchApi: getDeviceApi } = useGetDeviceApi(
        Number(id)
    );

    const { getDevicePinsApi } = useGetDevicePinsApi({
        id: Number(id),
    });

    const {
        isLoading: isUpdating,
        updateDeviceApi,
        data: updateDeviceResponse,
    } = useUpdateDeviceApi({
        id: Number(id),
        editedData: {
            name: name ? name : device?.name,
            microcontroller: microcontrollerId
                ? Number(microcontrollerId)
                : device?.microcontroller,
        },
    });

    const {
        fetchApi: createDeviceApi,
        isLoading: isCreating,
        data: createDeviceResponse,
    } = useCreateDeviceApi(name, microcontrollerId || -1);

    const { fetchApi: createDevicePinsApi } = useCreatePinsApi(
        Number(createDeviceResponse?.id) || Number(id),
        shouldBeAddedPins || []
    );

    const { fetchApi: updateDevicePinsApi } = useUpdatePinsApi(
        Number(createDeviceResponse?.id) || Number(id),
        shouldBeUpdatedPins || []
    );

    const { fetchApi: deleteDevicePinsApi } = useDeletePinsApi(
        Number(createDeviceResponse?.id) || Number(id),
        shouldBeDeletedPins || []
    );

    const back = () => {
        if (isCreateMode) {
            navigate(`/dashboard/devices/${search}`);
            return;
        }
        navigate(`/dashboard/devices/${id}${search}`);
    };

    const [isValidData, setIsValidData] = useState({
        name: true,
        selectedPins: true,
        selectedMicrocontroller: true,
    });

    const addCustomPins = () => {
        const existCustomPins = (customPins || []).find(
            (customPins) => customPins.name === customPinName
        );
        if (existCustomPins) {
            dispatch(
                toasterActions.pushOne({
                    message: '已有同樣名字的 Pin',
                    duration: 5,
                    type: ToasterTypeEnum.ERROR,
                })
            );
            return;
        }

        setCustomPins(() => {
            const newCustomPins = [...(customPins || [])];

            const pushData: Pins = {
                name: customPinName,
                value: null,
            };

            newCustomPins.push({ ...pushData });
            return newCustomPins;
        });

        if (customPinNameRef.current) {
            customPinNameRef.current.value = '';
            customPinNameRef.current?.focus();
        }
    };

    const sendApi = () => {
        // refactor: createDeviceApi() 和 updateDevice() 沒有統一規則
        const validateReslut = ValidationHelpers.ValidateDevicePinData(
            isCreateMode,
            name,
            microcontrollerId,
            selectedPins
        );
        if (!validateReslut.isValid) {
            setIsValidData(() => {
                return {
                    name: validateReslut.name,
                    selectedPins: validateReslut.selectedPins,
                    selectedMicrocontroller:
                        validateReslut.selectedMicrocontroller,
                };
            });
            return;
        }

        isCreateMode ? createDeviceApi() : updateDevice();
    };

    const updateDevice = () => {
        const shouldBeUpdatedPins = selectedPins?.filter((item) =>
            devicePinsRef.current
                ?.map((devicePin) => devicePin.pin)
                .includes(item.pin)
        );

        const shouldBeAddedPins = selectedPins?.filter(
            (item) =>
                !devicePinsRef.current
                    ?.map((devicePin) => devicePin.pin)
                    .includes(item.pin)
        );

        const shouldBeDeletedPins = devicePinsRef.current?.filter(
            (devicePin) =>
                !selectedPins
                    ?.map((selectedPin) => selectedPin.pin)
                    .includes(devicePin.pin)
        );

        if (shouldBeUpdatedPins && shouldBeUpdatedPins.length > 0) {
            setShouldBeUpdatedPins(shouldBeUpdatedPins);
        }

        if (shouldBeAddedPins && shouldBeAddedPins.length > 0) {
            setShouldBeAddedPins(shouldBeAddedPins);
        }

        if (shouldBeDeletedPins && shouldBeDeletedPins.length > 0) {
            setShouldBeDeletedPins(shouldBeDeletedPins);
        }

        updateDeviceApi();
    };

    const updateSelectPins = (target: PinItem) => {
        setSelectedPins(() => {
            const newSelected = [...(selectedPins || [])];
            const targetIndex = newSelected
                ?.map((item) => {
                    return item.pin;
                })
                .indexOf(target.pin);

            if (targetIndex !== -1) {
                newSelected?.splice(Number(targetIndex), 1);
            }
            const pushData: PinItem = {
                id: devicePinsRef.current.filter(
                    (item) =>
                        item.pin === target.pin && item.deviceId === Number(id)
                )[0]?.id,
                deviceId: Number(id),
                pin: target.pin,
                mode: target.mode,
                name: target.name,
                value: target.value,
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
        if (isCreateMode) {
            document.title = 'ItemHub - 新增裝置';
            return;
        }
        document.title = 'ItemHub - 編輯裝置';

        const devicePins =
            devicePinsFromStore?.filter(
                (item: PinItem) => item.deviceId === id
            ) || ([] as PinItem[]);
        if (devicePinsFromStore === null) {
            getDevicePinsApi();
            return;
        }
        setSelectedPins(devicePins);
        devicePinsRef.current = devicePins;

        const originalCustomPins = devicePins.map((item) => item.pin);

        setCustomPins(() => {
            const newCustomPins = [...(customPins || [])];
            originalCustomPins.forEach((item) => {
                const pushData: Pins = {
                    name: item,
                    value: null,
                };

                newCustomPins.push({ ...pushData });
            });

            return newCustomPins;
        });

        // eslint-disable-next-line
    }, [devicePinsFromStore]);

    useEffect(() => {
        if (isCreateMode) {
            return;
        }
        const device = (devicesFromStore || []).find(
            (item: DeviceItem) => item.id === id
        );
        if (!device) {
            getDeviceApi();
        } else {
            setDevice(device);
        }
        // eslint-disable-next-line
    }, [devicesFromStore]);

    useEffect(() => {
        if (device !== null) {
            setMicrocontrollerId(Number(device.microcontroller));
            setName(device.name);
        }
    }, [device]);

    useEffect(() => {
        ReactTooltip.rebuild();
    }, [selectedPins]);

    useEffect(() => {
        let targetKey = '';

        if (!microcontrollers || microcontrollers.length === 0) {
            return;
        }

        if (microcontrollerId !== null) {
            const targetMcu = microcontrollers.find(
                (item) => item.id === microcontrollerId
            );
            setSelectedMicrocontroller(
                targetMcu !== undefined ? targetMcu : null
            );
            targetKey = targetMcu ? targetMcu.key : '';
        }

        if (targetKey === MCU_TYPE.PARTICLE_IO_PHOTON) {
            setMicrocontrollerIdImg(particleIoPhoton);
        } else if (targetKey === MCU_TYPE.ARDUINO_NANO_33_IOT) {
            setMicrocontrollerIdImg(arduinoNano33Iot);
        } else if (targetKey === MCU_TYPE.ESP_01S) {
            setMicrocontrollerIdImg(esp01s);
        } else {
            setMicrocontrollerIdImg('');
        }
        // eslint-disable-next-line
    }, [microcontrollers, microcontrollerId]);

    useEffect(() => {
        if (updateDeviceResponse?.status === RESPONSE_STATUS.OK) {
            dispatch(
                toasterActions.pushOne({
                    message:
                        '裝置編輯已儲存，請重新下載程式碼並燒錄至裝置內以正常運作',
                    duration: 10,
                    type: ToasterTypeEnum.INFO,
                })
            );
            navigate(`/dashboard/devices/${id}${search}`);
        }
        // eslint-disable-next-line
    }, [updateDeviceResponse]);

    useEffect(() => {
        if (createDeviceResponse && !isNaN(createDeviceResponse.id)) {
            setShouldBeAddedPins(selectedPins);
            dispatch(
                toasterActions.pushOne({
                    message: '新增 Device 成功',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
            navigate(
                `/dashboard/devices/edit/${createDeviceResponse.id}${search}`
            );
        }
        // eslint-disable-next-line
    }, [createDeviceResponse]);

    useEffect(() => {
        if (!shouldBeUpdatedPins || shouldBeUpdatedPins.length === 0) {
            return;
        }
        updateDevicePinsApi();
        // eslint-disable-next-line
    }, [shouldBeUpdatedPins]);

    useEffect(() => {
        if (!shouldBeAddedPins || shouldBeAddedPins.length === 0) {
            return;
        }
        createDevicePinsApi();
        // eslint-disable-next-line
    }, [shouldBeAddedPins]);

    useEffect(() => {
        if (!shouldBeDeletedPins || shouldBeDeletedPins.length === 0) {
            return;
        }
        deleteDevicePinsApi();
        // eslint-disable-next-line
    }, [shouldBeDeletedPins]);

    useEffect(() => {
        if (customPinName.length > 6) {
            setValidateCustomPinName(false);
            return;
        }
        setValidateCustomPinName(true);
    }, [customPinName]);

    const breadcrumbs = [
        {
            label: '裝置列表',
            pathName: `/dashboard/devices${search}`,
        },
        {
            label: isCreateMode ? '新增' : '編輯',
            pathName: pathname,
        },
    ];

    return (
        <div
            className="form-data device-pin-data mx-auto"
            data-testid="device-pin-data"
        >
            <PageTitle
                breadcrumbs={breadcrumbs}
                titleClickCallback={back}
                titleBackIconVisible
                title={isCreateMode ? '新增裝置' : '編輯裝置'}
            />
            {isGetting ? (
                <div>Loading</div>
            ) : (
                <div className="card">
                    <div>
                        <div className="mb-4">
                            <label>裝置名稱</label>
                            <input
                                type="text"
                                className={`form-control mt-2 ${
                                    !isValidData.name && 'border-danger'
                                }`}
                                placeholder="請輸入裝置名稱"
                                defaultValue={device ? device.name : ''}
                                onChange={(e) => {
                                    const validResult =
                                        ValidationHelpers.Require(
                                            e.target.value
                                        );
                                    setName(e.target.value);
                                    setIsValidData((prev) => {
                                        return {
                                            ...prev,
                                            name: validResult,
                                        };
                                    });
                                }}
                            />
                            {!isValidData.name && (
                                <div className="text-danger mt-1 fs-5">
                                    請輸入裝置名稱
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <label>裝置類型</label>
                            <select
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        return;
                                    }
                                    setMicrocontrollerId(
                                        Number(e.target.value)
                                    );

                                    if (
                                        Number(e.target.value) !==
                                        device?.microcontroller
                                    ) {
                                        setSelectedPins([]);
                                    }

                                    const validResult =
                                        ValidationHelpers.Require(
                                            e.target.value
                                        );

                                    setIsValidData((prev) => {
                                        return {
                                            ...prev,
                                            selectedMicrocontroller:
                                                validResult,
                                        };
                                    });
                                }}
                                className="form-select mt-2"
                            >
                                <option>請選擇單晶片</option>
                                {microcontrollers.map(({ id, key }) => {
                                    return (
                                        <option
                                            key={id}
                                            value={id}
                                            selected={id === microcontrollerId}
                                        >
                                            {key
                                                .replaceAll('_', ' ')
                                                .toLowerCase()}
                                        </option>
                                    );
                                })}
                            </select>
                            {!isValidData.selectedMicrocontroller && (
                                <div className="text-danger fs-5">
                                    單晶片為必填欄位
                                </div>
                            )}
                        </div>
                        {!isCreateMode &&
                            selectedMicrocontroller?.key === MCU_TYPE.其他 && (
                                <div className="mb-4">
                                    <div className="d-flex mt-5 mb-3 fs-5">
                                        新增 Pin
                                        <hr className="bg-gray flex-grow-1 ms-3" />
                                    </div>
                                    <label>Pin 名稱</label>
                                    <div className="d-flex align-items-top mt-2">
                                        <div className="col-8 col-lg-3">
                                            <input
                                                type="text"
                                                className={`form-control ${
                                                    !validateCustomPinName &&
                                                    'border-danger'
                                                }`}
                                                ref={customPinNameRef}
                                                placeholder="限5字內"
                                                onChange={(e) => {
                                                    setCustomPinName(
                                                        e.target.value
                                                    );
                                                }}
                                            />
                                            {!validateCustomPinName && (
                                                <div className="text-danger fs-5">
                                                    限5字內
                                                </div>
                                            )}
                                        </div>
                                        <div className="col-4 col-lg-3 ms-3">
                                            <button
                                                disabled={
                                                    customPinName.length ===
                                                        0 ||
                                                    !validateCustomPinName
                                                }
                                                className="btn btn-primary"
                                                onClick={addCustomPins}
                                            >
                                                <div>新增</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {selectedMicrocontroller &&
                            selectedMicrocontroller.memo &&
                            selectedMicrocontroller.memo.length > 0 && (
                                <div className="mcu-memo text-warn mt-3 mb-4 d-flex align-items-top">
                                    <div className="mt-1 me-2 bg-warn text-white rounded-circle align-items-center text-center fw-bold flex-shrink-0">
                                        !
                                    </div>
                                    <div>{selectedMicrocontroller?.memo}</div>
                                </div>
                            )}
                        {!isCreateMode &&
                            selectedMicrocontroller &&
                            (selectedMicrocontroller.pins.length > 0 ||
                                (customPins && customPins.length > 0)) && (
                                <div>
                                    <DevicePin
                                        deviceId={id}
                                        microcontrollerId={
                                            selectedMicrocontroller.id
                                        }
                                        selectedPinsList={selectedPins}
                                        customPinsList={customPins}
                                        updateSelectedPins={(newPin) => {
                                            updateSelectPins(newPin);
                                        }}
                                        removeSelectedPins={(removePinName) => {
                                            setSelectedPins(
                                                selectedPins
                                                    ? selectedPins.filter(
                                                          (item) =>
                                                              item.pin !==
                                                              removePinName
                                                      )
                                                    : []
                                            );
                                            const validResult =
                                                ValidationHelpers.ValidateSelectedPins(
                                                    isCreateMode,
                                                    selectedPins
                                                        ? selectedPins.filter(
                                                              (item) =>
                                                                  item.pin !==
                                                                  removePinName
                                                          )
                                                        : []
                                                );
                                            setIsValidData((prev) => {
                                                return {
                                                    ...prev,
                                                    selectedPins: validResult,
                                                };
                                            });
                                        }}
                                        isSelectedPinsValid={
                                            isValidData.selectedPins
                                        }
                                    />
                                </div>
                            )}
                        <div className="mb-4 text-center">
                            <img
                                className="w-100 microcontroller-img"
                                src={microcontrollerImg}
                                alt=""
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-5">
                            <button
                                className="btn btn-secondary me-3"
                                onClick={back}
                            >
                                返回
                            </button>
                            <button
                                disabled={isCreating || isUpdating}
                                className="btn btn-primary"
                                onClick={sendApi}
                            >
                                {isCreateMode ? (
                                    <div>新增</div>
                                ) : (
                                    <div>儲存編輯</div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevicePinData;
