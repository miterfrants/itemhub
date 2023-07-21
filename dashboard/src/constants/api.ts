export const API_URL = import.meta.env.VITE_API_URL;

export const END_POINT = {
    TRIGGER_OPERATORS: 'universal/trigger-operators',
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
    DEVICE_LAST_ACTIVITY: 'my/devices/:id/last-activity',
    DEVICE_LAST_DEVICE_IMAGE_THUMBNAIL:
        'my/devices/:id/read-last-file-thumbnail',
    DEVICE_LAST_DEVICE_IMAGE: 'my/devices/:id/read-last-file',
    DEVICE_PINS: 'my/devices/:id/pins',
    DEVICE_SWITCH_PIN: 'my/devices/:id/switches/:pin',
    DEVICE_PIN: 'my/devices/:id/pins/:pin',
    DEVICE_BUNDLE_FIRMWARE: 'my/devices/:id/bundle-firmware',
    SENSOR_LOGS: 'my/devices/:id/sensors/:pin',
    SENSOR_LOGS_AGGREGATE: 'my/devices/:id/sensors/:pin/aggregate',
    OAUTH_CLIENTS: 'my/oauth-clients',
    OAUTH_CLIENT: 'my/oauth-clients/:id',
    OAUTH_CLIENT_REDIRECT_URIS: 'my/oauth-clients/:id/redirect-uris',
    OAUTH_CLIENT_REVOKE_SECRET: 'my/oauth-clients/:id/revoke-secret',
    FIRMWARE: 'firmware/:bundleId',
    DASHBOARD_MONITORS: 'my/dashboard-monitors',
    DASHBOARD_MONITOR: 'my/dashboard-monitors/:id',
    DASHBOARD_MONITORS_SORTING: 'my/dashboard-monitors/sorting',
    PIPELINE_ITEMS: 'my/pipelines/:pipelineId/items',
    PIPELINE_ITEM: 'my/pipelines/:pipelineId/items/:id',
    PIPELINE_CONNECTORS: 'my/pipelines/:pipelineId/connectors',
    PIPELINE_CONNECTOR: 'my/pipelines/:pipelineId/connectors/:id',
    GROUPS: 'my/groups',
    GROUP: 'my/groups/:id',
    INVITATIONS: 'my/groups/:id/invitations',
    INVITATION: 'my/groups/:id/invitations/:invitationId',
    JOIN_GROUP: 'groups/:groupId/invitations/:invitationId/join',
    MY_GROUP_USERS: 'my/groups/:id/users',
    GROUP_NAMES: 'groups/name',
    MY_GROUP_DEVICES: 'my/groups/:groupId/devices',
    REFRESH_DASHBOARD_TOKEN: 'auth/refresh-dashboard-token',
    GROUP_DEVICE: 'groups/:groupId/devices/:deviceId',
    GROUP_DEVICES: 'groups/:groupId/devices',
    GROUP_DEVICE_LAST_ACTIVITY:
        'groups/:groupId/devices/:deviceId/last-activity',
    GROUP_DEVICE_PINS: 'groups/:groupId/devices/:deviceId/pins',
    GROUP_DEVICE_SWITCH_PIN: 'groups/:groupId/devices/:deviceId/switches/:pin',
    GROUP_DEVICE_LAST_DEVICE_IMAGE_THUMBNAIL:
        'groups/:groupId/devices/:deviceId/read-last-file-thumbnail',
    GROUP_DEVICE_LAST_DEVICE_IMAGE:
        'groups/:groupId/devices/:deviceId/read-last-file',
    GROUP_DEVICE_SENSOR_LOGS: 'groups/:groupId/devices/:deviceId/sensors/:pin',
    GROUP_DEVICE_PIN: 'groups/:groupId/devices/:deviceId/pins/:pin',
    GROUP_DEVICE_SENSOR_LOGS_AGGREGATE:
        'groups/:groupId/devices/:deviceId/sensors/:pin/aggregate',
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
