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
}

export interface Pins {
    name: string;
    value: number;
}
export interface DeviceMode {
    key: string;
    value: number;
    label: string;
}

export interface TriggerType {
    key: string;
    value: number;
    label: string;
}
