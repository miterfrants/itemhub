export interface TriggerOerator {
    key: 'B' | 'BE' | 'L' | 'LE' | 'E';
    value: 0 | 1 | 2 | 3 | 4;
    label: string;
    symbol: '>' | '>=' | '<' | '<=' | '=' | null;
}

export interface Microcontroller {
    id: number;
    key: string;
    pins: Pins[];
    memo: string;
    supportedProtocols: string[];
}

export interface Pins {
    name: string;
    pinNumber: string;
}
export interface DeviceMode {
    key: string;
    value: number;
    label: string;
}

export interface DashboardMonitorMode {
    key: string;
    value: number;
    label: string;
}

export interface Protocols {
    key: string;
    value: number;
    label: string;
}

export interface UniversalOption {
    key: string;
    value: number;
    label: string;
}
