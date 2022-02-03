import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Device } from '../../types/devices.type';

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

export const selectDevices = (state: RootState) => state.devices;

export default devicesSlice.reducer;
