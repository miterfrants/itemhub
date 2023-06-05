import { useEffect, useState } from 'react';
import { PipelineItemType } from '@/types/pipeline.type';
import { useGetAllDevicesApi } from '@/hooks/apis/devices.hook';
import { selectDevices } from '@/redux/reducers/devices.reducer';
import { useAppSelector } from '@/hooks/redux.hook';
import { DeviceItem } from '@/types/devices.type';
import AutocompletedSearch from '../inputs/autocompleted-search/autocompleted-search';
import { KeyValuePair } from '@/types/common.type';
import { UniversalOption } from '@/types/universal.type';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { useGetTriggerOperatorsApi } from '@/hooks/apis/universal.hook';

interface PipelineCheckLastActivity {
    deviceId?: number;
    operator?: number;
    minutes?: number;
}

const CheckLastOnlinePipelineItem = ({
    pipelineItem,
    onChangedCallback,
}: {
    pipelineItem: PipelineItemType;
    onChangedCallback: (value: string) => void;
}) => {
    const [validation, setValidation] = useState({
        deviceId: {
            errorMessage: '',
            invalid: false,
        },
    });

    const [state, setState] = useState<PipelineCheckLastActivity | null>(null);
    const allDevices: DeviceItem[] = useAppSelector(selectDevices).devices;
    const { getAllDevicesApi } = useGetAllDevicesApi();
    const { triggerOperators, pipelineDeviceStaticMethods } =
        useAppSelector(selectUniversal);
    const { getTriggerOperatorsApi } = useGetTriggerOperatorsApi();

    useEffect(() => {
        getAllDevicesApi();
        // eslint-disable-next-line
    }, []);

    const validate = (state: PipelineCheckLastActivity) => {
        let result = true;
        const newValidation = { ...validation };
        if (!state.deviceId) {
            result = false;
            newValidation.deviceId.errorMessage = '裝置為必選欄位';
            newValidation.deviceId.invalid = true;
        } else {
            newValidation.deviceId.errorMessage = '';
            newValidation.deviceId.invalid = false;
        }
        setValidation(newValidation);
        return result;
    };

    useEffect(() => {
        if (!triggerOperators) {
            getTriggerOperatorsApi();
            return;
        }
        // eslint-disable-next-line
    }, [triggerOperators]);

    useEffect(() => {
        if (!pipelineItem || !pipelineItem.value) {
            return;
        }
        setState(JSON.parse(pipelineItem.value) as PipelineCheckLastActivity);
    }, [pipelineItem]);

    useEffect(() => {
        if (
            !state ||
            !validate(state) ||
            pipelineItem.value === JSON.stringify(state)
        ) {
            return;
        }
        onChangedCallback(JSON.stringify(state));
        // eslint-disable-next-line
    }, [state]);

    return (
        <div className="sensor-pipeline-item">
            <label className="mt-3">
                <div>裝置:</div>
                <AutocompletedSearch
                    datalistId="裝置"
                    placeholder="請輸入裝置名稱搜尋"
                    isError={validation.deviceId.invalid}
                    errorMessage="請輸入裝置名稱"
                    defaultValue={state?.deviceId}
                    isDisabled={pipelineItem?.isRun || false}
                    onValueChanged={(newValue: number | string | undefined) => {
                        setState({
                            ...state,
                            deviceId: newValue ? Number(newValue) : undefined,
                        });
                    }}
                    allSuggestions={(allDevices || []).map(
                        ({ name, id }) =>
                            ({
                                key: name,
                                value: id,
                            } as KeyValuePair)
                    )}
                />
            </label>

            <label className="mt-3 d-block">
                <div>最後一次上線時間:</div>
                <div className="input-group">
                    <select
                        className="form-control form-select input-group-prepend"
                        onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>
                        ) => {
                            setState({
                                ...state,
                                operator:
                                    event.currentTarget.value !== ''
                                        ? Number(event.currentTarget.value)
                                        : undefined,
                            });
                        }}
                        value={state?.operator}
                        disabled={pipelineItem?.isRun}
                    >
                        <option />
                        {triggerOperators.map((operator: UniversalOption) => {
                            return (
                                <option
                                    key={operator.key}
                                    value={operator.value}
                                >
                                    {operator.label}
                                </option>
                            );
                        })}
                    </select>
                    <input
                        className="form-control nodrag"
                        type="number"
                        placeholder="分鐘"
                        defaultValue={state?.minutes}
                        onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                minutes:
                                    event.currentTarget.value !== ''
                                        ? Number(event.currentTarget.value)
                                        : undefined,
                            });
                        }}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                minutes:
                                    event.currentTarget.value !== ''
                                        ? Number(event.currentTarget.value)
                                        : undefined,
                            });
                        }}
                        disabled={pipelineItem?.isRun}
                    />
                </div>
            </label>
        </div>
    );
};

export default CheckLastOnlinePipelineItem;
