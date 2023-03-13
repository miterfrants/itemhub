import {
    useGetPipelineStaticMethods,
    useGetTriggerOperatorsApi,
} from '@/hooks/apis/universal.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { useEffect, useState } from 'react';
import { UniversalOption } from '@/types/universal.type';
import { PipelineItemType } from '@/types/pipeline.type';
import DeviceAndPinInputs from '../inputs/device-and-pin-input/device-and-pin-input';

interface PipelineSensor {
    deviceId?: number;
    pin?: string;
    lastRows?: number;
    staticMethod?: number;
    operator?: number;
    threshold?: number;
}

const SensorPipelineItem = ({
    pipelineItem,
    onChangedCallback,
}: {
    pipelineItem: PipelineItemType;
    onChangedCallback: (value: string) => void;
}) => {
    const { getTriggerOperatorsApi } = useGetTriggerOperatorsApi();
    const [state, setState] = useState<PipelineSensor | null>(null);
    const { fetchApi: getPipelineStaticMethods } =
        useGetPipelineStaticMethods();
    const { triggerOperators, pipelineDeviceStaticMethods } =
        useAppSelector(selectUniversal);
    const [validation, setValidation] = useState({
        deviceId: {
            errorMessage: '',
            invalid: false,
        },
        pin: {
            errorMessage: '',
            invalid: false,
        },
        lastRows: {
            errorMessage: '',
            invalid: false,
        },
        staticMethod: {
            errorMessage: '',
            invalid: false,
        },
        operator: {
            errorMessage: '',
            invalid: false,
        },
        threshold: {
            errorMessage: '',
            invalid: false,
        },
    });

    const validate = (state: PipelineSensor) => {
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
        if (!state.pin) {
            result = false;
            newValidation.pin.errorMessage = '裝置 PIN 為必選欄位';
            newValidation.pin.invalid = true;
        } else {
            newValidation.pin.errorMessage = '';
            newValidation.pin.invalid = false;
        }
        if (!state.lastRows) {
            result = false;
            newValidation.lastRows.errorMessage = '最後 n 筆資料為必填欄位';
            newValidation.lastRows.invalid = true;
        } else if (state.lastRows <= 0) {
            result = false;
            newValidation.lastRows.errorMessage = '最後 n 筆資料不能小於零';
            newValidation.lastRows.invalid = true;
        } else {
            newValidation.lastRows.errorMessage = '';
            newValidation.lastRows.invalid = false;
        }

        if (state.staticMethod === undefined) {
            result = false;
            newValidation.staticMethod.errorMessage = '統計方式為必填欄位';
            newValidation.staticMethod.invalid = true;
        } else {
            newValidation.staticMethod.errorMessage = '';
            newValidation.staticMethod.invalid = false;
        }

        if (state.operator === undefined) {
            result = false;
            newValidation.operator.errorMessage = '條件比較欄位為必填欄位';
            newValidation.operator.invalid = true;
        } else {
            newValidation.operator.errorMessage = '';
            newValidation.operator.invalid = false;
        }

        if (state.threshold === undefined) {
            result = false;
            newValidation.threshold.errorMessage = '感測器數值欄位為必填欄位';
            newValidation.threshold.invalid = true;
        } else {
            newValidation.threshold.errorMessage = '';
            newValidation.threshold.invalid = false;
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
        if (pipelineDeviceStaticMethods.length === 0) {
            getPipelineStaticMethods();
            return;
        }
        // eslint-disable-next-line
    }, [pipelineDeviceStaticMethods]);

    useEffect(() => {
        if (!pipelineItem || !pipelineItem.value) {
            return;
        }
        setState(JSON.parse(pipelineItem.value) as PipelineSensor);
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
            <label className="mt-3 d-block">
                <div>感測器:</div>
                <DeviceAndPinInputs
                    isDeviceNameError={validation.deviceId.invalid}
                    deviceNameLabel="裝置"
                    isPinError={validation.pin.invalid}
                    pinLabel="裝置 Pin"
                    defaultPinValue={state?.pin || ''}
                    defaultDeviceId={state?.deviceId || 0}
                    isDisabled={pipelineItem?.isRun || false}
                    sensorOnly
                    updatePin={(newPin) => {
                        setState({
                            ...state,
                            pin: newPin,
                        });
                    }}
                    updateDeviceId={(newDeviceId) => {
                        setState({
                            ...state,
                            deviceId: newDeviceId,
                        });
                    }}
                />
            </label>
            <label className="mt-3 d-block">
                <div>統計方式</div>
                <div className="input-group">
                    <div className="input-group-prepend">
                        <span className="input-group-text">最後</span>
                    </div>
                    <input
                        defaultValue={state?.lastRows}
                        type="number"
                        className="form-control nodrag"
                        onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                lastRows:
                                    event.currentTarget.value !== ''
                                        ? Number(event.currentTarget.value)
                                        : undefined,
                            });
                        }}
                        disabled={pipelineItem?.isRun}
                    />
                    <div className="input-group-append">
                        <span className="input-group-text">筆</span>
                    </div>
                    <select
                        className="form-control form-select"
                        onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>
                        ) => {
                            setState({
                                ...state,
                                staticMethod:
                                    event.currentTarget.value !== ''
                                        ? Number(event.currentTarget.value)
                                        : undefined,
                            });
                        }}
                        value={state?.staticMethod}
                        disabled={pipelineItem?.isRun}
                    >
                        <option />
                        {pipelineDeviceStaticMethods.map(
                            (item: UniversalOption) => {
                                return (
                                    <option key={item.key} value={item.value}>
                                        {item.label}
                                    </option>
                                );
                            }
                        )}
                    </select>
                </div>
            </label>
            {validation.lastRows.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.lastRows.errorMessage}
                </div>
            )}

            {validation.staticMethod.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.staticMethod.errorMessage}
                </div>
            )}
            <label className="mt-3 d-block">
                <div>條件:</div>
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
                        placeholder="感測器數值"
                        defaultValue={state?.threshold}
                        onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                threshold:
                                    event.currentTarget.value !== ''
                                        ? Number(event.currentTarget.value)
                                        : undefined,
                            });
                        }}
                        disabled={pipelineItem?.isRun}
                    />
                </div>
            </label>
            {validation.operator.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.operator.errorMessage}
                </div>
            )}

            {validation.threshold.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.threshold.errorMessage}
                </div>
            )}
        </div>
    );
};

export default SensorPipelineItem;
