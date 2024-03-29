export interface ComputedFunctions {
    id: number;
    userId: number;
    createdAt: string;
    editedAt: null | string;
    deletedAt: null | string;
    deviceId?: null | number;
    pin?: null | string;
    monitorId?: null | number;
    groupId?: null | number;
    func: null | string;
    sourceDeviceId?: null | number;
    sourcePin?: null | string;
}
