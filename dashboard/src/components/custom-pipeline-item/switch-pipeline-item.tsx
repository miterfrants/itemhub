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
        return true;
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
            <label className="mt-3">
                <div>開關:</div>
                <DeviceAndPinInputs
                    isDeviceNameError={validation.deviceId.invalid}
                    deviceNameLabel="裝置"
                    isPinError={validation.pin.invalid}
                    pinLabel="裝置 Pin"
                    defaultPinValue={state?.pin || ''}
                    defaultDeviceId={state?.deviceId || 0}
                    isDisabled={false}
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
                    className="form-control"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        setState({
                            ...state,
                            status: Number(event.currentTarget.value || 1),
                        });
                    }}
                >
                    <option value="1" selected={state?.status === 1}>
                        開
                    </option>
                    <option value="0" selected={state?.status === 0}>
                        關
                    </option>
                </select>
            </label>
        </div>
    );
};

export default SwitchPipelineItem;
