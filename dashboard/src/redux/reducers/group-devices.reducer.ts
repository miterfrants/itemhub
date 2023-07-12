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

export const groupDevicesSlice = createSlice({
    name: 'groupDevices',
    initialState: initialState,
    reducers: {
        refresh: (state, action: PayloadAction<DeviceState>) => {
            return action.payload;
        },
        refreshLastActivity: (
            state,
            action: PayloadAction<{ deviceId: number; lastActivity: string }>
        ) => {
            const list = [...state.devices];

            const targetIndex = list.findIndex(
                (oldOne) => oldOne.id === action.payload.deviceId
            );

            const oldOne = list[targetIndex] as DeviceItem;
            list[targetIndex] = {
                ...oldOne,
                lastActivity: new Date(action.payload.lastActivity),
            } as DeviceItem;

            return {
                ...state,
                devices: list,
            };
        },
        refreshOne: (state, action: PayloadAction<DeviceItem>) => {
            const list = [...state.devices];
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

            if (targetIndex === -1) {
                list.push(newOne);
            } else {
                list[targetIndex] = {
                    ...newOne,
                };
            }

            return {
                ...state,
                groupDevices: list,
            };
        },
        append: (state, action: PayloadAction<DeviceItem>) => {
            let groupDevices = state.devices;
            if (groupDevices === null) {
                groupDevices = [];
            }

            const deviceInState = groupDevices.find(
                (item) => item.id === action.payload.id
            );
            if (!deviceInState) {
                groupDevices.push(action.payload);
            }

            const newDevices = [...groupDevices];
            return {
                ...state,
                groupDevices: newDevices,
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
                groupDevices: [newOne, ...list],
            };
        },
        update: (state, action: PayloadAction<Partial<DeviceItem>>) => {
            const groupDevices = state.devices;

            const newDeviceData = action.payload;

            if (groupDevices === null) {
                throw new Error(
                    'Can not updateDevice when groupDevices is null.'
                );
            }

            const newDevices = [...groupDevices];
            const targetIndex = newDevices.findIndex(
                ({ id }) => id === newDeviceData.id
            );
            newDevices[targetIndex] = {
                ...newDevices[targetIndex],
                ...newDeviceData,
            };

            return {
                ...state,
                groupDevices: newDevices,
            };
        },
        deleteMultiple: (state, action: PayloadAction<{ ids: number[] }>) => {
            const groupDevices = state.devices;
            const deletePayload = action.payload;

            if (groupDevices === null) {
                throw new Error(
                    'Can not updateDevice when groupDevices is null.'
                );
            }

            const newList = groupDevices.filter(
                (item) => deletePayload.ids.indexOf(item.id) === -1
            );

            return {
                ...state,
                oauthClients: newList,
            };
        },
    },
});

export const groupDevicesActions = groupDevicesSlice.actions;

export const selectGroupDevices = (state: RootState) => state.groupDevices;

export default groupDevicesSlice.reducer;
