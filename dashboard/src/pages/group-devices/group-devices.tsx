import { useRef, useEffect, useState } from 'react';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@/hooks/query.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import PageTitle from '@/components/page-title/page-title';
import Pagination from '@/components/pagination/pagination';
import SearchInput from '@/components/inputs/search-input/search-input';
import EmptyDataToCreateItem from '@/components/empty-data-to-create-item/empty-data-to-create-item';
import displayIcon from '@/assets/images/display.svg';
import { useDispatch } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import OnlineStatusTag from '@/components/online-status-tag/online-status-tag';
import Spinner from '@/components/spinner/spinner';
import { monitorConfigDialogActions } from '@/redux/reducers/monitor-config-dialog.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import {
    useGetGroupDevicesApi,
    useGetGroupLastDeviceImageThumbnailApi,
} from '@/hooks/apis/group-devices.hook';
import { selectGroupDevices } from '@/redux/reducers/group-devices.reducer';
import PseudoGroupDeviceLastActivity from '@/components/pseudo-group-device-last-activity/pseudo-group-device-last-activity';
import GroupPins from '@/components/group-pins/group-pins';
import cameraIcon from '@/assets/images/camera.svg';
import { realtimeDeviceImageDialogActions } from '@/redux/reducers/realtime-device-image-dialog.reducer';
import { ApiHelpers } from '@/helpers/api.helper';

