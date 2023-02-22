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
            errrorMessage: '',
            invalid: false,
        },
        staticMethod: {
            errrorMessage: '',
            invalid: false,
        },
        operator: {
            errrorMessage: '',
            invalid: false,
        },
        threshold: {
            errrorMessage: '',
            invalid: false,
        },
    });

    const validate = (state: PipelineSensor) => {
        return true;
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
            pipelineItem.value === JSON.stringify(state) ||
            !validate(state)
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
                    isDisabled={false}
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
                        className="form-control"
                        type="number"
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                lastRows: Number(event.currentTarget.value),
                            });
                        }}
                        onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                lastRows: Number(event.currentTarget.value),
                            });
                        }}
                    />
                    <div className="input-group-append">
                        <span className="input-group-text">筆</span>
                    </div>
                    <select
                        className="form-control"
                        onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>
                        ) => {
                            setState({
                                ...state,
                                staticMethod: Number(event.currentTarget.value),
                            });
                        }}
                    >
                        <option />
                        {pipelineDeviceStaticMethods.map(
                            (item: UniversalOption) => {
                                return (
                                    <option
                                        key={item.key}
                                        value={item.value}
                                        selected={
                                            item.value === state?.staticMethod
                                        }
                                    >
                                        {item.label}
                                    </option>
                                );
                            }
                        )}
                    </select>
                </div>
            </label>
            <label className="mt-3 d-block">
                <div>條件:</div>
                <div className="input-group">
                    <select
                        className="form-control input-group-prepend"
                        onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>
                        ) => {
                            setState({
                                ...state,
                                operator: Number(event.currentTarget.value),
                            });
                        }}
                    >
                        {triggerOperators.map((operator: UniversalOption) => {
                            return (
                                <option
                                    key={operator.key}
                                    value={operator.value}
                                    selected={
                                        state?.operator === operator.value
                                    }
                                >
                                    {operator.label}
                                </option>
                            );
                        })}
                    </select>
                    <input
                        className="form-control"
                        type="number"
                        placeholder="感測器數值"
                        defaultValue={state?.threshold}
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                threshold: Number(event.currentTarget.value),
                            });
                        }}
                        onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                threshold: Number(event.currentTarget.value),
                            });
                        }}
                    />
                </div>
            </label>
        </div>
    );
};

export default SensorPipelineItem;
