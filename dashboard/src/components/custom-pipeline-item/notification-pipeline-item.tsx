import { PIPELINE_NOTIFICATION_TYPE } from '@/constants/pipeline-notification-type';
import { ValidationHelpers } from '@/helpers/validation.helper';
import { useGetPipelineNotificationTypes } from '@/hooks/apis/universal.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { PipelineItemType } from '@/types/pipeline.type';
import { UniversalOption } from '@/types/universal.type';
import { ChangeEvent, useEffect, useState } from 'react';

interface PipelineNotification {
    notificationType?: number;
    email?: string;
    phone?: string;
    message?: string;
}

const NotificationPipelineItem = ({
    pipelineItem,
    onChangedCallback,
}: {
    pipelineItem: PipelineItemType;
    onChangedCallback: (value: string) => void;
}) => {
    const { fetchApi: getPipelineNotificationTypes } =
        useGetPipelineNotificationTypes();
    const { pipelineNotificationTypes } = useAppSelector(selectUniversal);
    const emailTypeValue = pipelineNotificationTypes.find(
        (item) => item.key === PIPELINE_NOTIFICATION_TYPE.EMAIL
    )?.value;
    const smsTypeValue = pipelineNotificationTypes.find(
        (item) => item.key === PIPELINE_NOTIFICATION_TYPE.SMS
    )?.value;
    const [validation, setValidation] = useState({
        notificationType: {
            errorMessage: '',
            invalid: false,
        },
        email: {
            errorMessage: '',
            invalid: false,
        },
        phone: {
            errorMessage: '',
            invalid: false,
        },
        message: {
            errorMessage: '',
            invalid: false,
        },
    });

    const [notificationTypeKey, setNotificationTypeKey] = useState<
        string | null
    >(null);
    const [state, setState] = useState<PipelineNotification | null>(null);

    const validate = (state: PipelineNotification) => {
        let result = true;
        const newValidation = { ...validation };
        if (state.notificationType === undefined) {
            result = false;
            newValidation.notificationType.errorMessage = '通知類型為必選欄位';
            newValidation.notificationType.invalid = true;
        } else {
            newValidation.notificationType.errorMessage = '';
            newValidation.notificationType.invalid = false;
        }

        if (
            state.notificationType !== undefined &&
            Number(state.notificationType) === emailTypeValue &&
            !state.email
        ) {
            result = false;
            newValidation.email.errorMessage = 'email 為必填欄位';
            newValidation.email.invalid = true;
        } else if (
            Number(state.notificationType) === emailTypeValue &&
            !ValidationHelpers.isEmail(state?.email || '')
        ) {
            result = false;
            newValidation.email.errorMessage = 'email 格式錯誤';
            newValidation.email.invalid = true;
        } else {
            newValidation.email.errorMessage = '';
            newValidation.email.invalid = false;
        }

        if (
            state.notificationType !== undefined &&
            Number(state.notificationType) === smsTypeValue &&
            !state.phone
        ) {
            result = false;
            newValidation.phone.errorMessage = 'phone 為必填欄位';
            newValidation.phone.invalid = true;
        } else if (
            Number(state.notificationType) === smsTypeValue &&
            !ValidationHelpers.isPhone(state?.phone || '')
        ) {
            result = false;
            newValidation.phone.errorMessage = 'phone 格式錯誤';
            newValidation.phone.invalid = true;
        } else {
            newValidation.phone.errorMessage = '';
            newValidation.phone.invalid = false;
        }
        if (!state.message) {
            result = false;
            newValidation.message.errorMessage = '訊息為必選欄位';
            newValidation.message.invalid = true;
        } else {
            newValidation.message.errorMessage = '';
            newValidation.message.invalid = false;
        }

        setValidation(newValidation);
        return result;
    };

    useEffect(() => {
        if (pipelineNotificationTypes.length === 0) {
            getPipelineNotificationTypes();
            return;
        }
        // eslint-disable-next-line
    }, [pipelineNotificationTypes]);

    useEffect(() => {
        if (!pipelineItem || !pipelineItem.value) {
            return;
        }
        setState(JSON.parse(pipelineItem.value) as PipelineNotification);
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
        <div className="notification-pipeline-item">
            <label className="mt-3 w-100">
                <div>通知模式:</div>
                <select
                    className="form-control"
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        setState({
                            ...state,
                            notificationType:
                                event.currentTarget.value !== ''
                                    ? Number(event.currentTarget.value)
                                    : undefined,
                        });
                        const targetNotificationType =
                            pipelineNotificationTypes.find(
                                (item: UniversalOption) =>
                                    item.value.toString() ===
                                    event.currentTarget.value
                            );
                        setNotificationTypeKey(
                            targetNotificationType
                                ? targetNotificationType?.key
                                : null
                        );
                    }}
                    value={state?.notificationType}
                >
                    <option value="">請選擇通知模式</option>
                    {pipelineNotificationTypes.map((item: UniversalOption) => {
                        return (
                            <option key={item.key} value={item.value}>
                                {item.label}
                            </option>
                        );
                    })}
                </select>
            </label>
            {validation.notificationType.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.notificationType.errorMessage}
                </div>
            )}
            {state?.notificationType === emailTypeValue && (
                <div>
                    <label className="mt-3 d-block email">
                        <div>對象:</div>
                        <input
                            className="form-control"
                            type="email"
                            placeholder="email"
                            onKeyUp={(
                                event: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                                setState({
                                    ...state,
                                    email: event.currentTarget.value,
                                    phone: undefined,
                                });
                            }}
                            value={state?.email}
                        />
                    </label>
                    {validation.email.invalid && (
                        <div className="text-danger mt-15 fs-5">
                            {validation.email.errorMessage}
                        </div>
                    )}
                </div>
            )}

            {state?.notificationType === smsTypeValue && (
                <div>
                    <label className="mt-3 d-block sms">
                        <div>對象:</div>
                        <input
                            className="form-control"
                            type="phone"
                            placeholder="手機"
                            onKeyUp={(
                                event: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                                setState({
                                    ...state,
                                    phone: event.currentTarget.value,
                                    email: undefined,
                                });
                            }}
                            value={state?.phone}
                        />
                    </label>
                    {validation.phone.invalid && (
                        <div className="text-danger mt-15 fs-5">
                            {validation.phone.errorMessage}
                        </div>
                    )}
                </div>
            )}
            <label className="mt-3 d-block">
                <div>訊息:</div>
                <textarea
                    className="form-control"
                    onKeyUp={(
                        event: React.KeyboardEvent<HTMLTextAreaElement>
                    ) => {
                        setState({
                            ...state,
                            message: event.currentTarget.value,
                        });
                    }}
                >
                    {state?.message}
                </textarea>
            </label>
            {validation.message.invalid && (
                <div className="text-danger mt-15 fs-5">
                    {validation.message.errorMessage}
                </div>
            )}
        </div>
    );
};

export default NotificationPipelineItem;
