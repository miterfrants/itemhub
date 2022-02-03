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
        return ApiHelper.SendRequest(
            `${import.meta.env.VITE_API_ENDPOINT}${END_POINT.SIGN_WITH_EMAIL}`,
            {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );
    },
    IsSigned: async (token: string) => {
        return ApiHelper.SendRequestWithToken(
            `${import.meta.env.VITE_API_ENDPOINT}${END_POINT.IS_SIGNED}`,
            {
                token,
            },
            'POST'
        );
    },
};
