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
            const oldRecords: DashboardMonitorItem[] = (
                state ? [...state] : []
            ) as DashboardMonitorItem[];

            // update exists data
            const updatedOldPins = oldRecords.map(
                (oldPin: DashboardMonitorItem) => {
                    const existsInPayload = newRecords.find(
                        (pin) => pin.id === oldPin.id && oldPin.id && pin.id
                    );

                    if (existsInPayload) {
                        return { ...oldPin, ...existsInPayload };
                    } else {
                        return oldPin;
                    }
                }
            );

            // filter exists data
            const newPinsExcludedExists = newRecords.filter(
                (item) =>
                    !oldRecords.map((oldPin) => oldPin.id).includes(item.id)
            );

            return [...updatedOldPins, ...newPinsExcludedExists];

            return;
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
