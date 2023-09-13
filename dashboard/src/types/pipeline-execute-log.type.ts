import { PipelineItemType } from './pipeline.type';

export interface PipelineExecuteLogType {
    id: number;
    pipelineId: number;
    ownerId: number;
    createdAt: string;
    editedAt?: string;
    deletedAt?: string;
    itemId: number;
    raw: string;
    isHead: boolean;
    isEnd: boolean;
    message: string;
    item: PipelineItemType;
}
