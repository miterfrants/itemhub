import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import {
    UniversalOption,
    Microcontroller,
    DeviceMode,
    TriggerOerator,
    TriggerType,
    TriggerNotificationPeriod,
    DashboardMonitorMode,
    Protocols,
} from '@/types/universal.type';

interface UniversalState {
    triggerOperators: TriggerOerator[];
    microcontrollers: Microcontroller[];
    deviceModes: DeviceMode[];
    triggerTypes: TriggerType[];
    triggerNotificationPeriod: TriggerNotificationPeriod[];
    dashboardMonitorModes: DashboardMonitorMode[];
    protocols: Protocols[];
    pipelineItemTypes: UniversalOption[];
    pipelineNotificationTypes: UniversalOption[];
    pipelineDeviceStaticMethods: UniversalOption[];
}

const initialState: UniversalState = {
    triggerOperators: [],
    microcontrollers: [],
    deviceModes: [],
    triggerTypes: [],
    triggerNotificationPeriod: [],
    dashboardMonitorModes: [],
    protocols: [],
    pipelineItemTypes: [],
    pipelineNotificationTypes: [],
    pipelineDeviceStaticMethods: [],
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
        setTriggerTypes: (state, action: PayloadAction<TriggerType[]>) => {
            const newTriggerTypes = action.payload;
            return {
                ...state,
                triggerTypes: newTriggerTypes,
            };
        },
        setTriggerNotificationPeriod: (
            state,
            action: PayloadAction<TriggerNotificationPeriod[]>
        ) => {
            const newTriggerNotificationPeriod = action.payload;
            return {
                ...state,
                triggerNotificationPeriod: newTriggerNotificationPeriod,
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
        setProtocols: (state, action: PayloadAction<Protocols[]>) => {
            return {
                ...state,
                protocols: action.payload,
            };
        },
        setPipelineItemTypes: (
            state,
            action: PayloadAction<UniversalOption[]>
        ) => {
            return {
                ...state,
                pipelineItemTypes: action.payload,
            };
        },
        setPipelineNotificationTypes: (
            state,
            action: PayloadAction<UniversalOption[]>
        ) => {
            return {
                ...state,
                pipelineNotificationTypes: action.payload,
            };
        },
        setPipelineDeviceStaticMethods: (
            state,
            action: PayloadAction<UniversalOption[]>
        ) => {
            return {
                ...state,
                pipelineDeviceStaticMethods: action.payload,
            };
        },
    },
});

export const universalActions = universalSlice.actions;

export const selectUniversal = (state: RootState) => state.universal;

export default universalSlice.reducer;
