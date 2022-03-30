import { configureStore } from '@reduxjs/toolkit';
import universalReducer from './reducers/universal.reducer';
import devicesReducer from './reducers/devices.reducer';
import oauthClientsReducer from './reducers/oauth-clients.reducer';
import triggersReducer from './reducers/triggers.reducer';
import pinsReducer from './reducers/pins.reducer';

const store = configureStore({
    reducer: {
        universal: universalReducer,
        devices: devicesReducer,
        oauthClients: oauthClientsReducer,
        triggers: triggersReducer,
        pins: pinsReducer,
    },
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: { devices: devicesState ... }
export type AppDispatch = typeof store.dispatch;
