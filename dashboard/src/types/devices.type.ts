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
}

export interface PinItem {
    pin: string;
    deviceId: number;
    value: number | null;
    mode: number;
    name: string | null;
    createdAt?: string;
}
