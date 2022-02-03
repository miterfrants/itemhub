import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface Device {
    id: number;
    name: string;
    ownerId: number;
    deviceId: string;
    createdAt: string;
    editedAt: null | string;
    deletedAt: null | string;
    info: null | string;
    online: boolean;
    zone: null | string;
    zoneId: null | string;
}

export const devicesSlice = createSlice({
    name: 'devices',
    initialState: null as Device[] | null,
    reducers: {
        addDevices: (state, action: PayloadAction<Device[]>) => {
            return state === null
                ? action.payload
                : state.concat(action.payload);
        },
    },
});

export const devicesActions = devicesSlice.actions;

export const selectDevices = (state: RootState) => state.device;

export default devicesSlice.reducer;
