export interface GroupType {
    id: number;
    name: string;
    createdBy?: number;
    createdAt?: string;
    editedAt?: string;
    deletedAt?: string;
    roles?: string;
}

export interface GroupNameType {
    id: number;
    name: string;
}
