export interface ResponseOK {
    status: string;
}

export interface ResponseError {
    errorKey: string;
    message: string;
    payload: any;
}
