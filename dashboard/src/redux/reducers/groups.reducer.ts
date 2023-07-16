import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { GroupType } from '@/types/group.type';

export type GroupState = {
    groups?: GroupType[];
    rowNum: number;
};

const initialState: GroupState = {
    groups: undefined,
    rowNum: 0,
};

export const groupsSlice = createSlice({
    name: 'groups',
    initialState: initialState,
    reducers: {
        refresh: (state, action: PayloadAction<GroupState>) => {
            return action.payload;
        },
        refreshOne: (state, action: PayloadAction<GroupType>) => {
            const list = state.groups ? [...state.groups] : [];
            const newOne = action.payload;
            let newRowNum = state.rowNum;

            const targetIndex = list.findIndex(
                (oldOne) => oldOne.id === newOne.id
            );

            if (targetIndex === -1) {
                list.push(newOne);
                newRowNum += 1;
            } else {
                list[targetIndex] = {
                    ...newOne,
                };
            }

            return {
                ...state,
                groups: list,
                rowNum: newRowNum,
            };
        },
        update: (state, action: PayloadAction<Partial<GroupType>>) => {
            const groups = state.groups || [];

            const newGroupData = action.payload;

            if (groups === null) {
                throw new Error('Can not update group when groups is null.');
            }

            const newGroups = [...groups];
            const targetIndex = newGroups.findIndex(
                ({ id }) => id === newGroupData.id
            );
            newGroups[targetIndex] = {
                ...newGroups[targetIndex],
                ...newGroupData,
            };

            return {
                ...state,
                groups: newGroups,
            };
        },
        deleteMultiple: (state, action: PayloadAction<{ ids: number[] }>) => {
            const groups = state.groups || [];
            const deletePayload = action.payload;

            if (groups === null) {
                throw new Error('Can not updateDevice when groups is null.');
            }

            const newList = groups.filter(
                (item) => deletePayload.ids.indexOf(item.id) === -1
            );

            return {
                ...state,
                rowNum: state.rowNum - (groups.length - newList.length),
                groups: newList,
            };
        },
    },
});

export const groupsActions = groupsSlice.actions;

export const selectGroups = (state: RootState) => state.groups;

export default groupsSlice.reducer;
