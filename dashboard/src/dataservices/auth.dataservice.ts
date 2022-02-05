import { END_POINT } from '@/constants';
import { ApiHelper } from '@/helpers/api.helper';

export const AuthDataservice = {
    SignWithEmail: async ({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) => {
        const apiPath = `${import.meta.env.VITE_API_ENDPOINT}${
            END_POINT.SIGN_WITH_EMAIL
        }`;

        const response: any = await ApiHelper.SendRequest({
            apiPath,
            method: 'POST',
            payload: {
                email,
                password,
            },
        });

        return response.data as { token: string };
    },
    IsSigned: async () => {
        const apiPath = `${import.meta.env.VITE_API_ENDPOINT}${
            END_POINT.IS_SIGNED
        }`;
        return ApiHelper.SendRequestWithToken({
            apiPath,
            method: 'POST',
        });
    },
};
