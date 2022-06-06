import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RESPONSE_STATUS } from '@/constants/api';
import { useQuery } from '@/hooks/query.hook';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import {
    useGetTriggersApi,
    useDeleteTriggersApi,
} from '@/hooks/apis/triggers.hook';
import { selectTriggers } from '@/redux/reducers/triggers.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import { ArrayHelpers } from '@/helpers/array.helper';
import ReactTooltip from 'react-tooltip';
import Pagination from '@/components/pagination/pagination';
import PageTitle from '@/components/page-title/page-title';
import { dialogActions, DialogTypeEnum } from '@/redux/reducers/dialog.reducer';
import SearchInput from '@/components/inputs/search-input/search-input';
import AutocompletedSearch from '@/components/inputs/autocompleted-search/autocompleted-search';
import EmptyDataToCreateItem from '@/components/empty-data-to-create-item/empty-data-to-create-item';
import OnlineStatusTag from '@/components/online-status-tag/online-status-tag';
import Spinner from '@/components/spinner/spinner';
import lightTrashIcon from '@/assets/images/light-trash.svg';
import pencilIcon from '@/assets/images/pencil.svg';
import trashIcon from '@/assets/images/trash.svg';

const Triggers = () => {
    const navigate = useNavigate();
    const query = useQuery();

    const limit = Number(query.get('limit') || 5);
    const page = Number(query.get('page') || 1);

    const dispatch = useAppDispatch();
    const [triggerName, setTriggerName] = useState(query.get('name') || '');
    const { triggerOperators } = useAppSelector(selectUniversal);

    const sourceDeviceNameOptionsRef = useRef<string[]>([]);
    const destinationDeviceNameOptionsRef = useRef<string[]>([]);

    const sourceDeviceNameOptions = ArrayHelpers.FilterDuplicatedString(
        sourceDeviceNameOptionsRef.current
    );
    const destinationDeviceNameOptions = ArrayHelpers.FilterDuplicatedString(
        destinationDeviceNameOptionsRef.current
    );

    const { triggers, rowNum } = useAppSelector(selectTriggers);
    const hasTriggersRef = useRef(false);

    useEffect(() => {
        if (triggers && triggers.length > 0) {
            hasTriggersRef.current = true;
        }
    }, [triggers]);

    useEffect(() => {
        if (
            triggers &&
            sourceDeviceNameOptions.length === 0 &&
            destinationDeviceNameOptions.length === 0
        ) {
            const initialOptions = {
                sourceDeviceNames: [] as string[],
                destinationDeviceNames: [] as string[],
            };

            const options = triggers.reduce((accumOptions, currentTrigger) => {
                const sourceDeviceName = currentTrigger.sourceDevice?.name;
                const destinationDeviceName =
                    currentTrigger.destinationDevice?.name;

                if (sourceDeviceName) {
                    accumOptions.sourceDeviceNames.push(sourceDeviceName);
                }
                if (destinationDeviceName) {
                    accumOptions.destinationDeviceNames.push(
                        destinationDeviceName
                    );
                }

                return accumOptions;
            }, initialOptions);

            sourceDeviceNameOptionsRef.current = options.sourceDeviceNames;
            destinationDeviceNameOptionsRef.current =
                options.destinationDeviceNames;
        }
    }, [
        destinationDeviceNameOptions.length,
        sourceDeviceNameOptions.length,
        triggers,
    ]);

    const [sourceDeviceNameFilter, setSourceDeviceNameFilter] = useState('');
    const [destinationDeviceNameFilter, setDestinationDeviceNameFilter] =
        useState('');

    const { isGettingTriggers, getTriggersApi } = useGetTriggersApi({
        page,
        limit,
        name: triggerName,
        sourceDeviceName: sourceDeviceNameFilter,
        destinationDeviceName: destinationDeviceNameFilter,
    });

    useEffect(() => {
        getTriggersApi();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const [deletedOneId, setDeletedOneId] = useState(0);
    const [selectedIds, setSelectedIds] = useState(Array<number>());

    const isSelectAll =
        triggers?.length !== 0 && selectedIds.length === triggers?.length;

    const toggleSelectAll = () => {
        if (triggers === null) {
            return;
        }
        if (selectedIds.length === triggers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(triggers.map(({ id }) => id));
        }
    };

    const updateSelectedIds = (id: number) => {
        setSelectedIds((previous) => {
            const newSelectedIds = [...previous];
            const targetIndex = newSelectedIds.indexOf(id);
            if (targetIndex !== -1) {
                newSelectedIds.splice(targetIndex, 1);
            } else {
                newSelectedIds.push(id);
            }
            return newSelectedIds;
        });
    };

    const {
        isDeletingTriggers: isDeletingOneTrigger,
        deleteTriggersApi: deleteOneTriggerApi,
        deleteTriggersResponse: deleteOneTriggerResponse,
    } = useDeleteTriggersApi([deletedOneId]);

    const { isDeletingTriggers, deleteTriggersApi, deleteTriggersResponse } =
        useDeleteTriggersApi(selectedIds);

    const confirmToDeleteOneTrigger = ({
        id,
        name,
    }: {
        id: number;
        name: string;
    }) => {
        setDeletedOneId(id);
        dispatch(
            dialogActions.open({
                message: '刪除後將無法復原, 請輸入 DELETE 完成刪除',
                title: `確認刪除 Trigger ${name || id} ?`,
                type: DialogTypeEnum.PROMPT,
                checkedMessage: 'DELETE',
                callback: deleteOneTriggerApi,
                promptInvalidMessage: '輸入錯誤，請再次嘗試',
            })
        );
    };

    const confirmToDeleteTriggers = () => {
        dispatch(
            dialogActions.open({
                message: '刪除後將無法復原, 請輸入 DELETE 完成刪除',
                title: '確認刪除 Triggers ?',
                type: DialogTypeEnum.PROMPT,
                checkedMessage: 'DELETE',
                callback: deleteTriggersApi,
                promptInvalidMessage: '輸入錯誤，請再次嘗試',
            })
        );
    };

    const jumpToCreatePage = () => {
        navigate('create');
    };

    useEffect(() => {
        if (
            deletedOneId &&
            deleteOneTriggerResponse &&
            deleteOneTriggerResponse.status === RESPONSE_STATUS.OK
        ) {
            dispatch(
                toasterActions.pushOne({
                    message: `Trigger ${deletedOneId} 已經成功刪除`,
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
            setDeletedOneId(0);
            getTriggersApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteOneTriggerResponse, getTriggersApi, dispatch]);

    useEffect(() => {
        if (
            selectedIds.length !== 0 &&
            deleteTriggersResponse &&
            deleteTriggersResponse.status === RESPONSE_STATUS.OK
        ) {
            dispatch(
                toasterActions.pushOne({
                    message: '多個 Triggers 已經成功刪除',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
            setSelectedIds([]);
            getTriggersApi();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteTriggersResponse, getTriggersApi, dispatch]);

    const [
        pageTitleSecondaryButtonClassName,
        setPageTitleSecondaryButtonClassName,
    ] = useState('btn btn-danger disabled');

    useEffect(() => {
        let pageTitleSecondaryButtonClassName = 'btn btn-danger';
        if (selectedIds.length === 0 || isDeletingTriggers) {
            pageTitleSecondaryButtonClassName += ' disabled';
        }
        setPageTitleSecondaryButtonClassName(pageTitleSecondaryButtonClassName);
    }, [selectedIds, isDeletingTriggers]);

    return (
        <div className="triggers" data-testid="triggers">
            <PageTitle
                title="觸發列表"
                primaryButtonVisible={hasTriggersRef.current}
                primaryButtonWording="新增觸發"
                primaryButtonCallback={jumpToCreatePage}
                secondaryButtonIcon={lightTrashIcon}
                secondaryButtonClassName={pageTitleSecondaryButtonClassName}
                secondaryButtonVisible={hasTriggersRef.current}
                secondaryButtonWording="刪除選取"
                secondaryButtonCallback={confirmToDeleteTriggers}
            />
            <div className="card">
                {!hasTriggersRef.current && triggers !== null ? (
                    <EmptyDataToCreateItem itemName="觸發" />
                ) : (
                    <>
                        <div className="row justify-content-start">
                            <div className="search-wrapper col-12 col-md-6 mb-3 mb-md-0">
                                <SearchInput
                                    placeholder="搜尋觸發"
                                    onChangeValue={(value) =>
                                        setTriggerName(value)
                                    }
                                    onSearch={getTriggersApi}
                                />
                            </div>
                            <div className="filter-wrapper col-6 col-md-3">
                                <AutocompletedSearch
                                    datalistId="sourceDevice"
                                    placeholder="來源裝置篩選"
                                    isDisabled={false}
                                    currentValue={sourceDeviceNameFilter}
                                    updateCurrentValue={(newValue) => {
                                        setSourceDeviceNameFilter(newValue);
                                    }}
                                    allSuggestions={sourceDeviceNameOptions}
                                    onEnterKeyUp={getTriggersApi}
                                    onClickOption={getTriggersApi}
                                />
                            </div>
                            <div className="filter-wrapper col-6 col-md-3">
                                <AutocompletedSearch
                                    datalistId="destinationDevice"
                                    placeholder="目標裝置篩選"
                                    isDisabled={false}
                                    currentValue={destinationDeviceNameFilter}
                                    updateCurrentValue={(newValue) => {
                                        setDestinationDeviceNameFilter(
                                            newValue
                                        );
                                    }}
                                    allSuggestions={
                                        destinationDeviceNameOptions
                                    }
                                    onEnterKeyUp={getTriggersApi}
                                    onClickOption={getTriggersApi}
                                />
                            </div>
                        </div>
                        {isGettingTriggers || triggers === null ? (
                            <div className="w-100 d-flex justify-content-center my-4">
                                <Spinner />
                            </div>
                        ) : (
                            <div className="mt-3 mt-sm-45">
                                <div className="row py-25 px-3 m-0 bg-black bg-opacity-5 fs-5 text-black text-opacity-45 d-none d-lg-flex">
                                    <label className="col-4" role="button">
                                        <div className="d-flex align-items-center">
                                            <input
                                                type="checkbox"
                                                className="me-3"
                                                checked={isSelectAll}
                                                onChange={toggleSelectAll}
                                            />
                                            <span>觸發名稱</span>
                                        </div>
                                    </label>
                                    <div className="col-3">事件</div>
                                    <div className="col-3">目標</div>
                                    <div className="col-2">操作</div>
                                </div>
                                <div className="triggers-list">
                                    {triggers.map(
                                        (
                                            {
                                                id,
                                                name,
                                                sourceDevice,
                                                sourcePin,
                                                destinationDevice,
                                                destinationDeviceTargetState,
                                                destinationPin,
                                                operator,
                                                sourceThreshold,
                                            },
                                            index
                                        ) => (
                                            <div
                                                key={`${id}-${index}`}
                                                role="button"
                                                onClick={(e) => {
                                                    updateSelectedIds(id);
                                                }}
                                                className="row list border-bottom border-black border-opacity-10 p-0 m-0 py-lg-4 px-lg-3"
                                            >
                                                <div className="d-block d-lg-none py-3 col-4 bg-black bg-opacity-5 text-black text-opacity-45">
                                                    觸發名稱
                                                </div>
                                                <div className="col-8 col-lg-4 py-3 py-lg-0 d-flex flex-column flex-lg-row align-items-start">
                                                    <input
                                                        className="me-3 mt-2"
                                                        type="checkbox"
                                                        value={id}
                                                        checked={selectedIds.includes(
                                                            id
                                                        )}
                                                    />
                                                    <div>{name || '--'}</div>
                                                </div>
                                                <div className="d-block d-lg-none col-4 py-3 bg-black bg-opacity-5 text-black text-opacity-45">
                                                    事件
                                                </div>
                                                <div className="col-8 col-lg-3 py-3 py-lg-0 lh-base">
                                                    <div>
                                                        {sourceDevice?.name}
                                                    </div>
                                                    <div className="mt-2">
                                                        <OnlineStatusTag
                                                            isOnline={
                                                                sourceDevice?.online ||
                                                                false
                                                            }
                                                        />
                                                    </div>
                                                    <div className="mt-2">
                                                        Pin: {sourcePin}
                                                    </div>
                                                    <div className="mt-2">
                                                        條件:{' '}
                                                        <span className="pe-1">
                                                            {
                                                                triggerOperators[
                                                                    operator
                                                                ]?.symbol
                                                            }
                                                        </span>
                                                        <span>
                                                            {sourceThreshold}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="d-block d-lg-none col-4 py-3 bg-black bg-opacity-5 text-black text-opacity-45">
                                                    目標
                                                </div>
                                                <div className="col-8 col-lg-3 lh-base py-3 py-lg-0">
                                                    <div>
                                                        {
                                                            destinationDevice?.name
                                                        }{' '}
                                                    </div>
                                                    <div className="mt-2">
                                                        <OnlineStatusTag
                                                            isOnline={
                                                                destinationDevice?.online ||
                                                                false
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-2">
                                                        Pin: {destinationPin}{' '}
                                                    </div>

                                                    <div className="mt-2">
                                                        目標狀態:{' '}
                                                        {destinationDeviceTargetState ===
                                                        1
                                                            ? '開'
                                                            : '關'}
                                                    </div>
                                                </div>

                                                <div className="d-block d-lg-none col-4 py-3 bg-black bg-opacity-5 text-black text-opacity-45">
                                                    操作
                                                </div>
                                                <div
                                                    className="col-8 col-lg-2 py-3 py-lg-0 d-flex justify-content-start flex-wrap"
                                                    onClick={(e) => {
                                                        navigate(
                                                            `/dashboard/triggers/edit/${id}`
                                                        );
                                                    }}
                                                    data-tip="編輯"
                                                >
                                                    <span
                                                        className="me-3 mb-3 align-items-start d-flex"
                                                        data-tip="編輯"
                                                    >
                                                        <img src={pencilIcon} />
                                                    </span>
                                                    <button
                                                        className="btn mb-3 align-items-start d-flex p-0 bg-transparent shadow-none"
                                                        onClick={(e) => {
                                                            confirmToDeleteOneTrigger(
                                                                { id, name }
                                                            );
                                                        }}
                                                        disabled={
                                                            isDeletingOneTrigger
                                                        }
                                                        data-tip="刪除"
                                                    >
                                                        <img src={trashIcon} />
                                                    </button>
                                                    <ReactTooltip effect="solid" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div
                                    className={`${
                                        triggers.length > 0
                                            ? 'd-flex'
                                            : 'd-none'
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

export default Triggers;
