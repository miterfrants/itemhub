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
import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs';
import leftArrowIcon from '@/assets/images/left-arrow.svg';
import { useDispatch } from 'react-redux';
import { useGetAllDevicesApi } from '@/hooks/apis/devices.hook';

const Trigger = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const { id: idFromUrl } = useParams();
    const triggerId = idFromUrl ? parseInt(idFromUrl) : null;

    const { triggerOperators } = useAppSelector(selectUniversal);
    const { triggers } = useAppSelector(selectTriggers);
    const trigger =
        triggers?.filter((trigger) => trigger.id === triggerId)[0] || null;

    const isCreateMode = !idFromUrl;
    const isEditMode = location.pathname.includes('edit') && triggerId !== null;
    const isReadMode = !isCreateMode && !isEditMode && trigger !== null;

    const breadcrumbs = [
        {
            label: '觸發列表',
            pathName: '/dashboard/triggers',
        },
        {
            label: isCreateMode ? '新增' : '編輯',
            pathName: useLocation().pathname,
        },
    ];

    const [editedTriggerData, setEditedTriggerData] = useState({
        name: trigger?.name || '',
        sourceDeviceId: trigger?.sourceDeviceId || 0,
        sourcePin: trigger?.sourcePin || '',
        sourceThreshold: trigger?.sourceThreshold || '',
        destinationDeviceId: trigger?.destinationDeviceId || 0,
        destinationPin: trigger?.destinationPin || '',
        destinationDeviceTargetState:
            trigger?.destinationDeviceTargetState || 0,
        operator: trigger?.operator || 0,
    });

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
        id: editedTriggerData.destinationDeviceId,
    });

    const { isCreatingTrigger, createTriggerResponse, createTriggerApi } =
        useCreateTriggerApi({
            ...editedTriggerData,
            sourceThreshold: Number(editedTriggerData.sourceThreshold),
        });

    const sourceDeviecePinsOptions =
        editedTriggerData.sourceDeviceId === 0 ? [] : saurceDeviecePins;

    const destinationDeviecePinsOptions =
        editedTriggerData.destinationDeviceId === 0
            ? []
            : destinationDeviecePins;

    // TODO: 可改用 pagination api，用 name query 去讓 sever 就篩選好我們要的 options，不用在 client 端 filter
    const { allDevices, getAllDevicesApi } = useGetAllDevicesApi();

    const { getTriggerApi } = useGetTriggerApi(triggerId || 0);

    const { isUpdatingTrigger, updateTriggerResponse, updateTriggerApi } =
        useUpdateTriggerApi({
            trigerId: trigger?.id || 0,
            updatedData: {
                ...editedTriggerData,
                sourceThreshold: Number(editedTriggerData.sourceThreshold),
            },
        });

    useEffect(() => {
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
            sourceThreshold: trigger?.sourceThreshold || '',
            destinationDeviceId: trigger?.destinationDeviceId || 0,
            destinationPin: trigger?.destinationPin || '',
            destinationDeviceTargetState:
                trigger?.destinationDeviceTargetState || 0,
            operator: trigger?.operator || 0,
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
            navigate(`/dashboard/triggers/${createTriggerResponse.id}`);
        }
    }, [navigate, createTriggerResponse]);

    useEffect(() => {
        if (updateTriggerResponse?.status === RESPONSE_STATUS.OK) {
            dispatch(
                toasterActions.pushOne({
                    message: '編輯成功',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTriggerResponse]);

    return (
        <div className="trigger px-3 px-lg-0 mx-auto mt-4 mt-lg-4">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <h3
                className="title d-flex align-item-center mb-3 mb-lg-4"
                onClick={() => navigate('/dashboard/triggers')}
            >
                <img className="me-2 me-lg-3" src={leftArrowIcon} alt="Back" />
                {isCreateMode ? '新增觸發' : '編輯觸發'}
            </h3>
            <form className="card m-0">
                <div className="mb-3">
                    <label className="form-label" htmlFor="trigger-name">
                        觸發名稱
                    </label>
                    <input
                        className="form-control"
                        disabled={isReadMode}
                        type="text"
                        id="trigger-name"
                        placeholder="輸入名稱"
                        defaultValue={trigger?.name}
                        onChange={(e) => {
                            setEditedTriggerData((prev) => {
                                return {
                                    ...prev,
                                    name: e.target.value,
                                };
                            });
                        }}
                    />
                </div>

                <div className="d-flex mt-4 mb-3 fs-5">
                    事件條件 <hr className="bg-gray flex-grow-1 ms-3" />
                </div>
                <DeviceAndPinInputs
                    allDevices={allDevices}
                    initialDeviceName={trigger?.sourceDevice?.name || ''}
                    deviceNameLabel="來源裝置"
                    pinLabel="來源裝置 Pin"
                    pinValue={editedTriggerData.sourcePin}
                    pinOptions={sourceDeviecePinsOptions}
                    isDisabled={isReadMode}
                    updatePin={(newPin) =>
                        setEditedTriggerData((prev) => {
                            return {
                                ...prev,
                                sourcePin: newPin,
                            };
                        })
                    }
                    updateDeviceId={(newDeviceId) =>
                        setEditedTriggerData((prev) => {
                            return {
                                ...prev,
                                sourceDeviceId: newDeviceId,
                            };
                        })
                    }
                />
                <div className="w-100 d-flex flex-column flex-md-row">
                    <div className="form-group w-100 mb-3 pe-md-3">
                        <label className="mb-1">運算子</label>
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
                        <label className="mb-1">來源裝置門檻</label>
                        <input
                            className="form-control"
                            type="number"
                            disabled={isReadMode}
                            placeholder="設定裝置條件"
                            value={editedTriggerData.sourceThreshold}
                            onChange={(e) => {
                                setEditedTriggerData((prev) => {
                                    return {
                                        ...prev,
                                        sourceThreshold: e.target.value,
                                    };
                                });
                            }}
                        />
                    </div>
                </div>

                <div className="d-flex mt-4 mb-3 fs-5">
                    目標設定 <hr className="bg-gray flex-grow-1 ms-3" />
                </div>
                <DeviceAndPinInputs
                    allDevices={allDevices}
                    initialDeviceName={trigger?.destinationDevice?.name || ''}
                    deviceNameLabel="目標裝置"
                    pinLabel="目標裝置 Pin"
                    pinValue={editedTriggerData.destinationPin}
                    pinOptions={destinationDeviecePinsOptions}
                    isDisabled={isReadMode}
                    updatePin={(newPin) =>
                        setEditedTriggerData((prev) => {
                            return {
                                ...prev,
                                destinationPin: newPin,
                            };
                        })
                    }
                    updateDeviceId={(newDeviceId) =>
                        setEditedTriggerData((prev) => {
                            return {
                                ...prev,
                                destinationDeviceId: newDeviceId,
                            };
                        })
                    }
                />
                <div className="row">
                    <label className="col-6">
                        <div className="mb-1">目標狀態</div>
                        <select
                            className="form-select"
                            disabled={isReadMode}
                            value={
                                editedTriggerData.destinationDeviceTargetState
                            }
                            onChange={(e) => {
                                setEditedTriggerData((prev) => {
                                    return {
                                        ...prev,
                                        destinationDeviceTargetState: parseInt(
                                            e.target.value
                                        ),
                                    };
                                });
                            }}
                        >
                            <option value="1">開</option>
                            <option value="0">關</option>
                        </select>
                    </label>
                </div>
                <div className="d-flex justify-content-end">
                    <button
                        type="button"
                        className="btn btn-secondary mt-3 me-3"
                        onClick={() => {
                            isCreateMode || isReadMode
                                ? navigate(`/dashboard/triggers`)
                                : navigate(`/dashboard/triggers/${idFromUrl}`);
                        }}
                        disabled={isCreatingTrigger}
                    >
                        返回
                    </button>
                    {isReadMode ? (
                        <Link
                            type="submit"
                            className="btn btn-primary mt-3"
                            to={`/dashboard/triggers/edit/${idFromUrl}`}
                        >
                            編輯觸發
                        </Link>
                    ) : isCreateMode ? (
                        <button
                            type="submit"
                            className="btn btn-primary mt-3"
                            onClick={createTriggerApi}
                            disabled={isCreatingTrigger}
                        >
                            {isCreatingTrigger ? '新增中' : '確定新增'}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn btn-primary mt-3"
                            onClick={updateTriggerApi}
                            disabled={isUpdatingTrigger}
                        >
                            {isUpdatingTrigger ? '儲存中' : '儲存編輯'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Trigger;
