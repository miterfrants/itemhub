import { END_POINT } from '../constants';
import { ApiHelper } from '../helpers/api.helper';

export const DevicesDataservice = {
    GetList: async (token: string, page: number, limit: number) => {
        const apiPath = `${import.meta.env.VITE_API_ENDPOINT}${
            END_POINT.DEVICES
        }?page=${page}&limit=${limit}`;
        const resp: any = await ApiHelper.SendRequestWithToken({
            apiPath,
            token,
            method: 'GET',
            payload: {
                page,
                limit,
            },
        });
        return resp.data;
    },
    GetOne: async (token: string, id: number) => {
        let apiPath = `${import.meta.env.VITE_API_ENDPOINT}${END_POINT.DEVICE}`;
        apiPath = apiPath.replace(':id', id.toString());

        const resp: any = await ApiHelper.SendRequestWithToken({
            apiPath,
            token,
            method: 'GET',
        });
        return resp.data;
    },
};
