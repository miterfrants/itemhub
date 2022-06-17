import { DEVICE_MODE } from '@/constants/device-mode';
import { useCreateDashboardMonitorApi } from '@/hooks/apis/dashboard-monitor.hook';
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

const MonitorConfigDialog = () => {
    const dialog = useAppSelector(selectMonitorConfigDialog);
    const devicePinsPool: PinItem[] | null = useAppSelector(selectDevicePins);
    const { deviceModes } = useAppSelector(selectUniversal);

    const { isOpen, deviceId } = dialog;

    const dispatch = useDispatch();

    const promptInputRef = useRef<HTMLInputElement>(null);
    type layoutType = { id: number; selected: boolean };
    const initialLayouts: layoutType[] = [];
    const [layouts, setLayouts] = useState(initialLayouts);
    const [pinMode, setPinMode] = useState<number | null>(null);
    const [pin, setPin] = useState<string | null>(null);
    const [dashboardMonitorMode, setDashboardMonitorMode] = useState<
        number | null
    >(null);
    const [devicePins, setDevicePins] = useState<PinItem[]>([]);
    const [sensorValue, setSensorValue] = useState<number | null>(null);
    const [row, setRow] = useState<number>(1);
    const [column, setColumn] = useState<number>(1);

    const { fetchApi: createDashboardMonitorApi } =
        useCreateDashboardMonitorApi({
            deviceId: deviceId || 0,
            pin: pin || '',
            mode: dashboardMonitorMode || 0,
            row,
            column,
        });

    useEffect(() => {
        setLayouts([
            { id: 0, selected: true },
            { id: 1, selected: false },
            { id: 2, selected: false },
            { id: 3, selected: false },
            { id: 4, selected: false },
            { id: 5, selected: false },
        ]);
    }, []);

    useEffect(() => {
        if (!devicePins || !deviceModes) {
            return;
        }

        // eslint-disable-next-line
        const sensorValue = deviceModes.filter((item) => {
            return item.key === DEVICE_MODE.SENSOR;
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
        setPinMode(null);
        setPin(null);
        setDashboardMonitorMode(null);
    }, [isOpen]);

    const close = () => {
        if (promptInputRef.current) {
            promptInputRef.current.value = '';
        }
        dispatch(monitorConfigDialogActions.close());
    };

    const selectLayoutSize = (id: number) => {
        const columnNum = 3;
        const targetColumn = id % columnNum;
        const targetRow = Math.floor(id / columnNum) + 1;
        setRow(targetRow);
        setColumn(targetColumn + 1);
        const newLayout = [...layouts];
        newLayout.forEach((item: any) => {
            item.selected = false;
            if (
                item.id % columnNum <= targetColumn &&
                Math.floor(item.id / columnNum) + 1 <= targetRow
            ) {
                item.selected = true;
            }
        });
        setLayouts(newLayout);
    };

    const selectPin = (event: ChangeEvent<HTMLSelectElement>) => {
        setPin(event.target.value ? event.target.value : null);
        const targetPin = devicePins.find(
            (item) => item.pin === event.target.value
        );
        if (targetPin) {
            setPinMode(targetPin.mode);
        }
        setDashboardMonitorMode(null);
    };

    const selectMonitorMode = (event: ChangeEvent<HTMLSelectElement>) => {
        setDashboardMonitorMode(
            event.target.value ? Number(event.target.value) : null
        );
    };

    const submit = () => {
        createDashboardMonitorApi();
    };

    return (
        <div
            className={`monitor-config-dialog dialog position-fixed top-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 ${
                isOpen ? '' : 'd-none'
            }`}
        >
            <div className="text-black bg-white card">
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

                <div className="row mt-4">
                    <div className="col-12 px-0">
                        <select
                            className="form-control"
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                selectPin(e);
                            }}
                        >
                            <option />
                            {devicePins.map(({ id, pin, name }) => (
                                <option key={id} value={pin}>
                                    {name || pin}{' '}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div
                    className={`row mt-4 ${
                        pinMode === sensorValue ? '' : 'd-none'
                    }`}
                >
                    <div className="col-12 px-0">
                        <select
                            className="form-control"
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                selectMonitorMode(e);
                            }}
                        >
                            <option selected={dashboardMonitorMode === null} />
                            <option
                                selected={dashboardMonitorMode === 0}
                                value="0"
                            >
                                當前數值
                            </option>
                            <option
                                selected={dashboardMonitorMode === 1}
                                value="1"
                            >
                                折線圖
                            </option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 px-0">
                        <button
                            className="btn btn-lg rounded-pill mt-3 py-3 border-1 border-grey-300 mx-0"
                            onClick={() => {
                                submit();
                            }}
                        >
                            新增
                        </button>
                    </div>
                </div>

                <div
                    onClick={() => {
                        close();
                    }}
                    className="position-absolute top-0 btn-close"
                    role="button"
                />
            </div>
        </div>
    );
};

export default MonitorConfigDialog;
