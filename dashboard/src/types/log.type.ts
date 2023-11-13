export interface LogType {
    id: number;
    createdAt: string;
    deviceId?: number;
    userId?: number;
    pin?: string;
    message?: string;
    logType: number;
    pipelineId?: number;
}
