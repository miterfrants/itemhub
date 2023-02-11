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
    const [state, setState] = useState(value || '');
    const validate = (state: string) => {
        return true;
    };
    useEffect(() => {
        if (pipelineItem.value === state) {
            return;
        }
        if (!state) {
            return;
        }
        if (!validate(state)) {
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
                            setState(event.currentTarget.value);
                        }}
                        onKeyDown={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            event.stopPropagation();
                        }}
                    />
                    <div className="input-group-append">
                        <span className="input-group-text">分鐘</span>
                    </div>
                </div>
            </label>
        </div>
    );
};

export default DelayPipelineItem;
