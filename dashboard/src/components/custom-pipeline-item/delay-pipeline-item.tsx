import { PipelineItemType } from '@/types/pipeline.type';
import { useEffect, useState } from 'react';

const DelayPipelineItem = ({
    pipelineItem,
    onChangedCallback,
}: {
    pipelineItem: PipelineItemType;
    onChangedCallback: (value: string) => void;
}) => {
    const { value } = pipelineItem;
    const [state, setState] = useState(value || undefined);
    const [validated, setValidated] = useState(true);
    const validate = (state: string | undefined) => {
        const delayMinutes = Number(state);
        if (
            !delayMinutes ||
            delayMinutes <= 0 ||
            state !== Math.round(delayMinutes).toString()
        ) {
            setValidated(false);
            return false;
        }
        setValidated(true);
        return true;
    };
    useEffect(() => {
        if (!validate(state) || pipelineItem.value === state) {
            return;
        }
        if (!state) {
            return;
        }
        onChangedCallback(state);
        // eslint-disable-next-line
    }, [state]);
    return (
        <div className="delay-pipeline-item">
            <label className="mt-3">
                <div>Delay 時間:</div>
                <div className="input-group">
                    <input
                        className="form-control"
                        type="number"
                        placeholder=""
                        defaultValue={state}
                        onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            event.stopPropagation();
                            setState(
                                event.currentTarget.value === ''
                                    ? undefined
                                    : event.currentTarget.value
                            );
                        }}
                        disabled={pipelineItem?.isRun}
                    />
                    <div className="input-group-append">
                        <span className="input-group-text">分鐘</span>
                    </div>
                </div>
            </label>
            {!validated && (
                <div className="text-danger mt-15 fs-5">
                    延遲分鐘必須為大於零的整數
                </div>
            )}
        </div>
    );
};

export default DelayPipelineItem;
