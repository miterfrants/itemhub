import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from './reducers/devices.reducer';

const store = configureStore({
    reducer: {
        devices: devicesReducer,
    },
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: { devices: devicesState ... }
export type AppDispatch = typeof store.dispatch;
