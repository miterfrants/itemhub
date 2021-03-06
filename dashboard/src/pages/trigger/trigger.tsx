import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux.hook';
import { Link } from 'react-router-dom';
import { RESPONSE_STATUS } from '@/constants/api';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { selectTriggers } from '@/redux/reducers/triggers.reducer';
import { useGetDevicePinsApi } from '@/hooks/apis/device.pin.hook';
import {
    useCreateTriggerApi,
    useGetTriggerApi,
    useUpdateTriggerApi,
} from '@/hooks/apis/triggers.hook';
import DeviceAndPinInputs from '@/components/inputs/device-and-pin-input/device-and-pin-input';
import { useDispatch } from 'react-redux';
import { useGetAllDevicesApi } from '@/hooks/apis/devices.hook';
import PageTitle from '@/components/page-title/page-title';
import { TRIGGER_TYPE } from '@/constants/trigger-type';
import { TriggerNotificationPeriod, TriggerType } from '@/types/universal.type';
import { EditedTrigger } from '@/types/triggers.type';

const Trigger = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const { id: idFromUrl } = useParams();
    const triggerId = idFromUrl ? parseInt(idFromUrl) : null;

    const { triggerOperators, triggerTypes, triggerNotificationPeriod } =
        useAppSelector(selectUniversal);
    const { triggers } = useAppSelector(selectTriggers);

    const trigger =
        triggers?.filter((trigger) => trigger.id === triggerId)[0] || null;
    const changeDeviceStateTriggerType = triggerTypes.find(
        (item) => item.key === TRIGGER_TYPE.CHANGE_DEVICE_STATE
    )?.value;

    const notificationTriggerType = triggerTypes.find(
        (item) => item.key === TRIGGER_TYPE.NOTIFICATION
    )?.value;

    const isCreateMode = !idFromUrl;
    const isEditMode = location.pathname.includes('edit') && triggerId !== null;
    const isReadMode = !isCreateMode && !isEditMode && trigger !== null;

    const breadcrumbs = [
        {
            label: '????????????',
            pathName: `/dashboard/triggers${location.search}`,
        },
        {
            label: isCreateMode ? '??????' : '??????',
            pathName: `${location.pathname}${location.search}`,
        },
    ];

    const [editedTriggerData, setEditedTriggerData] = useState({
        name: '',
        sourceDeviceId: 0,
        sourcePin: '',
        sourceThreshold: 0,
        destinationDeviceId: null,
        destinationPin: null,
        destinationDeviceTargetState: 1,
        operator: 0,
        type: 0,
        email: null,
        phone: null,
        notificationPeriod: null,
    } as EditedTrigger);

    const [isValidEditedTrigger, setIsValidEditedTrigger] = useState({
        name: true,
        sourceDeviceId: true,
        sourcePin: true,
        sourceThreshold: true,
        destinationDeviceId: true,
        destinationPin: true,
        email: true,
        phone: true,
        validedNotification: true,
        invalidEmail: true,
        invalidPhone: true,
    });

    const validateEditedTrigger = (fetchApi: () => Promise<void>) => {
        let isValidateSuccess = true;
        if (!editedTriggerData.name) {
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    name: false,
                };
            });
            isValidateSuccess = false;
        }
        if (!editedTriggerData.sourceDeviceId) {
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    sourceDeviceId: false,
                };
            });
            isValidateSuccess = false;
        }
        if (!editedTriggerData.sourcePin) {
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    sourcePin: false,
                };
            });
            isValidateSuccess = false;
        }
        if (isNaN(editedTriggerData.sourceThreshold)) {
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    sourceThreshold: false,
                };
            });
            isValidateSuccess = false;
        }
        if (
            !editedTriggerData.destinationDeviceId &&
            editedTriggerData.type === changeDeviceStateTriggerType
        ) {
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    destinationDeviceId: false,
                };
            });
            isValidateSuccess = false;
        }
        if (
            !editedTriggerData.destinationPin &&
            editedTriggerData.type === changeDeviceStateTriggerType
        ) {
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    destinationPin: false,
                };
            });
            isValidateSuccess = false;
        }

        if (
            editedTriggerData.type === notificationTriggerType &&
            !editedTriggerData.email &&
            !editedTriggerData.phone
        ) {
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    validedNotification: false,
                };
            });
            isValidateSuccess = false;
        }

        if (
            editedTriggerData.email &&
            !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
                editedTriggerData.email
            )
        ) {
            // refactor: ?????? validator
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    invalidEmail: false,
                };
            });
            isValidateSuccess = false;
        }

        if (
            editedTriggerData.phone &&
            !/^09[0-9]{8}$/.test(editedTriggerData.phone)
        ) {
            // refactor: ?????? validator
            setIsValidEditedTrigger((prev) => {
                return {
                    ...prev,
                    invalidPhone: false,
                };
            });
            isValidateSuccess = false;
        }

        if (isValidateSuccess) {
            fetchApi();
        }
    };

    const {
        devicePins: saurceDeviecePins,
        getDevicePinsApi: getSourceDevicePinsApi,
    } = useGetDevicePinsApi({
        id: editedTriggerData.sourceDeviceId,
    });

    const {
        devicePins: destinationDeviecePins,
        getDevicePinsApi: getDestinationDevicePinsApi,
    } = useGetDevicePinsApi({
        id: editedTriggerData.destinationDeviceId || 0,
    });

    const { isCreatingTrigger, createTriggerResponse, createTriggerApi } =
        useCreateTriggerApi({
            ...editedTriggerData,
            sourceThreshold: editedTriggerData.sourceThreshold,
        });

    const sourceDeviecePinsOptions =
        editedTriggerData.sourceDeviceId === 0 ? [] : saurceDeviecePins;

    const destinationDeviecePinsOptions =
        editedTriggerData.destinationDeviceId === 0
            ? []
            : destinationDeviecePins;

    // TODO: ????????? pagination api?????? name query ?????? sever ???????????????????????? options???????????? client ??? filter
    const { allDevices, getAllDevicesApi } = useGetAllDevicesApi();

    const { getTriggerApi } = useGetTriggerApi(triggerId || 0);

    const { isUpdatingTrigger, updateTriggerResponse, updateTriggerApi } =
        useUpdateTriggerApi({
            trigerId: trigger?.id || 0,
            updatedData: {
                ...editedTriggerData,
                sourceThreshold: editedTriggerData.sourceThreshold,
            },
        });

    const back = () => {
        navigate(`/dashboard/triggers${location.search}`);
    };

    useEffect(() => {
        if (isCreateMode) {
            document.title = 'ItemHub - ????????????';
        } else {
            document.title = 'ItemHub - ????????????';
        }

        getAllDevicesApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (triggerId) {
            getTriggerApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerId]);

    useEffect(() => {
        if (!trigger) {
            return;
        }
        setEditedTriggerData({
            name: trigger?.name || '',
            sourceDeviceId: trigger?.sourceDeviceId || 0,
            sourcePin: trigger?.sourcePin || '',
            sourceThreshold: trigger?.sourceThreshold || 0,
            destinationDeviceId: trigger?.destinationDeviceId,
            destinationPin: trigger?.destinationPin,
            destinationDeviceTargetState: trigger?.destinationDeviceTargetState,
            operator: trigger?.operator || 0,
            type: trigger?.type || 0,
            email: trigger?.email || '',
            phone: trigger?.phone || '',
            notificationPeriod: trigger?.notificationPeriod,
        });
    }, [trigger]);

    useEffect(() => {
        if (editedTriggerData.sourceDeviceId) {
            getSourceDevicePinsApi();
        }
    }, [editedTriggerData.sourceDeviceId, getSourceDevicePinsApi]);

    useEffect(() => {
        if (editedTriggerData.destinationDeviceId) {
            getDestinationDevicePinsApi();
        }
    }, [editedTriggerData.destinationDeviceId, getDestinationDevicePinsApi]);

    useEffect(() => {
        if (createTriggerResponse && createTriggerResponse.id) {
            navigate(`/dashboard/triggers${location.search}`);
            dispatch(
                toasterActions.pushOne({
                    message: '????????????',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
    }, [navigate, createTriggerResponse]);

    useEffect(() => {
        if (updateTriggerResponse?.status === RESPONSE_STATUS.OK) {
            dispatch(
                toasterActions.pushOne({
                    message: '????????????',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTriggerResponse]);

    return (
        <div className="form-data trigger mx-auto">
            <PageTitle
                breadcrumbs={breadcrumbs}
                titleClickCallback={back}
                titleBackIconVisible
                title={isCreateMode ? '????????????' : '????????????'}
            />
            <div className="card">
                <div className="mb-4">
                    <label className="form-label" htmlFor="trigger-name">
                        ????????????
                    </label>
                    <input
                        className={`form-control ${
                            !isValidEditedTrigger.name && 'border-danger'
                        }`}
                        disabled={isReadMode}
                        type="text"
                        id="trigger-name"
                        placeholder="????????????"
                        defaultValue={trigger?.name}
                        onChange={(e) => {
                            const value = e.target.value;
                            setEditedTriggerData((prev) => {
                                return {
                                    ...prev,
                                    name: value,
                                };
                            });
                            setIsValidEditedTrigger((prev) => {
                                return {
                                    ...prev,
                                    name: value ? true : false,
                                };
                            });
                        }}
                    />
                    {!isValidEditedTrigger.name && (
                        <div className="text-danger mt-1 fs-5">
                            ?????????????????????
                        </div>
                    )}
                </div>
                <div className="d-flex mt-5 mb-3 fs-5">
                    ???????????? <hr className="bg-gray flex-grow-1 ms-3" />
                </div>
                <DeviceAndPinInputs
                    allDevices={allDevices}
                    isDeviceNameError={!isValidEditedTrigger.sourceDeviceId}
                    initialDeviceName={trigger?.sourceDevice?.name}
                    deviceNameLabel="????????????"
                    isPinError={!isValidEditedTrigger.sourcePin}
                    pinLabel="???????????? Pin"
                    pinValue={editedTriggerData.sourcePin}
                    pinOptions={sourceDeviecePinsOptions}
                    isDisabled={isReadMode}
                    updatePin={(newPin) => {
                        setEditedTriggerData((prev) => {
                            return {
                                ...prev,
                                sourcePin: newPin,
                            };
                        });
                        setIsValidEditedTrigger((prev) => {
                            return {
                                ...prev,
                                sourcePin: newPin ? true : false,
                            };
                        });
                    }}
                    updateDeviceId={(newDeviceId) => {
                        setEditedTriggerData((prev) => {
                            return {
                                ...prev,
                                sourceDeviceId: newDeviceId,
                            };
                        });
                        setIsValidEditedTrigger((prev) => {
                            return {
                                ...prev,
                                sourceDeviceId: newDeviceId ? true : false,
                            };
                        });
                    }}
                />
                <div className="w-100 d-flex flex-column flex-md-row">
                    <div className="form-group w-100 mb-3 pe-md-3">
                        <label className="mb-1">?????????</label>
                        <select
                            className="form-select"
                            disabled={isReadMode}
                            value={editedTriggerData.operator}
                            onChange={(e) => {
                                setEditedTriggerData((prev) => {
                                    return {
                                        ...prev,
                                        operator: parseInt(e.target.value),
                                    };
                                });
                            }}
                        >
                            {triggerOperators.map(
                                ({ key, value, label, symbol }) => {
                                    return (
                                        <option key={key} value={value}>
                                            {symbol || label}
                                        </option>
                                    );
                                }
                            )}
                        </select>
                    </div>
                    <div className="form-group w-100 mb-3 ps-md-3">
                        <label className="mb-1">??????????????????</label>
                        <input
                            className={`form-control ${
                                !isValidEditedTrigger.sourceThreshold &&
                                'border-danger'
                            }`}
                            type="number"
                            disabled={isReadMode}
                            placeholder="??????????????????"
                            value={editedTriggerData.sourceThreshold}
                            onChange={(e) => {
                                const sourceThreshold = e.target.valueAsNumber;
                                setEditedTriggerData((prev) => {
                                    return {
                                        ...prev,
                                        sourceThreshold,
                                    };
                                });
                                setIsValidEditedTrigger((prev) => {
                                    return {
                                        ...prev,
                                        sourceThreshold: !isNaN(sourceThreshold)
                                            ? true
                                            : false,
                                    };
                                });
                            }}
                        />
                        {!isValidEditedTrigger.sourceThreshold && (
                            <div className="text-danger mt-1 fs-5">
                                ?????????????????????
                            </div>
                        )}
                    </div>
                </div>
                <div className="d-flex mt-5 mb-3 fs-5">
                    ???????????? <hr className="bg-gray flex-grow-1 ms-3" />
                </div>
                <select
                    className="form-select"
                    onChange={(e) => {
                        const triggerType = Number(e.target.value);
                        setEditedTriggerData({
                            ...editedTriggerData,
                            destinationDeviceId: null,
                            destinationPin: null,
                            destinationDeviceTargetState:
                                triggerType === notificationTriggerType
                                    ? null
                                    : 1,
                            type: triggerType,
                            email:
                                triggerType === changeDeviceStateTriggerType
                                    ? null
                                    : '',
                            phone:
                                triggerType === changeDeviceStateTriggerType
                                    ? null
                                    : '',
                        });
                    }}
                    value={editedTriggerData.type}
                >
                    {triggerTypes.map((type: TriggerType) => (
                        <option key={type.key} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
                {!isValidEditedTrigger.validedNotification && (
                    <div className="text-danger mt-1 fs-5">
                        ????????????????????? Email ??? ??????
                    </div>
                )}
                {editedTriggerData.type === changeDeviceStateTriggerType ? (
                    <div className="mt-3">
                        <DeviceAndPinInputs
                            allDevices={allDevices}
                            isDeviceNameError={
                                !isValidEditedTrigger.destinationDeviceId
                            }
                            initialDeviceName={trigger?.destinationDevice?.name}
                            deviceNameLabel="????????????"
                            isPinError={!isValidEditedTrigger.destinationPin}
                            pinLabel="???????????? Pin"
                            pinValue={editedTriggerData.destinationPin || ''}
                            pinOptions={destinationDeviecePinsOptions}
                            isDisabled={isReadMode}
                            updatePin={(newPin) => {
                                setEditedTriggerData((prev) => {
                                    return {
                                        ...prev,
                                        destinationPin: newPin,
                                    };
                                });
                                setIsValidEditedTrigger((prev) => {
                                    return {
                                        ...prev,
                                        destinationPin: newPin ? true : false,
                                    };
                                });
                            }}
                            updateDeviceId={(newDeviceId) => {
                                setEditedTriggerData((prev) => {
                                    return {
                                        ...prev,
                                        destinationDeviceId: newDeviceId,
                                    };
                                });
                                setIsValidEditedTrigger((prev) => {
                                    return {
                                        ...prev,
                                        destinationDeviceId: newDeviceId
                                            ? true
                                            : false,
                                    };
                                });
                            }}
                        />
                        <div className="row">
                            <label className="col-6">
                                <div className="mb-1">????????????</div>
                                <select
                                    className="form-select"
                                    disabled={isReadMode}
                                    value={
                                        editedTriggerData.destinationDeviceTargetState ||
                                        1
                                    }
                                    onChange={(e) => {
                                        setEditedTriggerData((prev) => {
                                            return {
                                                ...prev,
                                                destinationDeviceTargetState:
                                                    parseInt(e.target.value),
                                            };
                                        });
                                    }}
                                >
                                    <option value="1">???</option>
                                    <option value="0">???</option>
                                </select>
                            </label>
                        </div>
                    </div>
                ) : (
                    <div className="mt-3">
                        <div className="row">
                            <label className="col-12">
                                <div className="mb-1">Email</div>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={editedTriggerData.email || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEditedTriggerData((prev) => {
                                            return {
                                                ...prev,
                                                email: value,
                                            };
                                        });

                                        setIsValidEditedTrigger((prev) => {
                                            return {
                                                ...prev,
                                                validedNotification: value
                                                    ? true
                                                    : false,
                                                email: value ? true : false,
                                            };
                                        });
                                    }}
                                />
                                {isValidEditedTrigger.email &&
                                    !isValidEditedTrigger.invalidEmail && (
                                        <div className="text-danger mt-1 fs-5">
                                            ????????? Email ??????
                                        </div>
                                    )}
                            </label>
                        </div>
                        <div className="row mt-3">
                            <label className="col-12">
                                <div className="mb-1">??????</div>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editedTriggerData.phone || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEditedTriggerData((prev) => {
                                            return {
                                                ...prev,
                                                phone: value,
                                            };
                                        });

                                        setIsValidEditedTrigger((prev) => {
                                            return {
                                                ...prev,
                                                validedNotification: value
                                                    ? true
                                                    : false,
                                                phone: value ? true : false,
                                            };
                                        });
                                    }}
                                />
                                {!isValidEditedTrigger.invalidPhone && (
                                    <div className="text-danger mt-1 fs-5">
                                        ?????????????????????
                                    </div>
                                )}
                            </label>
                        </div>
                        <div className="row mt-3">
                            <label className="col-12">
                                <div className="mb-1">????????????</div>
                                <select
                                    className="form-select"
                                    onChange={(e) => {
                                        const period = Number(e.target.value);
                                        setEditedTriggerData({
                                            ...editedTriggerData,
                                            notificationPeriod: period,
                                        });
                                    }}
                                    value={
                                        editedTriggerData.notificationPeriod ===
                                        null
                                            ? ''
                                            : editedTriggerData.notificationPeriod.toString()
                                    }
                                >
                                    {triggerNotificationPeriod.map(
                                        (period: TriggerNotificationPeriod) => (
                                            <option
                                                key={period.key}
                                                value={period.value}
                                            >
                                                {period.label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>
                        </div>
                    </div>
                )}

                <div className="d-flex justify-content-end">
                    <button
                        type="button"
                        className="btn btn-secondary mt-3 me-3"
                        onClick={back}
                        disabled={isCreatingTrigger}
                    >
                        ??????
                    </button>
                    {isReadMode ? (
                        <Link
                            type="submit"
                            className="btn btn-primary mt-3"
                            to={`/dashboard/triggers/edit/${idFromUrl}`}
                        >
                            ????????????
                        </Link>
                    ) : isCreateMode ? (
                        <button
                            type="button"
                            className="btn btn-primary mt-3"
                            onClick={() =>
                                validateEditedTrigger(createTriggerApi)
                            }
                            disabled={isCreatingTrigger}
                        >
                            {isCreatingTrigger ? '?????????' : '????????????'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-primary mt-3"
                            onClick={() =>
                                validateEditedTrigger(updateTriggerApi)
                            }
                            disabled={isUpdatingTrigger}
                        >
                            {isUpdatingTrigger ? '?????????' : '????????????'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Trigger;
