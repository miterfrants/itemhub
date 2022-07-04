import { DeviceItem } from '@/types/devices.type';

export interface TriggerItem {
    id: number;
    name: string;
    ownerId: number;
    createdAt: string;
    editedAt: string | null;
    deletedAt: string | null;
    operator: number;
    sourceDevice: DeviceItem | null;
    sourceDeviceId: number;
    sourcePin: string;
    sourceThreshold: number;
    destinationDevice: DeviceItem | null;
    destinationDeviceId: number | null;
    destinationDeviceTargetState: number | null;
    destinationPin: string | null;
    type: number;
    email: string | null;
    notificationPeriod: number | null;
}

export interface EditedTrigger {
    name: string;
    operator: number;
    sourceDeviceId: number;
    sourcePin: string;
    sourceThreshold: number;
    destinationDeviceId: number | null;
    destinationDeviceTargetState: number | null;
    destinationPin: string | null;
    type: number;
    email: string | null;
    notificationPeriod: number | null;
}
