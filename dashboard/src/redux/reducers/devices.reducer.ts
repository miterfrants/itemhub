import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { DeviceItem } from '@/types/devices.type';

type DeviceState = {
    devices: DeviceItem[];
    rowNum: number;
};

const initialState: DeviceState = {
    devices: [],
    rowNum: 0,
};

export const devicesSlice = createSlice({
    name: 'devices',
    initialState: initialState,
    reducers: {
        refresh: (state, action: PayloadAction<DeviceState>) => {
            return action.payload;
        },
        refreshOne: (state, action: PayloadAction<DeviceItem>) => {
            const list = state.devices;
            const newOne = action.payload;

            if (list === null) {
                return {
                    ...state,
                    devices: [newOne],
                };
            }

            const targetIndex = list.findIndex(
                (oldOne) => oldOne.id === newOne.id
            );
            list[targetIndex] = {
                ...newOne,
            };

            return {
                ...state,
                devices: list,
            };
        },
        append: (state, action: PayloadAction<DeviceItem>) => {
            let devices = state.devices;
            if (devices === null) {
                devices = [];
            }

            const deviceInState = devices.find(
                (item) => item.id === action.payload.id
            );
            if (!deviceInState) {
                devices.push(action.payload);
            }

            const newDevices = [...devices];
            return {
                ...state,
                devices: newDevices,
            };
        },
        addOne: (state, action: PayloadAction<DeviceItem>) => {
            let list = state.devices;
            const newOne = action.payload;

            if (list === null) {
                list = [];
            }

            return {
                ...state,
                devices: [newOne, ...list],
            };
        },
        update: (state, action: PayloadAction<Partial<DeviceItem>>) => {
            const devices = state.devices;

            const newDeviceData = action.payload;

            if (devices === null) {
                throw new Error('Can not updateDevice when devices is null.');
            }

            const newDevices = [...devices];
            const targetIndex = newDevices.findIndex(
                ({ id }) => id === newDeviceData.id
            );
            newDevices[targetIndex] = {
                ...newDevices[targetIndex],
                ...newDeviceData,
            };

            return {
                ...state,
                devices: newDevices,
            };
        },
        deleteMultiple: (state, action: PayloadAction<{ ids: number[] }>) => {
            const devices = state.devices;
            const deletePayload = action.payload;

            if (devices === null) {
                throw new Error('Can not updateDevice when devices is null.');
            }

            const newList = devices.filter(
                (item) => deletePayload.ids.indexOf(item.id) === -1
            );

            return {
                ...state,
                oauthClients: newList,
            };
        },
    },
});

export const devicesActions = devicesSlice.actions;

export const selectDevices = (state: RootState) => state.devices;

export default devicesSlice.reducer;
