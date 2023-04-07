export const API_URL = import.meta.env.VITE_API_URL;

export const END_POINT = {
    TRIGGER_OPERATORS: 'universal/trigger-operators',
    TRIGGER_TYPES: 'universal/trigger-types',
    TRIGGER_NOTIFICATION_PERIODS: 'universal/trigger-notification-periods',
    MICROCONTROLLER: 'universal/microcontroller',
    PIN_TYPES: 'universal/pin-types',
    DASHBOARD_MONITOR_MODE: 'universal/dashboard-monitor-mode',
    PROTOCOLS: 'universal/protocols',
    PIPELINE_ITEM_TYPES: 'universal/pipeline-item-types',
    PIPELINE_NOTIFICATION_TYPES: 'universal/pipeline-notification-types',
    PIPELINE_DEVICE_STATIC_METHODS: 'universal/pipeline-device-static-methods',
    SIGN_WITH_EMAIL: 'auth/sign-in-with-email',
    IS_SIGNED: 'auth/is-sign-in',
    All_DEVICES: 'my/devices/all',
    PIPELINES: 'my/pipelines',
    PIPELINE: 'my/pipelines/:id',
    PIPELINE_RUN_OR_STOP: 'my/pipelines/:id/toggle',
    DEVICES: 'my/devices',
    DEVICE: 'my/devices/:id',
    DEVICE_PINS: 'my/devices/:id/pins',
    DEVICE_SWITCH_PIN: 'my/devices/:id/switches/:pin',
    DEVICE_PIN: 'my/devices/:id/pins/:pin',
    DEVICE_LAST_ACTIVITY_LOGS: 'my/last-device-activity-log',
    DEVICE_BUNDLE_FIRMWARE: 'my/devices/:id/bundle-firmware',
    SENSOR_LOGS: 'my/devices/:id/sensors/:pin',
    OAUTH_CLIENTS: 'my/oauth-clients',
    OAUTH_CLIENT: 'my/oauth-clients/:id',
    OAUTH_CLIENT_REDIRECT_URIS: 'my/oauth-clients/:id/redirect-uris',
    OAUTH_CLIENT_REVOKE_SECRET: 'my/oauth-clients/:id/revoke-secret',
    FIRMWARE: 'firmware/:bundleId',
    DASHBOARD_MONITORS: 'my/dashboard-monitors',
    PIPELINE_ITEMS: 'my/pipelines/:pipelineId/items',
    PIPELINE_ITEM: 'my/pipelines/:pipelineId/items/:id',
    PIPELINE_CONNECTORS: 'my/pipelines/:pipelineId/connectors',
    PIPELINE_CONNECTOR: 'my/pipelines/:pipelineId/connectors/:id',
};

export const HTTP_METHOD = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
};

export const RESPONSE_STATUS = {
    OK: 'OK',
    FAILED: 'FAILED',
    CANCEL: 'CANCEL',
};
