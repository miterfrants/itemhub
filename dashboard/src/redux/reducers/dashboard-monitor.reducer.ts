import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { DashboardMonitorItem } from '@/types/dashboard-monitors.type';

const initialState: DashboardMonitorItem[] = [];

export const dashboardMonitorsSlice = createSlice({
    name: 'dashboardMonitors',
    initialState,
    reducers: {
        update: (state, action: PayloadAction<DashboardMonitorItem[]>) => {
            const newRecords = action.payload;
            return newRecords;
        },
        updateSorting: (
            state,
            action: PayloadAction<
                {
                    id: number;
                    sort: number;
                }[]
            >
        ) => {
            const newState = state.map((item) => {
                const target = action.payload.find(
                    (sortingData) => sortingData.id === item.id
                );
                return {
                    ...item,
                    sort: target?.sort || 1,
                };
            });
            newState.sort((current, next) =>
                current.sort > next.sort ? 1 : -1
            );
            return newState;
        },
        delete: (state, action: PayloadAction<number[]>) => {
            const oldRecords = [...state];
            const deleteTriggerIds = action.payload;

            if (oldRecords === null) {
                throw new Error(
                    'Can not delete when dashboard monitors is null.'
                );
            }

            const updatedDashboardMonitors = oldRecords.filter(
                (item) => deleteTriggerIds.indexOf(item.id) === -1
            );

            return updatedDashboardMonitors;
        },
    },
});

export const dashboardMonitorsActions = dashboardMonitorsSlice.actions;

export const selectDashboardMonitors = (state: RootState) =>
    state.dashboardMonitors;

export default dashboardMonitorsSlice.reducer;
