import { useRef, useEffect, useState } from 'react';
import moment from 'moment';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@/hooks/query.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import {
    useBundleFirmwareApi,
    useGetDevicesApi,
    useGetLastUploadedImageThumbnailApi,
} from '@/hooks/apis/devices.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import Pins from '@/components/pins/pins';
import PageTitle from '@/components/page-title/page-title';
import pencilIcon from '@/assets/images/pencil.svg';
import cloudIcon from '@/assets/images/cloud.svg';
import trashIcon from '@/assets/images/trash.svg';
import cameraIcon from '@/assets/images/camera.svg';
import Pagination from '@/components/pagination/pagination';
import SearchInput from '@/components/inputs/search-input/search-input';
import EmptyDataToCreateItem from '@/components/empty-data-to-create-item/empty-data-to-create-item';
import { useDeleteDevicesApi } from '@/hooks/apis/devices.hook';
import { RESPONSE_STATUS } from '@/constants/api';
import compassIcon from '@/assets/images/compass.svg';
import stopIcon from '@/assets/images/stop.svg';
import displayIcon from '@/assets/images/display.svg';
import warnIcon from '@/assets/images/warning.svg';
import colorWarnIcon from '@/assets/images/color-warning.svg';
import { useDispatch } from 'react-redux';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';
import ReactTooltip from 'react-tooltip';
import OnlineStatusTag from '@/components/online-status-tag/online-status-tag';
import Spinner from '@/components/spinner/spinner';
import { monitorConfigDialogActions } from '@/redux/reducers/monitor-config-dialog.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { DeviceItem } from '@/types/devices.type';
import { offlineNotificationDialogActions } from '@/redux/reducers/offline-notification-dialog.reducer';
import PseudoDeviceLastActivity from '@/components/pseudo-device-last-activity/pseudo-device-last-activity';
import { realtimeDeviceImageDialogActions } from '@/redux/reducers/realtime-device-image-dialog.reducer';

