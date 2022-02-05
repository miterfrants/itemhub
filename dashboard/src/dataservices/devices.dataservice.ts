import { END_POINT } from '../constants';
import { ApiHelper } from '../helpers/api.helper';
import { Device } from '../types/devices.type';

export const DevicesDataservice = {
    GetList: async (token: string, page: number, limit: number) => {
        const apiPath = `${import.meta.env.VITE_API_ENDPOINT}${
            END_POINT.DEVICES
        }?page=${page}&limit=${limit}`;

        const response: any = await ApiHelper.SendRequestWithToken({
            apiPath,
            token,
            method: 'GET',
        });

        return response.data as {
            devices: Device[];
            rowNums: number;
        };
    },
    GetOne: async (token: string, id: number) => {
        let apiPath = `${import.meta.env.VITE_API_ENDPOINT}${END_POINT.DEVICE}`;
        apiPath = apiPath.replace(':id', id.toString());

        const response: any = await ApiHelper.SendRequestWithToken({
            apiPath,
            token,
            method: 'GET',
        });
        return response.data;
    },
};
