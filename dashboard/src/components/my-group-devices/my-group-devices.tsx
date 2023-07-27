import { useAppSelector } from '@/hooks/redux.hook';
import { useEffect, useState } from 'react';
import closeIcon from '@/assets/images/dark-close.svg';
import { RESPONSE_STATUS } from '@/constants/api';
import {
    useCreateMyGroupDeviceApi,
    useDeleteMyGroupDevicesApi,
    useGetMyGroupDevicesApi,
} from '@/hooks/apis/my-group-devices.hook';
import { GroupDevicesType } from '@/types/group-devices.type';
import { selectMyGroupDevices } from '@/redux/reducers/my-group-devices.reducer';
import Spinner from '../spinner/spinner';
import AutocompletedSearch from '../inputs/autocompleted-search/autocompleted-search';
import { KeyValuePair } from '@/types/common.type';
import { DeviceItem } from '@/types/devices.type';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import { useGetAllDevicesApi } from '@/hooks/apis/devices.hook';
const MyGroupDevices = ({ groupId }: { groupId: number | undefined }) => {
    const [groupDevices, setGroupDevices] = useState<
        GroupDevicesType[] | undefined
    >(undefined);
    const allDevices: DeviceItem[] = useAppSelector(selectDevices).devices;
    const { getAllDevicesApi } = useGetAllDevicesApi();
    const [shouldBeDeleteDeviceId, setShouldBeDeleteDeviceId] =
        useState<number>(0);
    const [isGetted, setIsGetted] = useState<boolean>(false);
    const [groupDeviceIds, setGroupDeviceIds] = useState<number[]>([]);
    const [shouldBeCreatedDeviceId, setShouldBeCreatedDeviceId] =
        useState<number>(0);
    const [isDeviceInputError] = useState<boolean>(false);
    const [clearDeviceNameInputFlag, setClearDeviceNameInputFlag] =
        useState<boolean>(false);
    const groupDevicesFromStore: GroupDevicesType[] =
        useAppSelector(selectMyGroupDevices);

    const {
        isLoading: isGetting,
        fetchApi: getGroupDevices,
        data: responseOfGet,
    } = useGetMyGroupDevicesApi({
        groupId: groupId || 0,
    });
    const {
        isLoading: isDeleteing,
        fetchApi: deleteGroupDevices,
        data: responseOfDelete,
    } = useDeleteMyGroupDevicesApi({
        groupId: groupId || 0,
        id: shouldBeDeleteDeviceId,
    });

    const {
        isLoading: isCreating,
        fetchApi: createGroupDevice,
        data: responseOfCreate,
    } = useCreateMyGroupDeviceApi({
        groupId: groupId || 0,
        deviceId: shouldBeCreatedDeviceId,
    });

    const validateAndSetup = (newValue, isCreate) => {
        setShouldBeCreatedDeviceId(Number(newValue));
        if (isCreate) {
            createGroupDevice();
        }
    };

    useEffect(() => {
        getGroupDevices();
        getAllDevicesApi();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (shouldBeDeleteDeviceId === 0) {
            return;
        }
        deleteGroupDevices();
        // eslint-disable-next-line
    }, [shouldBeDeleteDeviceId]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setShouldBeDeleteDeviceId(0);
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    useEffect(() => {
        setGroupDevices([
            ...groupDevicesFromStore.filter((item) => item.groupId == groupId),
        ]);
        setGroupDeviceIds(
            groupDevicesFromStore
                .filter((item) => item.groupId == groupId)
                .map((item) => item.deviceId)
        );
        // eslint-disable-next-line
    }, [groupDevicesFromStore]);

    useEffect(() => {
        if (!isGetted && responseOfGet) {
            setIsGetted(true);
        }
        // eslint-disable-next-line
    }, [isGetting, responseOfGet]);

    useEffect(() => {
        if (!responseOfCreate) {
            return;
        }
        setShouldBeCreatedDeviceId(0);
        setClearDeviceNameInputFlag(!clearDeviceNameInputFlag);
        // eslint-disable-next-line
    }, [responseOfCreate]);

    return (
        <div className="card">
            <div>
                <label className="form-label" htmlFor="title">
                    群組裝置
                </label>
            </div>
            {isGetting && !isGetted ? (
                <div className="d-flex justify-content-center">
                    <Spinner />
                </div>
            ) : (
                <>
                    <div>
                        <div className="d-flex align-items-start">
                            <div className="me-3">
                                <AutocompletedSearch
                                    datalistId="裝置"
                                    placeholder="請輸入裝置名稱搜尋"
                                    isError={isDeviceInputError}
                                    isDisabled={isCreating}
                                    multipleErrorMessage={
                                        '預期找到一個裝置，但搜尋出多個裝置名稱'
                                    }
                                    defaultValue={''}
                                    clearInputFlag={clearDeviceNameInputFlag}
                                    onValueChanged={(
                                        newValue: number | string | undefined,
                                        isTypeEnter: boolean | undefined
                                    ) => {
                                        validateAndSetup(newValue, isTypeEnter);
                                    }}
                                    allSuggestions={(allDevices || [])
                                        .filter(
                                            (item) =>
                                                !groupDeviceIds.includes(
                                                    item.id
                                                )
                                        )
                                        .map(
                                            ({ name, id }) =>
                                                ({
                                                    key: name,
                                                    value: id,
                                                } as KeyValuePair)
                                        )}
                                />
                            </div>
                            <button
                                className="btn btn-primary"
                                disabled={
                                    isCreating || !shouldBeCreatedDeviceId
                                }
                                onClick={() => {
                                    if (
                                        !shouldBeCreatedDeviceId ||
                                        isDeviceInputError
                                    ) {
                                        return;
                                    }
                                    createGroupDevice();
                                }}
                            >
                                新增
                            </button>
                        </div>
                    </div>
                    <div className="d-inline-flex flex-wrap align-items-center mt-3">
                        {groupDevices &&
                            groupDevices.map((item) => {
                                return (
                                    <div
                                        className={`px-3 py-1 border border-1 me-3 rounded-2 d-flex align-items-center mb-3 ${
                                            (item.id ===
                                                shouldBeCreatedDeviceId &&
                                                isCreating) ||
                                            (item.id ===
                                                shouldBeDeleteDeviceId &&
                                                isDeleteing)
                                                ? 'border-warn bg-warn bg-opacity-30'
                                                : 'border-gray-400'
                                        }`}
                                        key={`${item.id}`}
                                    >
                                        {item.deviceName}
                                        <img
                                            role="button"
                                            className="ms-2"
                                            src={closeIcon}
                                            onClick={() => {
                                                setShouldBeDeleteDeviceId(
                                                    item.id || 0
                                                );
                                            }}
                                        />
                                    </div>
                                );
                            })}
                    </div>
                </>
            )}
        </div>
    );
};
export default MyGroupDevices;
