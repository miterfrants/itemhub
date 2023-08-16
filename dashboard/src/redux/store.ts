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
import realtimeDeviceImageDialogReducer from './reducers/realtime-device-image-dialog.reducer';
import groupsReducer from './reducers/groups.reducer';
import invitationsReducer from './reducers/invitations.reducer';
import groupUsersReducer from './reducers/group-users.reducer';
import myGroupDevicesReducer from './reducers/my-group-devices.reducer';
import groupDevicesReducer from './reducers/group-devices.reducer';
import groupDevicePinsReducer from './reducers/group-device-pins.reducer';
import computedFunctionsReducer from './reducers/computed-functions.reducer';
import computedFunctionDialogReducer from './reducers/computed-function-dialog.reducer';

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
        realtimeDeviceImageDialog: realtimeDeviceImageDialogReducer,
        groups: groupsReducer,
        invitations: invitationsReducer,
        groupUsers: groupUsersReducer,
        myGroupDevices: myGroupDevicesReducer,
        groupDevices: groupDevicesReducer,
        groupDevicePins: groupDevicePinsReducer,
        computedFunctions: computedFunctionsReducer,
        computedFunctionDialog: computedFunctionDialogReducer,
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
