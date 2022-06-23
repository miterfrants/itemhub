import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import {
    Microcontroller,
    DeviceMode,
    TriggerOerator,
    DashboardMonitorMode,
} from '@/types/universal.type';

interface UniversalState {
    triggerOperators: TriggerOerator[];
    microcontrollers: Microcontroller[];
    deviceModes: DeviceMode[];
    dashboardMonitorModes: DashboardMonitorMode[];
}

const initialState: UniversalState = {
    triggerOperators: [],
    microcontrollers: [],
    deviceModes: [],
    dashboardMonitorModes: [],
};

export const universalSlice = createSlice({
    name: 'universal',
    initialState,
    reducers: {
        setTriggerOperators: (
            state,
            action: PayloadAction<TriggerOerator[]>
        ) => {
            const newTriggerOperators = action.payload;
            return {
                ...state,
                triggerOperators: newTriggerOperators,
            };
        },
        setMicrocontrollers: (
            state,
            action: PayloadAction<Microcontroller[]>
        ) => {
            const newMicrocontrollers = action.payload;
            return {
                ...state,
                microcontrollers: newMicrocontrollers,
            };
        },
        setDeviceModes: (state, action: PayloadAction<DeviceMode[]>) => {
            const newDeviceModes = action.payload;
            return {
                ...state,
                deviceModes: newDeviceModes,
            };
        },
        setDashboardMonitorModes: (
            state,
            action: PayloadAction<DashboardMonitorMode[]>
        ) => {
            const newDashboardMonitorModes = action.payload;
            return {
                ...state,
                dashboardMonitorModes: newDashboardMonitorModes,
            };
        },
    },
});

export const universalActions = universalSlice.actions;

export const selectUniversal = (state: RootState) => state.universal;

export default universalSlice.reducer;
