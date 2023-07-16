import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { InvitationType } from '@/types/invitation.type';

export type InvitationState = InvitationType[];

const initialState: InvitationState = [];

export const invitationsSlice = createSlice({
    name: 'invitations',
    initialState: initialState,
    reducers: {
        append: (state, action: PayloadAction<InvitationState>) => {
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
        deleteMultipleByGroupId: (
            state,
            action: PayloadAction<{ groupId: number }>
        ) => {
            const newState = state || [];
            const deletePayload = action.payload;

            const newList = newState.filter(
                (item) => item.groupId !== deletePayload.groupId
            );

            return newList;
        },
    },
});

export const invitationsActions = invitationsSlice.actions;

export const selectInvitations = (state: RootState) => state.invitations;

export default invitationsSlice.reducer;
