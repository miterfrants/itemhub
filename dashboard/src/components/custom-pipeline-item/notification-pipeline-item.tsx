import { PIPELINE_NOTIFICATION_TYPE } from '@/constants/pipeline-notification-type';
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
    });

    const [notificationTypeKey, setNotificationTypeKey] = useState<
        string | null
    >(null);
    const [state, setState] = useState<PipelineNotification | null>(null);

    const validate = (state: PipelineNotification) => {
        return true;
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
            pipelineItem.value === JSON.stringify(state) ||
            !validate(state)
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
                            notificationType: Number(event.currentTarget.value),
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
            {notificationTypeKey === PIPELINE_NOTIFICATION_TYPE.EMAIL && (
                <label className="mt-3 d-block email">
                    <div>對象:</div>
                    <input
                        className="form-control"
                        type="email"
                        placeholder="email"
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                email: event.currentTarget.value,
                                phone: undefined,
                            });
                        }}
                    />
                </label>
            )}

            {notificationTypeKey === PIPELINE_NOTIFICATION_TYPE.SMS && (
                <label className="mt-3 d-block email">
                    <div>對象:</div>
                    <input
                        className="form-control"
                        type="phone"
                        placeholder="手機"
                        onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                            setState({
                                ...state,
                                phone: event.currentTarget.value,
                                email: undefined,
                            });
                        }}
                    />
                </label>
            )}
        </div>
    );
};

export default NotificationPipelineItem;
