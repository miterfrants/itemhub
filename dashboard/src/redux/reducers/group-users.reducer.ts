import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { GroupUsersType } from '@/types/group-users.type';

const initialState: GroupUsersType[] = [];

export const groupUsersSlice = createSlice({
    name: 'groupUsers',
    initialState: initialState,
    reducers: {
        append: (state, action: PayloadAction<GroupUsersType[]>) => {
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
            return [...state, ...shouldBeAppendItems];
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

export const groupUsersActions = groupUsersSlice.actions;

export const selectGroupUsers = (state: RootState) => state.groupUsers;

export default groupUsersSlice.reducer;
