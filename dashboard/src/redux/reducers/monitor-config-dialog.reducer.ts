import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type MonitorConfigDialogState = {
    isOpen: boolean;
    callback: () => void;
    deviceId: number | null;
    id: number | null;
    mode: number | null | undefined;
    customTitle: string | null | undefined;
    row: number | null | undefined;
    column: number | null | undefined;
    pin: string | null | undefined;
};
const initMonnitorConfigDialogState = {
    isOpen: false,
    deviceId: null,
    id: null,
    mode: null,
    customTitle: null,
    row: null,
    column: null,
    pin: null,
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
            const {
                callback,
                deviceId,
                id,
                row,
                column,
                pin,
                mode,
                customTitle,
            } = action.payload;
            return {
                isOpen: true,
                deviceId: deviceId || null,
                id: id || null,
                row,
                column,
                pin,
                mode,
                customTitle,
                callback: callback ? callback : () => {},
            };
        },
        close: (state) => {
            state.isOpen = false;
            state.deviceId = null;
            state.id = null;
            state.row = null;
            state.column = null;
            state.pin = '';
            state.mode = null;
            state.customTitle = '';
            return state;
        },
    },
});

export const monitorConfigDialogActions = monitorConfigDialogSlice.actions;

export const selectMonitorConfigDialog = (state: RootState) =>
    state.monitorConfigDialog;

export default monitorConfigDialogSlice.reducer;
