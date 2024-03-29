import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { ComputedFunctions } from '@/types/computed-functions.type';

export const computedFunctionsSlice = createSlice({
    name: 'computed-functions',
    initialState: [] as ComputedFunctions[],
    reducers: {
        refresh: (state, action: PayloadAction<ComputedFunctions[]>) => {
            const passIds = action.payload.map((item) => item.id);
            return [
                ...state.filter((item) => !passIds.includes(item.id)),
                ...action.payload,
            ];
        },
        updateFunc: (
            state,
            action: PayloadAction<{
                id: number;
                func: string;
                sourceDeviceId?: number;
                sourcePin?: string;
            }>
        ) => {
            const record = state.find((item) => item.id === action.payload.id);
            if (!record) {
                return state;
            }

            const { func, sourceDeviceId, sourcePin } = action.payload;
            const newRecord = {
                ...record,
                func,
                sourceDeviceId,
                sourcePin,
            };
            return [
                ...state.filter((item) => item.id !== newRecord.id),
                newRecord,
            ];
        },
    },
});

export const computedFunctionsActions = computedFunctionsSlice.actions;

export const selectComputedFunctions = (state: RootState) =>
    state.computedFunctions;

export default computedFunctionsSlice.reducer;