const Devices = () => {
    const query = useQuery();
    const limit = Number(query.get('limit') || 10);
    const [page, setPage] = useState(1);
    const [deviceName, setDeviceName] = useState(query.get('deviceName') || '');
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState(0);
    const [shouldBeBundledId, setShouldBeBundledId] = useState(0);
    const [selectedDeviceId, setSelectedDeviceId] = useState(0);

    const [refreshFlag, setRefreshFlag] = useState(false);
    const [isFirmwarePrepare, setIsFirmwarePrepare] = useState(false);
    const devicesState = useAppSelector(selectDevices);
    const { protocols } = useAppSelector(selectUniversal);
    const dispatch = useDispatch();
    const { search } = useLocation();
    const [
        lastDeviceImageThumbnailPosition,
        setRealtimmeDeviceImageThumbnailPosition,
    ] = useState<any>({});
    const hasDevicesRef = useRef(false);
    const devices = devicesState.devices;
    const rowNum = devicesState.rowNum;
    const howToUseLink = `${import.meta.env.VITE_WEBSITE_URL}/how/start/`;
    const isFilter = !query.keys().next().done;

    const [
        lastDeviceImageThumbnailContainerShow,
        setRealtimeDeviceImageThumbnailContainerShow,
    ] = useState(false);
    const [lastDeviceImageThumbnail, setRealtimeDeviceImageThumbnail] =
        useState<null | string>('');
    const lastDeviceImageThumbnailContainerRef = useRef<null | HTMLDivElement>(
        null
    );
    const lastDeviceImageIconRef = useRef<null | HTMLDivElement>(null);
    const recursiveGetRealtimeDeviceImageTimer = useRef<null | NodeJS.Timeout>(
        null
    );
    const [
        recursiveGetRealtimeDeviceImageStartFlag,
        setRecursiveGetUploadedImageStartFlag,
    ] = useState(false);

    const navigate = useNavigate();
    const { isGetingDevices, getDevicesApi } = useGetDevicesApi({
        page: Number(query.get('page') || 1),
        limit: Number(query.get('limit') || 10),
        name: deviceName,
    });

    const {
        fetchApi: getLastDeviceImageThumbnail,
        data: lastDeviceImageThumbnailBlob,
        error: lastDeviceImageThumbnailError,
    } = useGetLastUploadedImageThumbnailApi(selectedDeviceId);

    const { fetchApi: deleteMultipleApi, data: responseOfDelete } =
        useDeleteDevicesApi([shouldBeDeleteId]);

    const {
        fetchApi: bundleFirmwareApi,
        error: errorOfBundle,
        data: responseOfBundle,
    } = useBundleFirmwareApi({ id: shouldBeBundledId });

    useEffect(() => {
        document.title = 'ItemHub - 裝置列表';
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        setPage(Number(query.get('page') || 1));
        // eslint-disable-next-line
    }, [query.get('page')]);

    useEffect(() => {
        setDeviceName(query.get('deviceName') || '');
        // eslint-disable-next-line
    }, [query.get('deviceName')]);

    useEffect(() => {
        getDevicesApi();
        // eslint-disable-next-line
    }, [query, refreshFlag]);

    useEffect(() => {
        if (shouldBeDeleteId) {
            deleteMultipleApi();
        }
        // eslint-disable-next-line
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setRefreshFlag(!refreshFlag);
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    useEffect(() => {
        if (shouldBeBundledId) {
            setIsFirmwarePrepare(true);
            bundleFirmwareApi();
        }
        // eslint-disable-next-line
    }, [shouldBeBundledId]);

    useEffect(() => {
        setIsFirmwarePrepare(false);
    }, [responseOfBundle, errorOfBundle]);

    useEffect(() => {
        if (devices && devices.length > 0) {
            hasDevicesRef.current = true;
        }
    }, [devices]);

    useEffect(() => {
        if (!lastDeviceImageThumbnailBlob) {
            return;
        }

        setRealtimeDeviceImageThumbnail(
            arrayBufferToBase64(lastDeviceImageThumbnailBlob.blob)
        );
    }, [lastDeviceImageThumbnailBlob]);

    useEffect(() => {
        if (lastDeviceImageThumbnailError) {
            setRealtimeDeviceImageThumbnail('');
        }
    }, [lastDeviceImageThumbnailError]);

    useEffect(() => {
        if (lastDeviceImageIconRef.current) {
            updateDeviceUploadedImagePosition(lastDeviceImageIconRef.current);
        }
        // eslint-disable-next-line
    }, [lastDeviceImageThumbnail]);

    useEffect(() => {
        if (!selectedDeviceId) {
            return;
        }
        getLastDeviceImageThumbnail();
        // eslint-disable-next-line
    }, [selectedDeviceId]);

    useEffect(() => {
        if (recursiveGetRealtimeDeviceImageStartFlag) {
            recursiveGetRealtimeDeviceImageStart();
        } else if (recursiveGetRealtimeDeviceImageTimer.current) {
            clearTimeout(recursiveGetRealtimeDeviceImageTimer.current);
        }
        // eslint-disable-next-line
    }, [recursiveGetRealtimeDeviceImageStartFlag]);

    const recursiveGetRealtimeDeviceImageStart = () => {
        if (!recursiveGetRealtimeDeviceImageStartFlag) {
            return;
        }
        recursiveGetRealtimeDeviceImageTimer.current = setTimeout(() => {
            getLastDeviceImageThumbnail();
            recursiveGetRealtimeDeviceImageStart();
        }, 5 * 1000);
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const deleteOne = (id: number) => {
        const shouldBeDeleteDevice = (devices || []).find(
            (item: DeviceItem) => item.id === id
        );
        if (!shouldBeDeleteDevice) {
            return;
        }
        dispatch(
            dialogActions.open({
                message: `刪除後將無法復原, 請輸入 DELETE 完成刪除 ${shouldBeDeleteDevice.name}`,
                title: '確認刪除裝置 ?',
                type: DialogTypeEnum.PROMPT,
                checkedMessage: 'DELETE',
                callback: () => {
                    setShouldBeDeleteId(() => {
                        return id;
                    });
                },
                promptInvalidMessage: '輸入錯誤',
            })
        );
    };

    const bundleFirmware = (id: number) => {
        dispatch(
            dialogActions.open({
                message: `下載後舊有裝置將無法使用，請確認是否下載？`,
                title: '下載範例程式碼',
                type: DialogTypeEnum.CONFIRM,
                callback: () => {
                    setShouldBeBundledId(id);
                },
            })
        );
    };

    const popupMonitorConfig = (id: number) => {
        dispatch(
            monitorConfigDialogActions.open({
                callback: () => {},
                deviceId: id,
            })
        );
    };

    const popupOfflineNotification = (id: number) => {
        dispatch(
            offlineNotificationDialogActions.open({
                callback: () => {},
                deviceId: id,
            })
        );
    };

    const updateDeviceUploadedImagePosition = (
        currentTarget: HTMLDivElement
    ) => {
        if (!currentTarget) {
            return;
        }

        const clientRect = currentTarget.getBoundingClientRect();
        const containerRect = lastDeviceImageThumbnailContainerRef.current
            ? lastDeviceImageThumbnailContainerRef.current?.getBoundingClientRect()
            : { height: 0, width: 0 };
        setRealtimmeDeviceImageThumbnailPosition({
            top: clientRect.top - containerRect.height - 20,
            left:
                clientRect.left + (clientRect.width - containerRect.width) / 2,
        });
    };

    return (
        <div className="devices" data-testid="devices">
            <PageTitle
                title="裝置列表"
                primaryButtonVisible={hasDevicesRef.current}
                primaryButtonWording="新增裝置"
                primaryButtonCallback={() => {
                    navigate('create');
                }}
                secondaryButtonVisible={hasDevicesRef.current}
                secondaryButtonWording="重新整理"
                secondaryButtonCallback={getDevicesApi}
            />
            <div className="card">
                {!hasDevicesRef.current && devices !== null && !isFilter ? (
                    <EmptyDataToCreateItem itemName="裝置" />
                ) : (
                    <>
                        <SearchInput
                            placeholder="搜尋裝置"
                            value={deviceName}
                            onChange={(newName) => {
                                setDeviceName(newName);
                            }}
                            onSearch={(deviceName) => {
                                navigate(
                                    `/dashboard/devices?${
                                        deviceName
                                            ? `deviceName=${deviceName}`
                                            : ''
                                    }`
                                );
                            }}
                        />
                        {isGetingDevices || devices === null ? (
                            <div className="w-100 d-flex justify-content-center my-4">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="mt-3 mt-lg-45">
                                <div className="text-end">
                                    <a
                                        className="fs-5"
                                        target="_blank"
                                        href={howToUseLink}
                                        rel="noreferrer"
                                    >
                                        如何使用?
                                    </a>
                                </div>
                                <div className="row bg-black bg-opacity-5 text-black text-opacity-45 fs-5 py-25 px-3 m-0 d-none d-lg-flex">
                                    <div className="col-3">裝置名稱</div>
                                    <div className="col-2">狀態</div>
                                    <div className="col-2">Protocol</div>
                                    <div className="col-3">Pins Data</div>
                                    <div className="col-2">操作</div>
                                </div>
                                <div className="devices-list">
                                    {devices.map(
                                        ({
                                            id,
                                            name,
                                            online,
                                            protocol,
                                            lastActivity,
                                            ownerId,
                                            isOfflineNotification,
                                        }) => {
                                            const targetProtocol =
                                                protocols.find(
                                                    (item) =>
                                                        item.value === protocol
                                                )?.key;
                                            return (
                                                <div
                                                    className="row list border-bottom border-black border-opacity-10 p-0 py-lg-4 px-lg-3 mx-0"
                                                    key={id}
                                                    title={`最後上線時間: ${
                                                        lastActivity
                                                            ? moment(
                                                                  lastActivity
                                                              ).format(
                                                                  'YYYY-MM-DD HH:mm:ss'
                                                              )
                                                            : '目前沒有資料'
                                                    }`}
                                                >
                                                    <PseudoDeviceLastActivity
                                                        deviceId={id}
                                                    />
                                                    <div className="col-4 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                        裝置名稱
                                                    </div>
                                                    <div className="col-8 col-lg-3 p-3 p-lg-0">
                                                        <div className="fw-bold lh-base mb-2 mb-lg-0">
                                                            {name}
                                                        </div>
                                                    </div>
                                                    <div className="col-4 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                        狀態
                                                    </div>
                                                    <div className="col-8 col-lg-2 p-3 p-lg-0">
                                                        <OnlineStatusTag
                                                            isOnline={online}
                                                        />
                                                    </div>
                                                    <div className="col-4 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                        Protocol
                                                    </div>
                                                    <div className="col-8 col-lg-2 p-3 px-lg-3 py-lg-0">
                                                        {targetProtocol}
                                                    </div>
                                                    <div className="col-4 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                        Pins Data
                                                    </div>
                                                    <div className="col-8 col-lg-3 p-3 p-lg-0">
                                                        <Pins
                                                            deviceId={Number(
                                                                id
                                                            )}
                                                            isEditMode={false}
                                                        />
                                                    </div>
                                                    <div className="col-4 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                        操作
                                                    </div>
                                                    <div className="col-8 col-lg-2 p-3 p-lg-0 d-flex flex-wrap align-content-start">
                                                        <Link
                                                            className="me-4 mb-3"
                                                            to={`/dashboard/devices/${id}${search}`}
                                                            data-tip="編輯"
                                                        >
                                                            <img
                                                                className="icon"
                                                                src={pencilIcon}
                                                            />
                                                        </Link>
                                                        <div
                                                            className="me-4 mb-3"
                                                            role="button"
                                                            onClick={() => {
                                                                if (
                                                                    isFirmwarePrepare
                                                                ) {
                                                                    return;
                                                                }
                                                                bundleFirmware(
                                                                    id
                                                                );
                                                            }}
                                                            data-tip="下載範例程式碼"
                                                        >
                                                            {isFirmwarePrepare &&
                                                            shouldBeBundledId ===
                                                                id ? (
                                                                <img
                                                                    title="正在產生 firmware project"
                                                                    className="icon"
                                                                    src={
                                                                        compassIcon
                                                                    }
                                                                />
                                                            ) : (
                                                                <div className="position-relative">
                                                                    <img
                                                                        className="icon"
                                                                        src={
                                                                            cloudIcon
                                                                        }
                                                                    />
                                                                    <img
                                                                        className={`icon position-absolute ${
                                                                            isFirmwarePrepare &&
                                                                            shouldBeBundledId !==
                                                                                id
                                                                                ? ''
                                                                                : 'd-none'
                                                                        }`}
                                                                        src={
                                                                            stopIcon
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="me-4 mb-3"
                                                            role="button"
                                                            onClick={() => {
                                                                deleteOne(id);
                                                            }}
                                                            data-tip="刪除"
                                                        >
                                                            <img
                                                                className="icon"
                                                                src={trashIcon}
                                                            />
                                                        </div>

                                                        <div
                                                            className="me-4 mb-3"
                                                            role="button"
                                                            onClick={() => {
                                                                popupMonitorConfig(
                                                                    id
                                                                );
                                                            }}
                                                            data-tip="加到監控中心"
                                                        >
                                                            <img
                                                                className="icon"
                                                                src={
                                                                    displayIcon
                                                                }
                                                            />
                                                        </div>

                                                        <div
                                                            className="me-4 mb-3"
                                                            role="button"
                                                            onClick={() => {
                                                                popupOfflineNotification(
                                                                    id
                                                                );
                                                            }}
                                                            data-tip="斷線通知"
                                                        >
                                                            <img
                                                                className="icon"
                                                                src={
                                                                    isOfflineNotification
                                                                        ? colorWarnIcon
                                                                        : warnIcon
                                                                }
                                                            />
                                                        </div>

                                                        <div
                                                            role="button"
                                                            onMouseOver={(
                                                                event: React.MouseEvent<HTMLDivElement>
                                                            ) => {
                                                                setSelectedDeviceId(
                                                                    id
                                                                );
                                                                setRealtimeDeviceImageThumbnailContainerShow(
                                                                    true
                                                                );
                                                                updateDeviceUploadedImagePosition(
                                                                    event.currentTarget
                                                                );
                                                                setRecursiveGetUploadedImageStartFlag(
                                                                    true
                                                                );
                                                                lastDeviceImageIconRef.current =
                                                                    event.currentTarget;
                                                            }}
                                                            onClick={() => {
                                                                if (
                                                                    !lastDeviceImageThumbnail
                                                                ) {
                                                                    return;
                                                                }
                                                                dispatch(
                                                                    realtimeDeviceImageDialogActions.open(
                                                                        {
                                                                            deviceId:
                                                                                id,
                                                                            ownerId,
                                                                        }
                                                                    )
                                                                );
                                                            }}
                                                            onTouchStart={(
                                                                event: React.TouchEvent<HTMLDivElement>
                                                            ) => {
                                                                setSelectedDeviceId(
                                                                    id
                                                                );
                                                                setRealtimeDeviceImageThumbnailContainerShow(
                                                                    true
                                                                );
                                                                updateDeviceUploadedImagePosition(
                                                                    event.currentTarget
                                                                );
                                                                setRecursiveGetUploadedImageStartFlag(
                                                                    true
                                                                );
                                                                lastDeviceImageIconRef.current =
                                                                    event.currentTarget;
                                                            }}
                                                            onMouseOut={() => {
                                                                setRealtimeDeviceImageThumbnail(
                                                                    null
                                                                );
                                                                setSelectedDeviceId(
                                                                    0
                                                                );
                                                                setRealtimeDeviceImageThumbnailContainerShow(
                                                                    false
                                                                );
                                                                setRecursiveGetUploadedImageStartFlag(
                                                                    false
                                                                );
                                                            }}
                                                            onTouchEnd={() => {
                                                                setRealtimeDeviceImageThumbnail(
                                                                    null
                                                                );
                                                                setSelectedDeviceId(
                                                                    0
                                                                );
                                                                setRealtimeDeviceImageThumbnailContainerShow(
                                                                    false
                                                                );
                                                                setRecursiveGetUploadedImageStartFlag(
                                                                    false
                                                                );
                                                            }}
                                                        >
                                                            <img
                                                                className="icon"
                                                                src={cameraIcon}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                                <ReactTooltip effect="solid" />
                                <div
                                    ref={lastDeviceImageThumbnailContainerRef}
                                    className={`position-fixed bg-grey-800 p-3 rounded text-white bg-opacity-90 uploaded-image ${
                                        lastDeviceImageThumbnailContainerShow
                                            ? ''
                                            : 'invisible'
                                    }`}
                                    style={lastDeviceImageThumbnailPosition}
                                >
                                    {lastDeviceImageThumbnail == null ? (
                                        <Spinner />
                                    ) : lastDeviceImageThumbnail ? (
                                        <img
                                            src={`data:image/jpg;base64, ${lastDeviceImageThumbnail}`}
                                        />
                                    ) : (
                                        lastDeviceImageThumbnail != null && (
                                            <div>目前沒有資料</div>
                                        )
                                    )}
                                </div>
                                <div
                                    className={`${
                                        devices.length > 0 ? 'd-flex' : 'd-none'
                                    } justify-content-end w-100 mt-5`}
                                >
                                    <Pagination
                                        rowNum={rowNum}
                                        page={page}
                                        limit={limit}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Devices;
