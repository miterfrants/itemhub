interface SendRequestParams {
    apiPath: string;
    method: string;
    headers?: object;
    payload?: any;
    callbackFunc?: (result: any) => null;
}

interface SendRequestWithTokenParams extends SendRequestParams {
    token: string;
}

interface FetchParams {
    apiPath: string;
    fetchOption: any;
}

export const ApiHelper = {
    SendRequestWithToken: ({
        apiPath,
        token,
        method,
        headers = {},
        payload = null,
        callbackFunc,
    }: SendRequestWithTokenParams) => {
        return ApiHelper.SendRequest({
            apiPath,
            method,
            headers: { Authorization: `Bearer ${token}`, ...headers },
            payload,
            callbackFunc,
        });
    },
    SendRequest: ({
        apiPath,
        method,
        headers = {},
        payload = null,
        callbackFunc,
    }: SendRequestParams) => {
        const fetchOption = payload
            ? {
                  method: method,
                  headers,
                  body: JSON.stringify(payload),
              }
            : {
                  method: method,
                  headers,
              };

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            let result: any;
            let response: Response;
            try {
                response = await ApiHelper.Fetch({ apiPath, fetchOption });
            } catch (error) {
                result = {
                    status: 'FAILED',
                    data: {
                        message: error,
                    },
                };
                resolve(result);
                return;
            }

            const contentType = response.headers.get('content-type');
            const isDownloadFile = contentType
                ? [
                      'text/csv',
                      'application/vnd.ms-excel',
                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  ].includes(contentType)
                : false;

            if (response.status === 200 && !isDownloadFile) {
                const jsonData = await response.json();
                result = {
                    status: 'OK',
                    httpStatus: response.status,
                    data: jsonData,
                };
            } else if (response.status === 200 && isDownloadFile) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                let filename = null;
                const disposition = response.headers.get('content-disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const filenameRegex =
                        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
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
                result = {
                    status: 'OK',
                    httpStatus: 200,
                };
            } else if (response.status === 204) {
                result = {
                    status: 'FAILED',
                    httpStatus: response.status,
                    data: {
                        message: '沒有資料',
                    },
                };
            } else {
                const jsonData = await response.json();
                result = {
                    status: 'FAILED',
                    httpStatus: response.status,
                    data: {
                        message: jsonData.message,
                        invalidatedPayload: jsonData.invalidatedPayload,
                    },
                };
            }
            if (callbackFunc) {
                callbackFunc(result);
            }
            resolve(result);
        });
    },
    Fetch: ({ apiPath, fetchOption }: FetchParams) => {
        if (fetchOption.cache) {
            console.warn('Cound not declate cache in option params');
        }

        if (fetchOption.method === 'GET') {
            delete fetchOption.body;
        }

        const headers = {
            'Content-Type': 'application/json',
            ...fetchOption.headers,
        };

        if (
            fetchOption &&
            fetchOption.headers &&
            fetchOption.headers['Content-Type'] === null
        ) {
            delete headers['Content-Type'];
        }
        if (fetchOption.body && !(fetchOption.body instanceof FormData)) {
            const newBody = JSON.parse(fetchOption.body);
            for (const key in newBody) {
                if (newBody[key] === true) {
                    newBody[key] = 1;
                } else if (newBody[key] === false) {
                    newBody[key] = 0;
                }
            }
            fetchOption.body = JSON.stringify(newBody);
        }
        const newOption = {
            ...fetchOption,
            headers,
        };
        console.log({ apiPath, newOption });
        return fetch(apiPath, newOption);
    },
    LocalError: (reason: string): any => {
        return {
            status: 'FAILED',
            data: {
                message: reason,
            },
        };
    },
};
