import PageTitle from '@/components/page-title/page-title';
import Spinner from '@/components/spinner/spinner';
import { useGetDeviceApi } from '@/hooks/apis/devices.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import { DeviceItem, PinItem } from '@/types/devices.type';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ScriptableContext,
    ChartOptions,
} from 'chart.js';
import { InnerYAxesTicks } from '@/chart-plugins/inner-y-axes-ticks';
import { InnerXAxesTicks } from '@/chart-plugins/inner-x-axes-ticks';
import { useGetDevicePinApi } from '@/hooks/apis/device-pin.hook';
import {
    useGetSensorLogsAggregateApi,
    useGetSensorLogsApi,
} from '@/hooks/apis/sensor-logs.hook';
import lineChartOption from '@/constants/line-chart-options';
import moment from 'moment';
import { useGetPipelineStaticMethods } from '@/hooks/apis/universal.hook';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { UniversalOption } from '@/types/universal.type';
import {
    useGetGroupDevicePinApi,
    useGetGroupSensorLogsAggregateApi,
    useGetGroupSensorLogsApi,
} from '@/hooks/apis/group-device-pin.hook';
import { selectGroupDevices } from '@/redux/reducers/group-devices.reducer';
import { useGetGroupDeviceApi } from '@/hooks/apis/group-devices.hook';

