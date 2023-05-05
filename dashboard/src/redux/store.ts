import { configureStore } from '@reduxjs/toolkit';
import universalReducer from './reducers/universal.reducer';
import devicesReducer from './reducers/devices.reducer';
import oauthClientsReducer from './reducers/oauth-clients.reducer';
import pinsReducer from './reducers/pins.reducer';
import menuReducer from './reducers/menu.reducer';
import dialogReducer from './reducers/dialog.reducer';
import toasterReducer from './reducers/toaster.reducer';
import oauthClientRedirectUrisReducer from './reducers/oauth-client-redirect-uris.reducer';
import monitorConfigDialogReducer from './reducers/monitor-config-dialog.reducer';
import dashboardMonitorReducer from './reducers/dashboard-monitor.reducer';
import deviceLastActivityReducer from './reducers/device-activity-logs.reducer';
import pipelinesReducer from './reducers/pipelines.reducer';
import pipelineItemsReducer from './reducers/pipeline-items.reducer';
import pipelineConnectorsReducer from './reducers/pipeline-connectors.reducer';
import offlineNotificationDialogReducer from './reducers/offline-notification-dialog.reducer';
import layoutReducer from './reducers/layout.reducer';

const store = configureStore({
    reducer: {
        universal: universalReducer,
        devices: devicesReducer,
        deviceLastActivityLogs: deviceLastActivityReducer,
        oauthClients: oauthClientsReducer,
        pins: pinsReducer,
        menu: menuReducer,
        dialog: dialogReducer,
        toasters: toasterReducer,
        oauthClientRedirectUris: oauthClientRedirectUrisReducer,
        monitorConfigDialog: monitorConfigDialogReducer,
        offlineNotificationDialog: offlineNotificationDialogReducer,
        dashboardMonitors: dashboardMonitorReducer,
        pipelines: pipelinesReducer,
        pipelineItems: pipelineItemsReducer,
        pipelineConnectors: pipelineConnectorsReducer,
        layout: layoutReducer,
    },
    middleware: (getDefaultMiddlware) => {
        return getDefaultMiddlware({
            serializableCheck: false,
        });
    },
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: { devices: devicesState ... }
export type AppDispatch = typeof store.dispatch;
