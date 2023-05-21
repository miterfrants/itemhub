import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type RealtimeDeviceImageDialogState = {
    isOpen: boolean;
    callback: () => void;
    deviceId: number | null;
};
const initRealtimeDeviceImageDialogState = {
    isOpen: false,
    deviceId: null,
    callback: () => {},
} as RealtimeDeviceImageDialogState;

export const realtimeDeviceImageDialogSlice = createSlice({
    name: 'realtimeDeviceImageDialog',
    initialState: initRealtimeDeviceImageDialogState,
    reducers: {
        open: (
            state,
            action: PayloadAction<Partial<RealtimeDeviceImageDialogState>>
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

export const realtimeDeviceImageDialogActions =
    realtimeDeviceImageDialogSlice.actions;

export const selectRealtimeDeviceImageDialog = (state: RootState) =>
    state.realtimeDeviceImageDialog;

export default realtimeDeviceImageDialogSlice.reducer;
