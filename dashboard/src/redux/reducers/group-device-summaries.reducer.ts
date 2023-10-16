import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { DeviceItem } from '@/types/devices.type';

export const groupDeviceSummariesSlice = createSlice({
    name: 'groupDeviceSummaries',
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
    },
});

export const groupDeviceSummariesActions = groupDeviceSummariesSlice.actions;

export const selectGroupDeviceSummaries = (state: RootState) =>
    state.groupDeviceSummaries;

export default groupDeviceSummariesSlice.reducer;
