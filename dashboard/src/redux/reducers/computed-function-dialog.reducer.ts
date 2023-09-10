import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type ComputedFunctionDialogState = {
    isOpen: boolean;
    id?: number;
    deviceId?: number | null;
    pin?: string | null;
    monitorId?: number | null;
    groupId?: number;
    func?: string | null;
    sourceDeviceId?: number | null;
    sourcePin?: string | null;
};
const initComputedFunctionDialogState = {
    id: undefined,
    isOpen: false,
    deviceId: undefined,
    pin: undefined,
    monitorId: undefined,
    groupId: undefined,
    func: undefined,
    sourceDeviceId: undefined,
    sourcePin: undefined,
} as ComputedFunctionDialogState;

export const computedFunctionDialogSlice = createSlice({
    name: 'computedFunctionDialog',
    initialState: initComputedFunctionDialogState,
    reducers: {
        open: (
            state,
            action: PayloadAction<Partial<ComputedFunctionDialogState>>
        ) => {
            return {
                ...action.payload,
                isOpen: true,
            };
        },
        close: () => {
            return { ...initComputedFunctionDialogState, isOpen: false };
        },
    },
});

export const computedFunctionDialogActions =
    computedFunctionDialogSlice.actions;

export const selectComputedFunctionDialog = (state: RootState) =>
    state.computedFunctionDialog;

export default computedFunctionDialogSlice.reducer;
