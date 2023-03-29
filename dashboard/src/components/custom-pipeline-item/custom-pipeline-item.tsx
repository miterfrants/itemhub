import { PIPELINE_ITEM_TYPE } from '@/constants/pipeline-item-type';
import { useGetPipelineItemTypes } from '@/hooks/apis/universal.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectUniversal } from '@/redux/reducers/universal.reducer';
import { PipelineItemType } from '@/types/pipeline.type';
import { memo, useEffect, useState, ChangeEvent } from 'react';
import { Handle, Position } from 'reactflow';
import { UniversalOption } from '../../types/universal.type';
import CheckSwitchPipelineItem from './check-switch-pipeline-item';
import DelayPipelineItem from './delay-pipeline-item';
import NetworkPipelineItem from './network-pipeline-item';
import NotificationPipelineItem from './notification-pipeline-item';
import OfflinePipelineItem from './offline-pipeline';
import SchedulePipelineItem from './schedule-pipeline-item';
import SensorPipelineItem from './sensor-pipeline-item';
import SwitchPipelineItem from './switch-pipeline-item';

const CustomPipelineItem = ({
    data,
    id,
}: {
    id: string;
    data: PipelineItemType;
}) => {
    const { fetchApi: getPipelineItemTypes } = useGetPipelineItemTypes();

    const { pipelineItemTypes } = useAppSelector(selectUniversal);
    const [pipelineItemData, setPipelineItemData] =
        useState<PipelineItemType>(data);

    useEffect(() => {
        if (pipelineItemTypes.length === 0) {
            getPipelineItemTypes();
            return;
        }
        // eslint-disable-next-line
    }, [pipelineItemTypes]);

    useEffect(() => {
        setPipelineItemData(data);
    }, [data]);

    return (
        <div
            className={`custom-pipeline-item px-3 py-5 ${
                pipelineItemData.isRun ? 'runing' : ''
            }`}
        >
            <svg
                height="30px"
                width="30px"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 26 26"
                xmlSpace="preserve"
                fill="#000000"
                className="position-absolute end-0 top-0 mt-n5 cursor-pointer"
                style={{ marginTop: '-30px', marginRight: '-15px' }}
                onClick={() => {
                    if (data.clickCrossButtonCallback) {
                        data.clickCrossButtonCallback(id);
                    }
                }}
            >
                <g strokeWidth="0" />
                <g strokeLinecap="round" strokeLinejoin="round" />
                <g>
                    <path d="M21.125,0H4.875C2.182,0,0,2.182,0,4.875v16.25C0,23.818,2.182,26,4.875,26h16.25 C23.818,26,26,23.818,26,21.125V4.875C26,2.182,23.818,0,21.125,0z M18.78,17.394l-1.388,1.387c-0.254,0.255-0.67,0.255-0.924,0 L13,15.313L9.533,18.78c-0.255,0.255-0.67,0.255-0.925-0.002L7.22,17.394c-0.253-0.256-0.253-0.669,0-0.926l3.468-3.467 L7.221,9.534c-0.254-0.256-0.254-0.672,0-0.925l1.388-1.388c0.255-0.257,0.671-0.257,0.925,0L13,10.689l3.468-3.468 c0.255-0.257,0.671-0.257,0.924,0l1.388,1.386c0.254,0.255,0.254,0.671,0.001,0.927l-3.468,3.467l3.468,3.467 C19.033,16.725,19.033,17.138,18.78,17.394z" />
                </g>
            </svg>
            <Handle type="target" position={Position.Top} />
            <div>
                <select
                    className="form-control form-select"
                    onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                        event.stopPropagation();
                        event.preventDefault();
                        const itemType = Number(event.currentTarget.value);
                        const targetKey = pipelineItemTypes.find(
                            (item: UniversalOption) => itemType === item.value
                        )?.key;

                        setPipelineItemData({
                            ...pipelineItemData,
                            itemType: itemType,
                            itemTypeKey: targetKey,
                            value: '',
                        });

                        if (pipelineItemData.pipelineItemChangedCallback) {
                            pipelineItemData.pipelineItemChangedCallback(
                                (pipelineItemData?.id || '').toString(),
                                '',
                                itemType
                            );
                        }
                    }}
                    disabled={data.isRun}
                    defaultValue={data.itemType}
                >
                    <option value="">請選擇類型</option>
                    {pipelineItemTypes.map((item: UniversalOption) => {
                        return (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        );
                    })}
                </select>
                {pipelineItemData.itemTypeKey ===
                    PIPELINE_ITEM_TYPE.SCHEDULE && (
                    <SchedulePipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
                {pipelineItemData.itemTypeKey === PIPELINE_ITEM_TYPE.SENSOR && (
                    <SensorPipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
                {pipelineItemData.itemTypeKey === PIPELINE_ITEM_TYPE.SWITCH && (
                    <SwitchPipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
                {pipelineItemData.itemTypeKey === PIPELINE_ITEM_TYPE.DELAY && (
                    <DelayPipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
                {pipelineItemData.itemTypeKey ===
                    PIPELINE_ITEM_TYPE.NETWORK && (
                    <NetworkPipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
                {pipelineItemData.itemTypeKey ===
                    PIPELINE_ITEM_TYPE.NOTIFICATION && (
                    <NotificationPipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
                {pipelineItemData.itemTypeKey ===
                    PIPELINE_ITEM_TYPE.CHECK_SWITCH && (
                    <CheckSwitchPipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
                {pipelineItemData.itemTypeKey ===
                    PIPELINE_ITEM_TYPE.OFFLINE && (
                    <OfflinePipelineItem
                        onChangedCallback={(value: string) => {
                            if (pipelineItemData.pipelineItemChangedCallback) {
                                pipelineItemData.pipelineItemChangedCallback(
                                    (pipelineItemData?.id || '').toString(),
                                    value || '',
                                    pipelineItemData.itemType || 0
                                );
                            }
                        }}
                        pipelineItem={pipelineItemData}
                    />
                )}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default memo(CustomPipelineItem);
