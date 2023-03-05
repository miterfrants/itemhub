import { useGetTriggerOperatorsApi } from '@/hooks/apis/universal.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { PipelineItemType } from '@/types/pipeline.type';
import { UniversalOption } from '@/types/universal.type';
import { useEffect, useState } from 'react';
import { ValidationHelpers } from '@/helpers/validation.helper';

interface PipelineNetwork {
    method?: string;
    requestPayload?: string;
    contentType?: string;
    responseBodyProperty?: string;
    operator?: number;
    value?: number | string;
    url?: string;
}

const NetworkPipelineItem = ({
    pipelineItem,
    onChangedCallback,
}: {
    pipelineItem: PipelineItemType;
    onChangedCallback: (value: string) => void;
}) => {
    const { getTriggerOperatorsApi } = useGetTriggerOperatorsApi();
    const [state, setState] = useState<PipelineNetwork | null>(null);
    const { triggerOperators } = useAppSelector(selectUniversal);
    const [validation, setValidation] = useState({
        method: {
            errorMessage: '',
            invalid: false,
        },
        requestPayload: {
            errorMessage: '',
            invalid: false,
        },
        contentType: {
            errorMessage: '',
            invalid: false,
        },
        responseBodyProperty: {
            errorMessage: '',
            invalid: false,
        },
        operator: {
            errorMessage: '',
            invalid: false,
        },
        value: {
            errorMessage: '',
            invalid: false,
        },
        url: {
            errorMessage: '',
            invalid: false,
        },
    });

    const validate = (state: PipelineNetwork) => {
        let result = true;
        const newValidation = { ...validation };

        if (!state.url) {
            result = false;
            newValidation.url.invalid = true;
            newValidation.url.errorMessage = 'URL 為必填欄位';
        } else if (!ValidationHelpers.isValidURL(state.url)) {
            result = false;
            newValidation.url.invalid = true;
            newValidation.url.errorMessage = 'URL 格式錯誤';
        } else {
            newValidation.url.invalid = false;
            newValidation.url.errorMessage = '';
        }

        if (!state.method) {
            result = false;
            newValidation.method.invalid = true;
            newValidation.method.errorMessage = 'Request Method 為必填欄位';
        } else {
            newValidation.method.invalid = false;
            newValidation.method.errorMessage = '';
        }

        setValidation(newValidation);
        return result;
    };

    useEffect(() => {
        if (!pipelineItem || !pipelineItem.value) {
            return;
        }
        setState(JSON.parse(pipelineItem.value) as PipelineNetwork);
    }, [pipelineItem]);

    useEffect(() => {
        if (!triggerOperators) {
            getTriggerOperatorsApi();
            return;
        }
        // eslint-disable-next-line
    }, [triggerOperators]);

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
        <div className="network-pipeline-item">
            <label className="mt-3 d-block">
                <div>URL:</div>
                <input
                    type="text"
                    className="form-control"
                    onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => {
                        setState({
                            ...state,
                            url: event.currentTarget.value,
                        });
                    }}
                    defaultValue={state?.url}
                />
            </label>
            {validation.url.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.url.errorMessage}
                </div>
            )}
            <label className="mt-3 d-block">
                <div>Request Method:</div>
                <select
                    className="form-control form-select"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        setState({
                            ...state,
                            method:
                                event.currentTarget.value !== ''
                                    ? event.currentTarget.value
                                    : undefined,
                        });
                    }}
                    value={state?.method}
                >
                    <option />
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PATCH">PATCH</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
            </label>
            {validation.method.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.method.errorMessage}
                </div>
            )}

            <label className="mt-3 d-block">
                <div>Request Payload:</div>
                <textarea
                    className="form-control"
                    onKeyUp={(
                        event: React.KeyboardEvent<HTMLTextAreaElement>
                    ) => {
                        setState({
                            ...state,
                            requestPayload: event.currentTarget.value,
                        });
                    }}
                    defaultValue={state?.requestPayload}
                />
            </label>

            <label className="mt-3 d-block">
                <div>Content Type:</div>
                <select
                    className="form-control form-select"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                        setState({
                            ...state,
                            contentType: event.currentTarget.value,
                        });
                    }}
                    value={state?.contentType}
                >
                    <option />
                    <option value="application/json">application/json</option>
                    <option value="multipart/form-data">
                        multipart/form-data
                    </option>
                    <option value="text/plain">text/plain</option>
                    <option value="application/javascript">
                        application/javascript
                    </option>
                    <option value="text/html">text/html</option>
                    <option value="text/xml">text/xml</option>
                </select>
            </label>

            {(state?.contentType !== 'application/json' ||
                (state?.contentType === 'application/json' &&
                    state?.responseBodyProperty === '')) && (
                <div className="mt-3">
                    如果 Content Type 非 application/json 會直接判斷 Http Status
                    200 跳到下一步
                </div>
            )}
            {state?.contentType === 'application/json' && (
                <label className="mt-3 d-block">
                    <div>擷取回應的欄位</div>
                    <input
                        type="text"
                        className="form-control"
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                responseBodyProperty: event.currentTarget.value,
                            });
                        }}
                        defaultValue={state?.responseBodyProperty}
                    />
                </label>
            )}
            {state?.contentType === 'application/json' &&
                state?.responseBodyProperty !== '' && (
                    <>
                        <label className="mt-3 d-block">
                            <div>擷取回應欄位資料</div>
                            <select
                                className="form-control form-select input-group-prepend"
                                onChange={(
                                    event: React.ChangeEvent<HTMLSelectElement>
                                ) => {
                                    setState({
                                        ...state,
                                        operator: Number(
                                            event.currentTarget.value
                                        ),
                                    });
                                }}
                                value={state?.operator}
                            >
                                <option />
                                {triggerOperators.map(
                                    (operator: UniversalOption) => {
                                        return (
                                            <option
                                                key={operator.key}
                                                value={operator.value}
                                            >
                                                {operator.label}
                                            </option>
                                        );
                                    }
                                )}
                            </select>
                        </label>

                        <label className="mt-3 d-block">
                            <div>擷取回應資料等於:</div>
                            <textarea
                                onChange={(
                                    event: React.ChangeEvent<HTMLTextAreaElement>
                                ) => {
                                    const numberTypeValue = Number(
                                        event.currentTarget.value
                                    );
                                    setState({
                                        ...state,
                                        value: isNaN(numberTypeValue)
                                            ? event.currentTarget.value
                                            : numberTypeValue,
                                    });
                                }}
                                className="form-control"
                                value={state?.value}
                            />
                        </label>
                    </>
                )}
        </div>
    );
};

export default NetworkPipelineItem;
