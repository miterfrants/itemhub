import { PIN_TYPES } from '@/constants/pin-type';
import {
    useCreateDashboardMonitorApi,
    useUpdateDashboardMonitorApi,
} from '@/hooks/apis/dashboard-monitor.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import {
    selectMonitorConfigDialog,
    monitorConfigDialogActions,
} from '@/redux/reducers/monitor-config-dialog.reducer';
import { selectDevicePins } from '@/redux/reducers/pins.reducer';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { PinItem } from '@/types/devices.type';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MONITOR_MODE } from '@/constants/monitor-mode';
import { useGetDashboardMonitorModesApi } from '@/hooks/apis/universal.hook';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import { useGetDevicePinsApi } from '@/hooks/apis/device-pin.hook';
import { useGetGroupDevicePinsApi } from '@/hooks/apis/group-device-pin.hook';
import { selectGroupDevicePins } from '@/redux/reducers/group-device-pins.reducer';

const MonitorConfigDialog = () => {
    const dialog = useAppSelector(selectMonitorConfigDialog);
    const {
        isOpen,
        deviceId,
        id,
        row: rowDefaultValue,
        column: columnDefaultValue,
        customTitle: customTitleDefaultValue,
        mode,
        pin: pinDefaultValue,
        groupId,
    } = dialog;

    const devicePinsPool: PinItem[] | null = useAppSelector(
        groupId ? selectGroupDevicePins : selectDevicePins
    );
    const { deviceModes, dashboardMonitorModes } =
        useAppSelector(selectUniversal);

    const dispatch = useDispatch();
    const defaultSwitchModeValue = 2;
    const promptInputRef = useRef<HTMLInputElement>(null);
    type layoutType = { id: number; selected: boolean };
    const initialLayouts: layoutType[] = [];
    const [layouts, setLayouts] = useState(initialLayouts);
    const [pinType, setPinType] = useState<number | null>(null);
    const [pin, setPin] = useState<string | null>(pinDefaultValue || '');
    const [dashboardMonitorMode, setDashboardMonitorMode] = useState<
        number | null
    >(mode || defaultSwitchModeValue);
    const [devicePins, setDevicePins] = useState<PinItem[]>([]);
    const [sensorValue, setSensorValue] = useState<number | null>(null);
    const [row, setRow] = useState<number>(rowDefaultValue || 1);
    const [column, setColumn] = useState<number>(columnDefaultValue || 1);
    const [lineChartModeValue, setLineChartModeValue] = useState<
        number | undefined
    >(undefined);
    const [currentValueModeValue, setCurrentValueModeValue] = useState<
        number | undefined
    >(undefined);
    const [switchModeValue, setSwitchModeValue] = useState<number>(
        defaultSwitchModeValue
    );
    const [isValidedForm, setIsValidedForm] = useState<boolean>(false);
    const [customTitle, setCustomTitle] = useState<string>(
        customTitleDefaultValue || ''
    );

    const {
        fetchApi: createDashboardMonitorApi,
        data: responseOfCreateDashboardMonitor,
    } = useCreateDashboardMonitorApi({
        deviceId: deviceId || 0,
        pin: pin || '',
        groupId: groupId,
        mode:
            dashboardMonitorMode === null
                ? switchModeValue
                : dashboardMonitorMode,
        row,
        column,
        customTitle,
    });

    const { getDevicePinsApi: getDevicePins } = useGetDevicePinsApi({
        id: deviceId || 0,
        pinType: undefined,
    });

    const { fetchApi: getGroupDevicePins } = useGetGroupDevicePinsApi({
        deviceId: deviceId || 0,
        groupId: groupId || 0,
    });

    const {
        fetchApi: updateDashboardMonitorApi,
        data: responseOfUpdateDashboardMonitor,
    } = useUpdateDashboardMonitorApi({
        deviceId: deviceId || 0,
        id: id || 0,
        pin: pin || '',
        groupId: groupId,
        mode:
            dashboardMonitorMode === null
                ? switchModeValue
                : dashboardMonitorMode,
        row,
        column,
        customTitle,
    });

    const { getDashboardMonitorModesApi } = useGetDashboardMonitorModesApi();

    useEffect(() => {
        setLayouts([
            { id: 0, selected: (columnDefaultValue || 1) >= 0 },
            { id: 1, selected: (columnDefaultValue || 1) >= 1 },
            { id: 2, selected: (columnDefaultValue || 1) >= 2 },
        ]);

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!deviceId) {
            return;
        }
        if (!groupId) {
            getDevicePins();
        } else {
            getGroupDevicePins();
        }
        // eslint-disable-next-line
    }, [deviceId, groupId]);

    useEffect(() => {
        if (layouts.length === 0) {
            return;
        }
        selectLayoutSize((columnDefaultValue || 1) - 1);
        // eslint-disable-next-line
    }, [columnDefaultValue]);

    useEffect(() => {
        setCustomTitle(customTitleDefaultValue || '');
        // eslint-disable-next-line
    }, [customTitleDefaultValue]);

    useEffect(() => {
        setPin(pinDefaultValue || '');
        // eslint-disable-next-line
    }, [pinDefaultValue]);

    useEffect(() => {
        setDashboardMonitorMode(mode === undefined ? null : mode);
    }, [mode]);

    useEffect(() => {
        if (dashboardMonitorModes && dashboardMonitorModes.length > 0) {
            setCurrentValueModeValue(
                dashboardMonitorModes.find(
                    (item) => item.key === MONITOR_MODE.CURRENT_VALUE
                )?.value
            );
            setLineChartModeValue(
                dashboardMonitorModes.find(
                    (item) => item.key === MONITOR_MODE.LINE_CHART
                )?.value
            );
            setSwitchModeValue(
                dashboardMonitorModes.find(
                    (item) => item.key === MONITOR_MODE.SWITCH
                )?.value || 2
            );
            return;
        }
        getDashboardMonitorModesApi();
        // eslint-disable-next-line
    }, [dashboardMonitorModes]);

    useEffect(() => {
        if (!devicePins || !deviceModes) {
            return;
        }

        // eslint-disable-next-line
        const sensorValue = deviceModes.filter((item) => {
            return item.key === PIN_TYPES.SENSOR;
        })[0]?.value;
        setSensorValue(sensorValue);
    }, [deviceModes, devicePins]);

    useEffect(() => {
        if (!devicePinsPool) {
            return;
        }

        setDevicePins(
            devicePinsPool.filter((item) => item.deviceId === deviceId)
        );
        // eslint-disable-next-line
    }, [devicePinsPool, deviceId]);

    useEffect(() => {
        const targetPin = devicePins.find((item) => item.pin === pin);
        setPinType(targetPin ? targetPin.pinType : null);
        // eslint-disable-next-line
    }, [pin]);

    useEffect(() => {
        if (responseOfCreateDashboardMonitor) {
            close();
            dispatch(
                toasterActions.pushOne({
                    message: '成功新增監控看板',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [responseOfCreateDashboardMonitor]);

    useEffect(() => {
        if (responseOfUpdateDashboardMonitor) {
            close();
            dispatch(
                toasterActions.pushOne({
                    message: '成功更新監控看板',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [responseOfUpdateDashboardMonitor]);

    useEffect(() => {
        valid();
        // eslint-disable-next-line
    }, [layouts, pinType, dashboardMonitorMode]);

    const close = () => {
        if (promptInputRef.current) {
            promptInputRef.current.value = '';
        }
        dispatch(monitorConfigDialogActions.close());
    };

    const selectLayoutSize = (id: number) => {
        const columnNum = 3;
        const targetColumn = (id % columnNum) + 1;
        const targetRow = 1;
        setRow(targetRow);
        setColumn(targetColumn);
        const newLayout = [...layouts];
        newLayout.forEach((item: any) => {
            item.selected = false;
            if (
                (item.id % columnNum) + 1 <= targetColumn &&
                Math.floor(item.id / columnNum) + 1 <= targetRow
            ) {
                item.selected = true;
            }
        });
        setLayouts(newLayout);
    };

    const selectPin = (event: ChangeEvent<HTMLSelectElement>) => {
        setPin(event.target.value ? event.target.value : null);
        setDashboardMonitorMode(null);
    };

    const selectMonitorMode = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = Number(event.target.value);
        setDashboardMonitorMode(isNaN(value) ? null : value);
    };

    const submit = () => {
        if (id) {
            updateDashboardMonitorApi();
        } else {
            createDashboardMonitorApi();
        }
    };

    const valid = () => {
        const sensorModeValue = deviceModes.find(
            (item) => item.key === PIN_TYPES.SENSOR
        )?.value;

        if (pin === null) {
            setIsValidedForm(false);
            return;
        }

        if (pinType === sensorModeValue && dashboardMonitorMode === null) {
            setIsValidedForm(false);
            return;
        }

        setIsValidedForm(true);
    };

    return (
        <div
            className={`monitor-config-dialog dialog position-fixed top-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 ${
                isOpen ? '' : 'd-none'
            }`}
        >
            <div className="text-black bg-white card">
                <h3 className="mb-0">新增監控版面</h3>
                <hr />
                <h4 className="mt-3">版面大小</h4>
                <div className="row">
                    {layouts.map((element: any) => (
                        <div
                            key={element.id}
                            className={`col-4 bg-primary-300 border border-3 border-white ${
                                element.selected ? '' : 'bg-opacity-25'
                            }`}
                            onClick={() => {
                                selectLayoutSize(element.id);
                            }}
                        />
                    ))}
                </div>
                <div className="row mt-3">
                    <div className="col-12 px-0">
                        <select
                            className="form-control form-select"
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                selectPin(e);
                            }}
                            value={pin || ''}
                        >
                            <option value="">請選擇 PIN</option>
                            {devicePins.map(({ id, pin, name }) => (
                                <option key={id} value={pin}>
                                    {name || pin}{' '}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-12 px-0">
                        <input
                            type="text"
                            className="form-control"
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                setCustomTitle(event.currentTarget.value);
                            }}
                            value={customTitle}
                            placeholder="自定義面板名稱"
                        />
                    </div>
                </div>
                <div
                    className={`row mt-4 ${
                        pinType === sensorValue ? '' : 'd-none'
                    }`}
                >
                    <div className="col-12 px-0">
                        <select
                            className="form-control form-select"
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                selectMonitorMode(e);
                            }}
                            value={
                                dashboardMonitorMode != null
                                    ? dashboardMonitorMode
                                    : ''
                            }
                        >
                            <option value="">請選擇監控類型</option>
                            <option value={currentValueModeValue}>
                                當前數值
                            </option>
                            <option value={lineChartModeValue}>折線圖</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 px-0 d-flex justify-content-center">
                        <button
                            className="btn btn-lg rounded-pill mt-3 py-3 border-1 border-grey-300 mx-0"
                            onClick={() => {
                                submit();
                            }}
                            disabled={!isValidedForm}
                        >
                            {id ? '修改' : '新增'}
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

export default MonitorConfigDialog;
