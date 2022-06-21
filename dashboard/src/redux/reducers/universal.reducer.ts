import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import {
    Microcontroller,
    DeviceMode,
    TriggerOerator,
    TriggerType,
    TriggerNotificationPeriod,
} from '@/types/universal.type';

interface UniversalState {
    triggerOperators: TriggerOerator[];
    microcontrollers: Microcontroller[];
    deviceModes: DeviceMode[];
    triggerTypes: TriggerType[];
    triggerNotificationPeriod: TriggerNotificationPeriod[];
}

const initialState: UniversalState = {
    triggerOperators: [],
    microcontrollers: [],
    deviceModes: [],
    triggerTypes: [],
    triggerNotificationPeriod: [],
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
    },
});

export const universalActions = universalSlice.actions;

export const selectUniversal = (state: RootState) => state.universal;

export default universalSlice.reducer;
