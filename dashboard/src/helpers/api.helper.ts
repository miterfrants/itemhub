import { CookieHelpers } from '@/helpers/cookie.helper';
import { RESPONSE_STATUS } from '@/constants/api';
import {
    SendRequestParams,
    FetchParams,
    FetchResult,
    FetchErrorResult,
} from '@/types/helpers.type';
import { COOKIE_KEY } from '@/constants/cookie-key';
import {
    toasterActions,
    ToasterTypeEnum,
} from '@/redux/reducers/toaster.reducer';
import { useDispatch } from 'react-redux';
import store, { AppDispatch } from '@/redux/store';
import { configureStore } from '@reduxjs/toolkit';

export const ApiHelpers = {
    SendRequestWithToken: <T>({
        apiPath,
        method,
        headers = {},
        payload,
        signal,
        shouldDeleteContentType = false,
        callbackFunc,
        skipErrorToaster = false,
    }: SendRequestParams<T>) => {
        const token =
            CookieHelpers.GetCookie({ name: COOKIE_KEY.DASHBOARD_TOKEN }) || '';
        return ApiHelpers.SendRequest<T>({
            apiPath,
            method,
            headers: { Authorization: `Bearer ${token}`, ...headers },
            payload,
            signal,
            shouldDeleteContentType,
            callbackFunc,
            skipErrorToaster,
        });
    },
    SendRequest: <T>({
        apiPath,
        method,
        headers = {},
        payload,
        signal,
        shouldDeleteContentType = false,
        callbackFunc,
        skipErrorToaster = false,
    }: SendRequestParams<T>) => {
        const fetchOption = payload
            ? {
                  method: method,
                  headers,
                  signal,
                  body: JSON.stringify(payload),
              }
            : {
                  method: method,
                  headers,
                  signal,
              };

        // eslint-disable-next-line no-async-promise-executor
        return new Promise<FetchResult<T>>(async (resolve, reject) => {
            let result: FetchResult<T>;
            let response: Response;

            try {
                response = await ApiHelpers.Fetch({
                    apiPath,
                    fetchOption,
                    shouldDeleteContentType,
                });
            } catch (error: any) {
                let errorResult: FetchErrorResult;
                if (error.name === 'AbortError') {
                    errorResult = {
                        httpStatus: 499,
                        status: RESPONSE_STATUS.CANCEL,
                        data: {
                            errorKey: 'CANCEL_REQUEST',
                            message: error.message,
                            stackTrace: error.name,
                        },
                    };
                } else {
                    errorResult = {
                        httpStatus: 404,
                        status: RESPONSE_STATUS.FAILED,
                        data: {
                            errorKey: 'UNKNOWN_ERROR',
                            message: error.message,
                            payload: [error.code],
                            stackTrace: error.name,
                        },
                    };
                }
                return reject(errorResult);
            }

            if (!response.ok) {
                let errorResult: FetchErrorResult;
                try {
                    const errorResponseJsonData = await response.json();
                    errorResult = {
                        httpStatus: response.status,
                        status: RESPONSE_STATUS.FAILED,
                        data: errorResponseJsonData,
                    };
                } catch (error: any) {
                    errorResult = {
                        httpStatus: 0,
                        status: RESPONSE_STATUS.FAILED,
                        data: {
                            errorKey: 'UNKNOWN_ERROR',
                            message: error.message,
                            payload: [error.code],
                            stackTrace: error.name,
                        },
                    };
                }
                if (!skipErrorToaster) {
                    store.dispatch(
                        toasterActions.pushOne({
                            message: errorResult.data.message,
                            duration: 10,
                            type: ToasterTypeEnum.ERROR,
                        })
                    );
                }

                return reject(errorResult);
            }

            if (response.status === 200) {
                const contentType = response.headers.get('content-type');
                const downloadTypes = [
                    'text/csv',
                    'application/zip',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ];
                const isDownloadFile =
                    contentType && downloadTypes.includes(contentType);

                if (isDownloadFile) {
                    result = await ApiHelpers.HandleDownloadFile({ response });
                } else {
                    const jsonData = await response.json();
                    result = {
                        httpStatus: response.status,
                        status: RESPONSE_STATUS.OK,
                        data: jsonData,
                    };
                }
            } else {
                result = {
                    httpStatus: response.status,
                    status: RESPONSE_STATUS.OK,
                    data: { message: response.statusText } as any,
                };
            }

            if (callbackFunc) {
                callbackFunc(result);
            }

            return resolve(result);
        });
    },
    Fetch: ({ apiPath, fetchOption, shouldDeleteContentType }: FetchParams) => {
        const headers = shouldDeleteContentType
            ? fetchOption.headers
            : {
                  'Content-Type': 'application/json',
                  ...fetchOption.headers,
              };

        if (
            fetchOption.body &&
            !(JSON.parse(fetchOption.body) instanceof FormData)
        ) {
            const newBody = JSON.parse(fetchOption.body);
            fetchOption.body = JSON.stringify(newBody);
        }

        const finalOption = {
            ...fetchOption,
            headers,
        };

        return fetch(apiPath, finalOption);
    },
    HandleDownloadFile: async ({ response }: { response: Response }) => {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        let filename: string | null = null;

        const disposition = response.headers.get('content-disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex =
                /filename[^;=\n]*=UTF-8''((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = window.decodeURIComponent(
                    matches[1].replace(/['"]/g, '')
                );
            }
        }

        a.classList.add('skip-swim-router');
        document.body.appendChild(a);
        a.href = url;
        if (filename !== null) {
            a.download = filename;
        }
        a.click();

        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 0);

        return {
            httpStatus: 200,
            status: RESPONSE_STATUS.OK,
            data: {
                message: 'Download file successfully.',
            } as any,
        };
    },
    AppendQueryStrings: ({
        basicPath,
        queryStrings,
    }: {
        basicPath: string;
        queryStrings: { [key: string]: any };
    }) => {
        const finalQueryStrings = Object.entries(queryStrings).reduce(
            (accQueryStrings, [key, value]) => {
                if (value || value === 0) {
                    return accQueryStrings === ''
                        ? `?${key}=${value}`
                        : `${accQueryStrings}&${key}=${value}`;
                }
                return accQueryStrings;
            },
            ''
        );
        return `${basicPath}${finalQueryStrings}`;
    },
};
