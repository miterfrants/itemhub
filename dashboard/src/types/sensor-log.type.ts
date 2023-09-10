export interface SensorLogType {
    id: number;
    ownerId?: number;
    createdAt: string;
    editedAt?: null | string;
    deletedAt?: null | string;
    deviceId?: number;
    pin?: string;
    value?: number;
}
