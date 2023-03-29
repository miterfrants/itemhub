import { useEffect, useState } from 'react';
import { PipelineItemType } from '@/types/pipeline.type';
import { isValidCron } from 'cron-validator';

const SchedulePipelineItem = ({
    pipelineItem,
    onChangedCallback,
}: {
    pipelineItem: PipelineItemType;
    onChangedCallback: (value: string) => void;
}) => {
    const { value } = pipelineItem;
    const [state, setState] = useState(value || '');
    const validate = (state: string) => {
        const validated = isValidCron(state);
        setInvalid(!validated);
        return validated;
    };

    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        if (!state || !validate(state) || pipelineItem.value === state) {
            return;
        }
        onChangedCallback(state);
        // eslint-disable-next-line
    }, [state]);
    return (
        <div className="schedule-pipeline-item">
            <label className="mt-3">
                <div>Cron Expressions:</div>
                <input
                    className="form-control"
                    disabled={pipelineItem?.isRun}
                    type="text"
                    placeholder="Cron Expressions"
                    defaultValue={state}
                    onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
                        event.stopPropagation();
                        setState(event.currentTarget.value);
                    }}
                    onKeyDown={(
                        event: React.KeyboardEvent<HTMLInputElement>
                    ) => {
                        event.stopPropagation();
                    }}
                />
            </label>
            {invalid && (
                <div className="text-danger mt-15 fs-5">
                    Cron Exprssions 錯誤
                </div>
            )}

            <div className="mt-3">
                <a
                    href="https://docs.oracle.com/cd/E12058_01/doc/doc.1014/e12030/cron_expressions.htm#:~:text=A%20cron%20expression%20is%20a,allowed%20characters%20for%20that%20field."
                    target="_blank"
                    rel="noreferrer"
                >
                    什麼是 Cron Expressions?
                </a>
            </div>
        </div>
    );
};

export default SchedulePipelineItem;
