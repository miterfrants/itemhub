import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { PinItem } from '@/types/devices.type';

export type MonitorConfigDialogState = {
    isOpen: boolean;
    callback: () => void;
    deviceId: number | null;
};
const initMonnitorConfigDialogState = {
    isOpen: false,
    deviceId: null,
    callback: () => {},
} as MonitorConfigDialogState;

export const monitorConfigDialogSlice = createSlice({
    name: 'monitorConfigDialog',
    initialState: initMonnitorConfigDialogState,
    reducers: {
        open: (
            state,
            action: PayloadAction<Partial<MonitorConfigDialogState>>
        ) => {
            const { callback, deviceId } = action.payload;
            return {
                isOpen: true,
                deviceId: deviceId || null,
                callback: callback ? callback : () => {},
            };
        },
        close: (state) => {
            state.isOpen = false;
            state.deviceId = null;
            return state;
        },
    },
});

export const monitorConfigDialogActions = monitorConfigDialogSlice.actions;

export const selectMonitorConfigDialog = (state: RootState) =>
    state.monitorConfigDialog;

export default monitorConfigDialogSlice.reducer;
