import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { DeviceItem } from '@/types/devices.type';

export const deviceSummariesSlice = createSlice({
    name: 'deviceSummaries',
    initialState: [] as DeviceItem[],
    reducers: {
        update: (state, action: PayloadAction<DeviceItem[]>) => {
            const newItems = action.payload.filter(
                (newItem) => !state.map((item) => item.id).includes(newItem.id)
            );
            return [
                ...state.map((item) => {
                    const shouldBeUpdated = action.payload.find(
                        (newOne) => newOne.id === item.id
                    );
                    return shouldBeUpdated || item;
                }),
                ...newItems,
            ];
        },
        delete: (state, action: PayloadAction<number[]>) => {
            return state.filter((item) => !action.payload.includes(item.id));
        },
    },
});

export const deviceSummariesActions = deviceSummariesSlice.actions;

export const selectDeviceSummaries = (state: RootState) =>
    state.deviceSummaries;

export default deviceSummariesSlice.reducer;
