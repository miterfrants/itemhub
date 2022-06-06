import moment from 'moment';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    useDeleteDevicesApi,
    useGetDeviceApi,
    useBundleFirmwareApi,
} from '@/hooks/apis/devices.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import Pins from '@/components/pins/pins';
import PageTitle from '@/components/page-title/page-title';
import OnlineStatusTag from '@/components/online-status-tag/online-status-tag';
import { RESPONSE_STATUS } from '@/constants/api';
import { useDispatch } from 'react-redux';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import trashIcon from '@/assets/images/trash.svg';
import cloudIcon from '@/assets/images/cloud.svg';
import compassIcon from '@/assets/images/compass.svg';

const Device = () => {
    const { id: idFromUrl } = useParams();
    const id: number | null = idFromUrl ? Number(idFromUrl) : null;

    const devices = useAppSelector(selectDevices).devices;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const device =
        (devices || []).filter((device) => device.id === Number(id))[0] || null;

    const [deviceName, setDeviceName] = useState<string>('');
    const [microcontrollerName, setMicrocontrollerName] = useState<string>('');

    const { isLoading: isGetting, fetchApi: getDeviceApi } = useGetDeviceApi(
        Number(id)
    );

    const [downloadIcon, setDownloaIcon] = useState<string>(cloudIcon);
    const [isFirmwarePrepare, setIsFirmwarePrepare] = useState(false);
    const [shouldBeBundledId, setShouldBeBundledId] = useState(0);
    const { microcontrollers } = useAppSelector(selectUniversal);

    const { fetchApi: deleteApi, data: deleteDeviceResponse } =
        useDeleteDevicesApi([Number(id)]);

    const backToList = () => {
        navigate('/dashboard/devices');
    };

    const jumpToEditPage = () => {
        navigate(`/dashboard/devices/edit/${Number(id)}`);
    };

    const bundleFirmware = () => {
        if (isFirmwarePrepare) {
            return;
        }
        setDownloaIcon(compassIcon);
        setShouldBeBundledId(Number(id));
    };

    const {
        fetchApi: bundleFirmwareApi,
        error: errorOfBundle,
        httpStatus: bundleFirmwareHttpStatus,
        data: responseOfBundle,
    } = useBundleFirmwareApi({ id: shouldBeBundledId });

    useEffect(() => {
        if (device === null) {
            getDeviceApi();
        }
    }, []);

    useEffect(() => {
        setDeviceName(device ? device.name : '');
    }, [device]);

    useEffect(() => {
        if (deleteDeviceResponse?.status === RESPONSE_STATUS.OK) {
            dispatch(
                toasterActions.pushOne({
                    message: `已經成功刪除 ${deviceName} `,
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
            navigate('/dashboard/devices', { replace: true });
        }
    }, [deleteDeviceResponse]);

    useEffect(() => {
        if (shouldBeBundledId) {
            setIsFirmwarePrepare(true);
            bundleFirmwareApi();
        }
    }, [shouldBeBundledId]);

    useEffect(() => {
        if (microcontrollers && device) {
            microcontrollers.filter((item) => {
                if (item.id === device.microcontroller) {
                    setMicrocontrollerName(
                        item.key.replaceAll('_', ' ').toLowerCase()
                    );
                }
            });
        }
    }, [microcontrollers, device]);

    useEffect(() => {
        setIsFirmwarePrepare(false);
    }, [responseOfBundle, errorOfBundle]);

    const deleteDevice = () => {
        dispatch(
            dialogActions.open({
                message: `刪除後將無法復原, 請輸入 DELETE 完成刪除 ${deviceName} `,
                title: '確認刪除裝置 ?',
                type: DialogTypeEnum.PROMPT,
                checkedMessage: 'DELETE',
                callback: deleteApi,
                promptInvalidMessage: '輸入錯誤',
            })
        );
    };

    const bundleDevice = () => {
        dispatch(
            dialogActions.open({
                message: `下載後舊有程式碼將無法使用，請確認是否下載？`,
                title: '下載程式碼',
                type: DialogTypeEnum.CONFIRM,
                callback: bundleFirmware,
            })
        );
    };

    const breadcrumbs = [
        {
            label: '裝置列表',
            pathName: '/dashboard/devices',
        },
        {
            label: '裝置詳細頁',
            pathName: useLocation().pathname,
        },
    ];

    return (
        <div className="device" data-testid="device">
            <PageTitle
                title="裝置詳細內容"
                breadcrumbs={breadcrumbs}
                titleClickCallback={backToList}
                titleBackIconVisible
                primaryButtonVisible
                primaryButtonWording="編輯"
                primaryButtonCallback={jumpToEditPage}
                secondaryButtonIcon={downloadIcon}
                secondaryButtonVisible
                secondaryButtonWording="下載程式碼"
                secondaryButtonCallback={bundleDevice}
                thirdlyButtonIcon={trashIcon}
                thirdlyButtonVisible
                thirdlyButtonWording="刪除"
                thirdlyButtonCallback={deleteDevice}
            />
            {isGetting || device === null ? (
                <div>Loading</div>
            ) : (
                <div className="card">
                    <div className="row m-0">
                        <div className="col-12 col-lg-6 d-flex p-0 item">
                            <div className="d-flex fs-5 text-black text-opacity-45 bg-black bg-opacity-5 item-title flex-shrink-0 py-2 px-25">
                                裝置名稱
                            </div>
                            <div className="text-break text-black text-opacity-65 py-2 px-25">
                                {device.name}
                            </div>
                        </div>
                        <div className="col-12 col-lg-6 d-flex p-0 item">
                            <div className="d-flex fs-5 bg-black bg-opacity-5 text-black text-opacity-45 item-title py-2 px-25">
                                裝置類型
                            </div>
                            <div className="text-break text-black text-opacity-65 py-2 px-25">
                                {microcontrollerName}
                            </div>
                        </div>
                        <div className="col-12 col-lg-6 d-flex p-0 item">
                            <div className="d-flex fs-5 text-black text-opacity-45 bg-black bg-opacity-5 item-title py-2 px-25">
                                Device Id
                            </div>
                            <div className="text-break text-black text-opacity-65 py-2 px-25">
                                {device.deviceId}
                            </div>
                        </div>
                        <div className="col-12 col-lg-6 d-flex p-0 item">
                            <div className="d-flex fs-5 bg-black bg-opacity-5 text-black text-opacity-45 item-title py-2 px-25">
                                狀態
                            </div>
                            <div className="py-2 px-25">
                                <OnlineStatusTag isOnline={device.online} />
                            </div>
                        </div>
                        <div className="col-12 col-lg-6 d-flex p-0 item">
                            <div className="d-flex fs-5 bg-black bg-opacity-5 text-black text-opacity-45 item-title py-2 px-25">
                                建立時間
                            </div>
                            <div className="text-break text-black text-opacity-65 py-2 px-25">
                                {` ${moment(device.createdAt).format(
                                    'YYYY-MM-DD HH:mm'
                                )}`}
                            </div>
                        </div>
                        <div className="col-12 col-lg-6 d-flex p-0 item">
                            <div className="d-flex fs-5 bg-black bg-opacity-5 text-black text-opacity-45 item-title py-2 px-25">
                                Pins Data
                            </div>
                            <div className="text-break text-black text-opacity-65 py-2 px-25">
                                <Pins
                                    deviceId={Number(id)}
                                    isEditMode={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Device;
