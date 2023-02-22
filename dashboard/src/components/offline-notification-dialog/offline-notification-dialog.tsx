import { useAppSelector } from '@/hooks/redux.hook';
import {
    selectOfflineNotificationDialog,
    offlineNotificationDialogActions,
} from '@/redux/reducers/offline-notification-dialog.reducer';
import { DeviceItem } from '@/types/devices.type';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import { useUpdateDeviceApi } from '@/hooks/apis/devices.hook';

const OfflineNotificationDialog = () => {
    const dialog = useAppSelector(selectOfflineNotificationDialog);
    const devices = useAppSelector(selectDevices).devices;
    const { isOpen, deviceId } = dialog;
    const dispatch = useDispatch();
    const promptInputRef = useRef<HTMLInputElement>(null);
    const [isValidedForm, setIsValidedForm] = useState<boolean>(true);
    const [device, setDevice] = useState<DeviceItem | null>(null);
    const [shouldBeUpdateDevice, setShouldBeUpdateDevice] =
        useState<DeviceItem | null>(null);
    const {
        isLoading: isUpdating,
        updateDeviceApi,
        data: updateDeviceResponse,
    } = useUpdateDeviceApi({
        id: Number(deviceId),
        editedData: {
            ...shouldBeUpdateDevice,
        },
    });

    useEffect(() => {
        if (!deviceId) {
            return;
        }
        const currentDevice = (devices || []).find(
            (item) => item.id === deviceId
        );
        if (!currentDevice) {
            return;
        }
        setDevice(currentDevice);
    }, [deviceId, devices]);

    useEffect(() => {
        if (!shouldBeUpdateDevice) {
            return;
        }
        updateDeviceApi();
    }, [shouldBeUpdateDevice]);

    useEffect(() => {
        if (updateDeviceResponse?.status === 'OK') {
            close();
        }
    }, [updateDeviceResponse]);

    const close = () => {
        if (promptInputRef.current) {
            promptInputRef.current.value = '';
        }
        dispatch(offlineNotificationDialogActions.close());
    };

    const valid = (event: any) => {
        const elInput = event.nativeEvent.target;
        const inputs = elInput.value.split(',');
        if (inputs.length > 5) {
            setIsValidedForm(false);
            return;
        }
        let isValided = true;
        inputs.forEach((item: string) => {
            if (!isEmail(item) && !isPhone(item)) {
                isValided = false;
            }
        });
        setIsValidedForm(isValided);
    };

    const cancel = () => {
        if (!device) {
            return;
        }
        setShouldBeUpdateDevice({
            ...device,
            isOfflineNotification: false,
            offlineNotificationTarget: '',
        });
    };

    const submit = () => {
        if (!device) {
            return;
        }
        setShouldBeUpdateDevice({ ...device, isOfflineNotification: true });
    };

    const isEmail = (email: string) => {
        return email
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const isPhone = (phone: string) => {
        return phone.toLowerCase().match(/^09[0-9]{8}$/);
    };

    return (
        <div
            className={`monitor-config-dialog dialog position-fixed top-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 ${
                isOpen ? '' : 'd-none'
            }`}
        >
            <div className="text-black bg-white card">
                <h3 className="mb-0">斷線通知</h3>
                <hr />
                <label>
                    通知對象:
                    <input
                        type="text"
                        className="form-control"
                        placeholder="e.g: 0912345678,xxx@gmail.com"
                        onChange={(event: any) => {
                            if (!device) {
                                return;
                            }
                            setDevice({
                                ...device,
                                offlineNotificationTarget: event.target.value,
                            });
                            valid(event);
                        }}
                        onKeyUp={(event: any) => {
                            if (!device) {
                                return;
                            }
                            setDevice({
                                ...device,
                                offlineNotificationTarget: event.target.value,
                            });
                            valid(event);
                        }}
                        value={device?.offlineNotificationTarget}
                    />
                </label>
                <div className={`text-danger ${isValidedForm ? 'd-none' : ''}`}>
                    輸入格式錯誤 e.g: 0912345678,xxxx@gmail.com
                    並且不能超過五個通知對象
                </div>
                <div className="row">
                    <div className="col-12 px-0 d-flex justify-content-center">
                        <button
                            className="btn btn-lg rounded-pill mt-3 py-3 border-1 border-grey-300 mx-0"
                            onClick={() => {
                                submit();
                            }}
                            disabled={!isValidedForm || isUpdating}
                        >
                            新增
                        </button>

                        <button
                            className="btn btn-lg rounded-pill mt-3 py-3 border-1 border-grey-300 mx-0 ms-3"
                            onClick={() => {
                                cancel();
                            }}
                            disabled={isUpdating}
                        >
                            取消通知
                        </button>
                    </div>
                </div>

                <div
                    onClick={() => {
                        close();
                    }}
                    className="position-absolute top-0 btn-close end-0 me-3 mt-2"
                    role="button"
                />
            </div>
        </div>
    );
};

export default OfflineNotificationDialog;
