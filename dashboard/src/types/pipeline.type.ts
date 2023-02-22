import { XYPosition } from 'reactflow';

export interface PipelineType {
    id: number;
    title?: string;
    ownerId?: number;
    createdAt?: string;
    editedAt?: null | string;
    deletedAt?: null | string;
}

export interface PipelineItemType {
    id?: null | number;
    ownerId?: number;
    createdAt?: string;
    editedAt?: null | string;
    deletedAt?: null | string;
    pipelineId: number;
    title?: string;
    itemType?: number;
    value?: string;
    point?: XYPosition;
    clickCrossButtonCallback?: (id: string) => void;
    pipelineItemChangedCallback?: (
        id: string,
        value: string,
        itemType: number
    ) => void;
    itemTypeKey?: string;
}

export interface PipelineConnectorType {
    id?: null | number;
    ownerId?: number;
    createdAt?: string;
    editedAt?: null | string;
    deletedAt?: null | string;
    pipelineId: number;
    sourcePipelineItemId: number;
    destPipelineItemId: number;
}
