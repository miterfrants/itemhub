import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { DeviceItem } from '@/types/devices.type';

type DeviceState = {
    devices: DeviceItem[] | null;
    rowNum: number;
    countOfAllDevices: number;
};

const initialState: DeviceState = {
    devices: null,
    rowNum: 0,
    countOfAllDevices: 0,
};

export const devicesSlice = createSlice({
    name: 'devices',
    initialState: initialState,
    reducers: {
        refresh: (state, action: PayloadAction<DeviceState>) => {
            return {
                ...action.payload,
                countOfAllDevices:
                    state.countOfAllDevices === 0
                        ? action.payload.rowNum
                        : state.countOfAllDevices,
            };
        },
        append: (state, action: PayloadAction<DeviceItem>) => {
            const deviceInState = state.devices?.find(
                (item) => item.id === action.payload.id
            );
            const devices = state.devices;
            if (!deviceInState) {
                (devices || []).push(action.payload);
            }
            return {
                ...state,
                devices,
            };
        },
        update: (state, action: PayloadAction<Partial<DeviceItem>>) => {
            const devices = state.devices;
            const newDeviceData = action.payload;

            if (devices === null) {
                throw new Error('Can not updateDevice when devices is null.');
            }

            const targetIndex = devices.findIndex(
                ({ id }) => id === newDeviceData.id
            );
            devices[targetIndex] = {
                ...devices[targetIndex],
                ...newDeviceData,
            };

            return {
                ...state,
                devices,
            };
        },
        delete: (state, action: PayloadAction<Partial<DeviceItem>>) => {
            const devices = state.devices;

            if (devices === null) {
                throw new Error('Can not updateDevice when devices is null.');
            }

            // todo: reduce countOfAllDevices in this sitituation

            return {
                ...state,
                devices: devices.filter(
                    (item) => item.id !== action.payload.id
                ),
            };
        },
    },
});

export const devicesActions = devicesSlice.actions;

export const selectDevices = (state: RootState) => state.devices;

export default devicesSlice.reducer;
