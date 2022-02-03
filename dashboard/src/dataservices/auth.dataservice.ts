import { END_POINT } from '../constants';
import { ApiHelper } from '../helpers/api.helper';

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
        return ApiHelper.SendRequest({
            apiPath,
            method: 'POST',
            payload: {
                email,
                password,
            },
        });
    },
    IsSigned: async (token: string) => {
        const apiPath = `${import.meta.env.VITE_API_ENDPOINT}${
            END_POINT.IS_SIGNED
        }`;
        return ApiHelper.SendRequestWithToken({
            apiPath,
            token,
            method: 'POST',
        });
    },
};
