export interface SendRequestParams<T> {
    apiPath: string;
    method: string;
    signal: AbortSignal;
    headers?: { [key: string]: string };
    payload?: { [key: string]: any };
    shouldDeleteContentType?: boolean;
    callbackFunc?: (result: FetchResult<T>) => null;
    skipErrorToaster?: boolean;
}

export interface FetchParams {
    apiPath: string;
    fetchOption: {
        method: string;
        headers: { [key: string]: string };
        signal: AbortSignal;
        body?: string;
    };
    shouldDeleteContentType: boolean;
}

export type FetchResult<T> = {
    httpStatus: number;
    status: string;
    data: T;
};

export interface FetchErrorResultData {
    errorKey: string;
    message: string;
    payload?: any[];
    stackTrace: string;
}
export interface FetchErrorResult {
    httpStatus: number;
    status: string;
    data: FetchErrorResultData;
}

export interface SetCookieParams {
    name: string;
    value: string;
    days?: number;
    unixTimestamp?: number;
}
