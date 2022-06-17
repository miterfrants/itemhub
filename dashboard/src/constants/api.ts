export const API_URL = import.meta.env.VITE_API_URL;

export const END_POINT = {
    TRIGGER_OPERATORS: 'universal/trigger-operators',
    MICROCONTROLLER: 'universal/microcontroller',
    DEVICE_MODE: 'universal/device-mode',
    DASHBOARD_MONITOR_MODE: 'universal/dashboard-monitor-mode',
    SIGN_WITH_EMAIL: 'auth/sign-in-with-email',
    IS_SIGNED: 'auth/is-sign-in',
    All_DEVICES: 'my/devices/all',
    DEVICES: 'my/devices',
    DEVICE: 'my/devices/:id',
    DEVICE_PINS: 'my/devices/:id/pins',
    DEVICE_SWITCH_PIN: 'my/devices/:id/switches/:pin',
    DEVICE_PIN: 'my/devices/:id/pins/:pin',
    DEVICE_BUNDLE_FIRMWARE: 'my/devices/:id/bundle-firmware',
    SENSOR_LOGS: 'my/devices/:id/sensors/:pin',
    OAUTH_CLIENTS: 'my/oauth-clients',
    OAUTH_CLIENT: 'my/oauth-clients/:id',
    OAUTH_CLIENT_REDIRECT_URIS: 'my/oauth-clients/:id/redirect-uris',
    OAUTH_CLIENT_REVOKE_SECRET: 'my/oauth-clients/:id/revoke-secret',
    TRIGGERS: 'my/triggers',
    TRIGGER: 'my/triggers/:id',
    FIRMWARE: 'firmware/:bundleId',
    DASHBOARD_MONITORS: 'my/dashboard-monitors',
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
