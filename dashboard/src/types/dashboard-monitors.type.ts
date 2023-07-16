export interface DashboardMonitorItem {
    id: number;
    name: string;
    ownerId: number;
    createdAt: string;
    editedAt: string | null;
    deletedAt: string | null;
    deviceId: number;
    pin: string;
    mode: number;
    sort: number;
    row: number;
    column: number;
    isLiveData?: boolean;
    groupId?: number;
    customTitle: string;
}
