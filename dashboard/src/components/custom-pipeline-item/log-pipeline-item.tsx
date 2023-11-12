import { PipelineItemType } from '@/types/pipeline.type';
import { useEffect, useState } from 'react';

const LogPipelineItem = ({
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
        if (!state) {
            setValidated(false);
            return false;
        }
        return true;
    };
    useEffect(() => {
        if (!state) {
            return;
        }
        if (!validate(state) || pipelineItem.value === state) {
            return;
        }
        onChangedCallback(state);
        // eslint-disable-next-line
    }, [state]);
    return (
        <div className="delay-pipeline-item">
            <label className="mt-3">
                <div>紀錄的訊息:</div>
                <input
                    className="form-control nodrag"
                    type="text"
                    placeholder=""
                    defaultValue={state}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        event.stopPropagation();
                        setState(
                            event.currentTarget.value === ''
                                ? undefined
                                : event.currentTarget.value
                        );
                    }}
                    disabled={pipelineItem?.isRun}
                />
            </label>
            {!validated && (
                <div className="text-danger mt-15 fs-5">訊息為必填欄位</div>
            )}
        </div>
    );
};

export default LogPipelineItem;
