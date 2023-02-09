export interface DeviceItem {
    id: number;
    name: string;
    ownerId: number;
    createdAt: string;
    editedAt: null | string;
    deletedAt: null | string;
    info: null | string;
    online: boolean;
    zone: null | string;
    zoneId: null | number;
    microcontroller: number;
    protocol: number;
    lastActivityLogCreatedAt: Date;
}

export interface PinItem {
    id?: number;
    pin: string;
    pinNumber: string;
    deviceId: number;
    value: number | null;
    mode: number;
    name: string | null;
    createdAt?: string;
    device?: DeviceItem;
}

export interface DeviceLastActivityLog {
    deviceId: number;
    createdAt: string;
}