const GroupDevices = () => {
    const query = useQuery();
    const { groupId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const limit = Number(query.get('limit') || 10);
    const [page, setPage] = useState(1);
    const [selectedDeviceId, setSelectedDeviceId] = useState(0);
    const [deviceName, setDeviceName] = useState(query.get('deviceName') || '');
    const [isGetted, setIsGetted] = useState(false);
    const lastDeviceImageIconRef = useRef<null | HTMLDivElement>(null);
    const recursiveGetLastDeviceImageTimer = useRef<null | NodeJS.Timeout>(
        null
    );
    const [
        lastDeviceImageThumbnailContainerShow,
        setLastDeviceImageThumbnailContainerShow,
    ] = useState(false);
    const lastDeviceImageThumbnailContainerRef = useRef<null | HTMLDivElement>(
        null
    );
    const [
        lastDeviceImageThumbnailPosition,
        setLastDeviceImageThumbnailPosition,
    ] = useState<any>({});
    const [
        recursiveGetLastDeviceImageStartFlag,
        setRecursiveGetUploadedImageStartFlag,
    ] = useState(false);
    const [lastDeviceImageThumbnail, setLastDeviceImageThumbnail] = useState<
        null | string
    >('');
    const devicesState = useAppSelector(selectGroupDevices);
    const { protocols } = useAppSelector(selectUniversal);

    const hasDevicesRef = useRef(false);
    const howToUseLink = `${import.meta.env.VITE_WEBSITE_URL}/how/start/`;

    const {
        isLoading: isGetingDevices,
        fetchApi: getDevicesApi,
        data: responseOfGet,
    } = useGetGroupDevicesApi({
        groupId: Number(groupId || 0),
        page: Number(query.get('page') || 1),
        limit: Number(query.get('limit') || 10),
        name: query.get('deviceName') || '',
    });

    const {
        fetchApi: getLastDeviceImageThumbnail,
        data: lastDeviceImageThumbnailBlob,
        error: lastDeviceImageThumbnailError,
    } = useGetGroupLastDeviceImageThumbnailApi(
        Number(groupId || 0),
        selectedDeviceId
    );

    useEffect(() => {
        document.title = 'ItemHub - 群組裝置列表';
        // eslint-disable-next-line
        return () => {};
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
        if (!responseOfGet) {
            return;
        }
        setIsGetted(true);
    }, [responseOfGet]);

    useEffect(() => {
        getDevicesApi();
        // eslint-disable-next-line
    }, [query]);

    useEffect(() => {
        if (!lastDeviceImageThumbnailBlob) {
            return;
        }

        setLastDeviceImageThumbnail(
            ApiHelpers.ArrayBufferToBase64(lastDeviceImageThumbnailBlob.blob)
        );
    }, [lastDeviceImageThumbnailBlob]);

    useEffect(() => {
        if (lastDeviceImageThumbnailError) {
            setLastDeviceImageThumbnail('');
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
        if (recursiveGetLastDeviceImageStartFlag) {
            recursiveGetLastDeviceImageStart();
        } else if (recursiveGetLastDeviceImageTimer.current) {
            clearTimeout(recursiveGetLastDeviceImageTimer.current);
        }
        // eslint-disable-next-line
    }, [recursiveGetLastDeviceImageStartFlag]);

    const recursiveGetLastDeviceImageStart = () => {
        if (!recursiveGetLastDeviceImageStartFlag) {
            return;
        }
        recursiveGetLastDeviceImageTimer.current = setTimeout(() => {
            getLastDeviceImageThumbnail();
            recursiveGetLastDeviceImageStart();
        }, 5 * 1000);
    };

    const popupMonitorConfig = (id: number) => {
        dispatch(
            monitorConfigDialogActions.open({
                callback: () => {},
                deviceId: id,
                // groupId: groupId ? Number(groupId) : undefined,
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
        setLastDeviceImageThumbnailPosition({
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
                {devicesState.devices !== null &&
                devicesState.devices.length === 0 &&
                isGetted ? (
                    <EmptyDataToCreateItem
                        itemName="裝置"
                        isShowCreateButton={false}
                    />
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
                                    `/dashboard/groups/${groupId}/devices?${
                                        deviceName
                                            ? `deviceName=${deviceName}`
                                            : ''
                                    }`
                                );
                            }}
                        />
                        {isGetingDevices || devicesState.devices === null ? (
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
                                    <div className="col-5">操作</div>
                                </div>
                                <div className="row bg-black bg-opacity-5 text-black text-opacity-45 fs-5 py-25 px-3 m-0 d-none d-lg-flex">
                                    <div className="col-12">Pins Data</div>
                                </div>
                                <div className="devices-list">
                                    {devicesState.devices.map(
                                        ({
                                            id,
                                            name,
                                            online,
                                            protocol,
                                            lastActivity,
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
                                                    <PseudoGroupDeviceLastActivity
                                                        groupId={Number(
                                                            groupId || 0
                                                        )}
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
                                                        操作
                                                    </div>
                                                    <div className="col-8 col-lg-5 p-3 p-lg-0 d-flex flex-wrap align-content-start">
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
                                                            role="button"
                                                            onMouseOver={(
                                                                event: React.MouseEvent<HTMLDivElement>
                                                            ) => {
                                                                setSelectedDeviceId(
                                                                    id
                                                                );
                                                                setLastDeviceImageThumbnailContainerShow(
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
                                                                setLastDeviceImageThumbnailContainerShow(
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
                                                                setLastDeviceImageThumbnail(
                                                                    null
                                                                );
                                                                setSelectedDeviceId(
                                                                    0
                                                                );
                                                                setLastDeviceImageThumbnailContainerShow(
                                                                    false
                                                                );
                                                                setRecursiveGetUploadedImageStartFlag(
                                                                    false
                                                                );
                                                            }}
                                                            onTouchEnd={() => {
                                                                if (
                                                                    lastDeviceImageThumbnail
                                                                ) {
                                                                    dispatch(
                                                                        realtimeDeviceImageDialogActions.open(
                                                                            {
                                                                                deviceId:
                                                                                    id,
                                                                            }
                                                                        )
                                                                    );
                                                                }
                                                                setLastDeviceImageThumbnail(
                                                                    null
                                                                );
                                                                setSelectedDeviceId(
                                                                    0
                                                                );
                                                                setLastDeviceImageThumbnailContainerShow(
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
                                                    <div className="col-4 d-lg-none bg-black bg-opacity-5 text-black text-opacity-45 p-3">
                                                        Pins Data
                                                    </div>
                                                    <div className="col-8 col-lg-12 p-3 p-lg-0">
                                                        <hr className="border-grey-300" />
                                                        <GroupPins
                                                            groupId={Number(
                                                                groupId || 0
                                                            )}
                                                            deviceId={Number(
                                                                id
                                                            )}
                                                        />
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
                                        devicesState.devices.length > 0
                                            ? 'd-flex'
                                            : 'd-none'
                                    } justify-content-end w-100 mt-5`}
                                >
                                    <Pagination
                                        rowNum={devicesState.rowNum}
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

export default GroupDevices;
