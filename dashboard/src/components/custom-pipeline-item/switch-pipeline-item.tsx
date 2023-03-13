import { useEffect, useState } from 'react';
import DeviceAndPinInputs from '../inputs/device-and-pin-input/device-and-pin-input';
import { PipelineItemType } from '@/types/pipeline.type';

interface PipelineSwitch {
    deviceId?: number;
    pin?: string;
    status?: number;
}

const SwitchPipelineItem = ({
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
        pin: {
            errorMessage: '',
            invalid: false,
        },
        status: {
            errorMessage: '',
            invalid: false,
        },
    });

    const [state, setState] = useState<PipelineSwitch | null>(null);

    const validate = (state: PipelineSwitch) => {
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
        if (state.status === undefined) {
            result = false;
            newValidation.status.errorMessage = '控制為必選欄位';
            newValidation.status.invalid = true;
        } else {
            newValidation.status.errorMessage = '';
            newValidation.status.invalid = false;
        }

        setValidation(newValidation);
        return result;
    };

    useEffect(() => {
        if (!pipelineItem || !pipelineItem.value) {
            return;
        }
        setState(JSON.parse(pipelineItem.value) as PipelineSwitch);
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
                <div>開關:</div>
                <DeviceAndPinInputs
                    isDeviceNameError={validation.deviceId.invalid}
                    deviceNameLabel="裝置"
                    isPinError={validation.pin.invalid}
                    pinLabel="裝置 Pin"
                    defaultPinValue={state?.pin || ''}
                    defaultDeviceId={state?.deviceId || 0}
                    isDisabled={pipelineItem?.isRun || false}
                    switchOnly
                    updatePin={(newPin) => {
                        setState({ ...state, pin: newPin });
                    }}
                    updateDeviceId={(newDeviceId) => {
                        setState({ ...state, deviceId: newDeviceId, pin: '' });
                    }}
                />
            </label>
            <label className="mt-3 d-block">
                <div>控制:</div>
                <select
                    className="form-control form-select"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        setState({
                            ...state,
                            status:
                                event.currentTarget.value !== ''
                                    ? Number(event.currentTarget.value || 1)
                                    : undefined,
                        });
                    }}
                    value={state?.status}
                    disabled={pipelineItem?.isRun}
                >
                    <option />
                    <option value="1">開</option>
                    <option value="0">關</option>
                </select>
            </label>
            {validation.status.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.status.errorMessage}
                </div>
            )}
        </div>
    );
};

export default SwitchPipelineItem;
