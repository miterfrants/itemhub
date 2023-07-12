import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { GroupDevicesType } from '@/types/group-devices.type';

const initialState: GroupDevicesType[] = [];

export const groupDevicesSlice = createSlice({
    name: 'groupDevices',
    initialState: initialState,
    reducers: {
        append: (state, action: PayloadAction<GroupDevicesType[]>) => {
            const shouldBeAppendItems = action.payload.filter(
                (item) => !state.find((oldItem) => oldItem.id === item.id)
            );
            state.forEach((item) => {
                const target = action.payload.find(
                    (newItem) => newItem.id === item.id
                );
                if (!target) {
                    return;
                }
                item = { ...target };
            });
            return [...shouldBeAppendItems, ...state];
        },
        deleteMultiple: (state, action: PayloadAction<{ ids: number[] }>) => {
            const newState = state || [];
            const deletePayload = action.payload;

            const newList = newState.filter(
                (item) => deletePayload.ids.indexOf(item.id || 0) === -1
            );

            return newList;
        },
    },
});

export const groupDevicesActions = groupDevicesSlice.actions;

export const selectGroupDevices = (state: RootState) => state.groupDevices;

export default groupDevicesSlice.reducer;
