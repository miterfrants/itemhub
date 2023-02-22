import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type OfflineNotificationDialogState = {
    isOpen: boolean;
    callback: () => void;
    deviceId: number | null;
};
const initMonnitorConfigDialogState = {
    isOpen: false,
    deviceId: null,
    callback: () => {},
} as OfflineNotificationDialogState;

export const OfflineNotificationDialogSlice = createSlice({
    name: 'offlineNotificationDialog',
    initialState: initMonnitorConfigDialogState,
    reducers: {
        open: (
            state,
            action: PayloadAction<Partial<OfflineNotificationDialogState>>
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

export const offlineNotificationDialogActions =
    OfflineNotificationDialogSlice.actions;

export const selectOfflineNotificationDialog = (state: RootState) =>
    state.offlineNotificationDialog;

export default OfflineNotificationDialogSlice.reducer;