const DevicePinStatistics = () => {
    const { id: idFromUrl, pin, groupId } = useParams();
    const [device, setDevice] = useState<DeviceItem | null>(null);
    const devices = useAppSelector(
        groupId ? selectGroupDevices : selectDevices
    ).devices;
    const [statisticalMethods, setstatisticalMethods] = useState<
        number | undefined
    >(0);
    const [aggregateNumber, setAggregateNumber] = useState<number | undefined>(
        undefined
    );

    const [startAt, setStartAt] = useState<string | undefined>(
        moment().add(-30, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    );
    const [endAt, setEndAt] = useState<string | undefined>(undefined);

    const { isLoading: isGetting, fetchApi: getDeviceApi } = useGetDeviceApi(
        Number(idFromUrl)
    );

    const { isLoading: isGettingGroupDevice, fetchApi: getGroupDeviceApi } =
        useGetGroupDeviceApi({
            deviceId: Number(idFromUrl),
            groupId: Number(groupId || 0),
        });
    const { fetchApi: getSensorLogsAggregate, data: aggregateData } =
        useGetSensorLogsAggregateApi({
            deviceId: Number(idFromUrl),
            pin: pin || '',
            startAt: startAt,
            endAt: endAt,
            statisticalMethods: statisticalMethods,
        });
    const { fetchApi: getGroupSensorLogsAggregate, data: groupAggregateData } =
        useGetGroupSensorLogsAggregateApi({
            groupId: Number(groupId || 0),
            deviceId: Number(idFromUrl),
            pin: pin || '',
            startAt: startAt,
            endAt: endAt,
            statisticalMethods: statisticalMethods,
        });
    const { fetchApi: getDevicePin } = useGetDevicePinApi({
        id: Number(idFromUrl),
        pin: pin || '',
    });

    const { fetchApi: getGroupDevicePin } = useGetGroupDevicePinApi({
        deviceId: Number(idFromUrl),
        groupId: Number(groupId || 0),
        pin: pin || '',
    });
    const [devicePin] = useState<PinItem | null>(null);
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [xAxisTicks, setXAxisTicks] = useState<any[]>([]);
    const [sensorLogIds, setSensorLogIds] = useState<number[]>([]);

    const breadcrumbs = [
        {
            label: '裝置列表',
            pathName: groupId
                ? `/dashboard/groups/${groupId}/devices`
                : '/dashboard/devices',
        },
    ];

    if (!groupId) {
        breadcrumbs.push({
            label: '裝置詳細頁',
            pathName: `/dashboard/devices/${idFromUrl}`,
        });
    }

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        Tooltip,
        Filler,
        Legend,
        InnerYAxesTicks,
        InnerXAxesTicks
    );

    const {
        data: responseOfSensorLogs,
        fetchApi: getSensorLogs,
        isLoading,
    } = useGetSensorLogsApi({
        deviceId: Number(idFromUrl),
        pin: pin || '',
        page: 1,
        limit: 10000,
        startAt: startAt,
        endAt: endAt,
    });

    const {
        data: responseOfGroupSensorLogs,
        fetchApi: getGroupSensorLogs,
        isLoading: isGettingGroupSesnorLogs,
    } = useGetGroupSensorLogsApi({
        groupId: Number(groupId || 0),
        deviceId: Number(idFromUrl),
        pin: pin || '',
        page: 1,
        limit: 10000,
        startAt: startAt,
        endAt: endAt,
    });

    const options: ChartOptions = {
        ...lineChartOption,
        plugins: {
            ...lineChartOption.plugins,
            title: {
                ...lineChartOption.plugins?.title,
                text: '',
            },
        },
        scales: {
            ...lineChartOption.scales,
            y: {
                ...lineChartOption.scales?.y,
                min: Math.min(...lineChartData) - 3,
            },
            x: {
                ...lineChartOption.scales?.x,
                ticks: {
                    ...lineChartOption.scales?.x?.ticks,
                    callback: (val: any, index: number, c: any) => {
                        const createdAt = xAxisTicks[index];
                        const step = Math.floor(c.length / 5);
                        const halfStep = Math.floor(step / 2);
                        const time = `${createdAt
                            .getHours()
                            .toString()
                            .padStart(2, '0')}:${createdAt
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')}`;
                        const date = `${(createdAt.getMonth() + 1)
                            .toString()
                            .padStart(2, '0')}/${createdAt
                            .getDate()
                            .toString()
                            .padStart(2, '0')}`;
                        const text = `${date} ${time}`;
                        return index !== 0 && index % step === halfStep
                            ? text
                            : '';
                    },
                },
            },
        },
    };

    const { fetchApi: getPipelineStaticMethods } =
        useGetPipelineStaticMethods();
    const { pipelineDeviceStaticMethods } = useAppSelector(selectUniversal);

    const back = () => {
        history.back();
    };

    useEffect(() => {
        if (groupId) {
            getGroupDevicePin();
            getGroupSensorLogs();
        } else {
            getDevicePin();
            getSensorLogs();
        }

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (groupId) {
            setAggregateNumber(groupAggregateData || undefined);
        } else {
            setAggregateNumber(aggregateData || undefined);
        }
    }, [aggregateData, groupAggregateData]);

    useEffect(() => {
        if (!responseOfSensorLogs) {
            return;
        }
        responseOfSensorLogs.reverse();
        setLineChartData(responseOfSensorLogs.map((item) => item.value));
        setSensorLogIds(responseOfSensorLogs.map((item) => item.id));
        setXAxisTicks(
            responseOfSensorLogs.map((item) => {
                return new Date(item.createdAt);
            })
        );
    }, [responseOfSensorLogs]);

    useEffect(() => {
        if (!responseOfGroupSensorLogs) {
            return;
        }
        responseOfGroupSensorLogs.reverse();
        setLineChartData(responseOfGroupSensorLogs.map((item) => item.value));
        setSensorLogIds(responseOfGroupSensorLogs.map((item) => item.id));
        setXAxisTicks(
            responseOfGroupSensorLogs.map((item) => {
                return new Date(item.createdAt);
            })
        );
    }, [responseOfGroupSensorLogs]);

    useEffect(() => {
        const device =
            (devices || []).filter(
                (device: DeviceItem) => device.id === Number(idFromUrl)
            )[0] || null;
        setDevice(device);
        if (device === null && !groupId) {
            getDeviceApi();
        } else if (device === null && groupId) {
            getGroupDeviceApi();
        }
        // eslint-disable-next-line
    }, [devices]);

    useEffect(() => {
        if (pipelineDeviceStaticMethods.length === 0) {
            getPipelineStaticMethods();
            return;
        }
        // eslint-disable-next-line
    }, [pipelineDeviceStaticMethods]);

    useEffect(() => {
        if (sensorLogIds.length === 0 && !responseOfSensorLogs && !groupId) {
            return;
        }
        if (
            sensorLogIds.length === 0 &&
            !responseOfGroupSensorLogs &&
            groupId
        ) {
            return;
        }

        if (groupId) {
            getGroupSensorLogs();
        } else {
            getSensorLogs();
        }

        // eslint-disable-next-line
    }, [startAt, endAt]);

    useEffect(() => {
        if (groupId) {
            getGroupSensorLogsAggregate();
        } else {
            getSensorLogsAggregate();
        }

        // eslint-disable-next-line
    }, [startAt, endAt, statisticalMethods]);

    return (
        <div className="device-pin-statistics mx-auto">
            <PageTitle
                breadcrumbs={breadcrumbs}
                titleBackIconVisible
                titleClickCallback={back}
                title={`裝置 ${device ? device?.name : ''} ${pin} 統計`}
            />
            {isGetting || isGettingGroupDevice || device === null ? (
                <div />
            ) : (
                <div className="card p-4">
                    <div className="row m-0">
                        <div className="col-12 d-flex p-0 item">
                            <div className="line-chart border-0 border-sm-1  border-grey-200 rounded-3 w-100 h-100 overflow-hidden d-flex flex-column bg-white ">
                                <div className="d-flex flex-wrap align-items-center">
                                    <label className="col-5">
                                        <input
                                            className="form-control"
                                            type="datetime-local"
                                            defaultValue={startAt}
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                setStartAt(
                                                    moment(
                                                        event.currentTarget
                                                            .value
                                                    ).format('YYYY-MM-DD HH:mm')
                                                );
                                            }}
                                        />
                                    </label>
                                    <div className="col-1 text-center">~</div>
                                    <label className="col-5">
                                        <input
                                            className="form-control"
                                            type="datetime-local"
                                            defaultValue={endAt}
                                            onChange={(
                                                event: React.ChangeEvent<HTMLInputElement>
                                            ) => {
                                                setEndAt(
                                                    moment(
                                                        event.currentTarget
                                                            .value
                                                    ).format('YYYY-MM-DD HH:mm')
                                                );
                                            }}
                                        />
                                    </label>

                                    <div className="col-5 col-sm-3 mt-3 d-flex align-items-center">
                                        <select
                                            className="form-control form-select"
                                            value={statisticalMethods}
                                            onChange={(
                                                event: React.ChangeEvent<HTMLSelectElement>
                                            ) => {
                                                setstatisticalMethods(
                                                    Number(
                                                        event.currentTarget
                                                            .value
                                                    )
                                                );
                                            }}
                                        >
                                            <option />
                                            {pipelineDeviceStaticMethods.map(
                                                (item: UniversalOption) => {
                                                    return (
                                                        <option
                                                            key={item.key}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </option>
                                                    );
                                                }
                                            )}
                                        </select>

                                        <div className="ms-2 d-flex text-nowrap">
                                            :{' '}
                                            {aggregateNumber
                                                ? Math.round(
                                                      (aggregateNumber || 0) *
                                                          100
                                                  ) / 100
                                                : null}
                                        </div>
                                    </div>
                                </div>
                                {(!groupId && isLoading) ||
                                (groupId && isGettingGroupSesnorLogs) ? (
                                    <div className="w-100 d-flex align-items-center justify-content-center mt-5">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <div className="w-100 flex-grow-1">
                                        <div
                                            className={`d-flex flex-wrap align-items-center justify-content-center ${
                                                lineChartData.length === 0
                                                    ? ''
                                                    : 'd-none'
                                            }`}
                                        >
                                            <h2 className="mb-0 w-100 px-45 my-3 text-center">
                                                暫無資料
                                            </h2>
                                            <h3 className="mb-0 w-100 text-center px-45 my-3 d-flex align-items-center justify-content-center">
                                                <div
                                                    className={`dot rounded-circle flex-shirk-0 me-2 ${
                                                        devicePin?.device
                                                            ?.online
                                                            ? 'dot-green'
                                                            : 'dot-grey'
                                                    }`}
                                                />
                                                {devicePin?.device?.name} -{' '}
                                                {devicePin?.name}
                                            </h3>
                                        </div>
                                        <Line
                                            className={
                                                lineChartData.length > 0
                                                    ? ''
                                                    : 'd-none'
                                            }
                                            options={options}
                                            data={{
                                                labels: xAxisTicks,
                                                datasets: [
                                                    {
                                                        backgroundColor: (
                                                            context: ScriptableContext<'line'>
                                                        ) => {
                                                            const ctx =
                                                                context.chart
                                                                    .ctx;
                                                            const gradient =
                                                                ctx.createLinearGradient(
                                                                    0,
                                                                    0,
                                                                    0,
                                                                    300
                                                                );
                                                            gradient.addColorStop(
                                                                0,
                                                                'rgba(204, 233, 238, 0.7)'
                                                            );
                                                            gradient.addColorStop(
                                                                0.8,
                                                                'rgba(152, 214, 223, 1)'
                                                            );
                                                            return gradient;
                                                        },
                                                        fill: true,
                                                        label:
                                                            devicePin?.name ||
                                                            '',
                                                        data: lineChartData,
                                                        borderColor: '#51c7cf',
                                                        borderWidth: 1,
                                                        tension: 0.4,
                                                    },
                                                ],
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DevicePinStatistics;
