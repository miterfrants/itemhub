import Spinner from '@/components/spinner/spinner';
import { RESPONSE_STATUS } from '@/constants/api';
import { COOKIE_KEY } from '@/constants/cookie-key';
import { CookieHelpers } from '@/helpers/cookie.helper';
import { useRefreshTokenApi } from '@/hooks/apis/auth.hook';
import { useJoinGroupApi } from '@/hooks/apis/groups.hook';
import { useQuery } from '@/hooks/query.hook';
import { JoinGroupType } from '@/types/join-group.type';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const GroupsJoin = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const token = query.get('token') || '';

    const { id: idFromUrl, invitationId: invitationIdFromUrl } = useParams();
    const {
        fetchApi: joinGroup,
        isLoading: isJoining,
        data: responseOfJoinGroup,
        error: errorOfJoinGroup,
    } = useJoinGroupApi({
        groupId: idFromUrl,
        token,
        invitationId: invitationIdFromUrl,
    } as JoinGroupType);

    const { fetchApi: refreshToken, data: responseOfRefreshToken } =
        useRefreshTokenApi();

    useEffect(() => {
        if (!idFromUrl || !token || !invitationIdFromUrl) {
            return;
        }
        joinGroup();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!errorOfJoinGroup) {
            return;
        }
    }, [errorOfJoinGroup]);

    useEffect(() => {
        if (!responseOfJoinGroup) {
            return;
        }
        if (responseOfJoinGroup.status === RESPONSE_STATUS.OK) {
            refreshToken();
        }
        // eslint-disable-next-line
    }, [responseOfJoinGroup]);

    useEffect(() => {
        if (!responseOfRefreshToken) {
            return;
        }
        const payload = jwt_decode<{ exp: number }>(
            responseOfRefreshToken.dashboardToken
        );
        CookieHelpers.SetCookie({
            name: COOKIE_KEY.DASHBOARD_TOKEN,
            value: responseOfRefreshToken.dashboardToken,
            unixTimestamp: payload?.exp,
        });
        const payloadOfRefreshToken = jwt_decode<{ exp: number }>(
            responseOfRefreshToken.dashboardRefreshToken
        );
        CookieHelpers.SetCookie({
            name: COOKIE_KEY.DASHBOARD_REFRESH_TOKEN,
            value: responseOfRefreshToken.dashboardRefreshToken,
            unixTimestamp: payloadOfRefreshToken?.exp,
        });
        setTimeout(() => {
            navigate(`/dashboard/groups/${idFromUrl}/devices`);
        }, 3000);
    }, [responseOfRefreshToken]);
    return (
        <div className="groups-join">
            <div className="card mt-5">
                {isJoining && (
                    <>
                        <div className="text-center">正在加入群組中</div>
                        <div className="w-100 d-flex justify-content-center my-4">
                            <Spinner />
                        </div>
                    </>
                )}

                {!isJoining &&
                    !errorOfJoinGroup &&
                    responseOfJoinGroup?.status === RESPONSE_STATUS.OK && (
                        <div>
                            <h3 className="text-center">加入成功</h3>
                            <div className="text-center">
                                三秒後導到群組裝置列表
                            </div>
                        </div>
                    )}

                {!isJoining && errorOfJoinGroup && (
                    <div>
                        <h3 className="text-center">加入群組發生錯誤</h3>
                        <div className="text-center text-warn">
                            {errorOfJoinGroup.message &&
                            errorOfJoinGroup.message.indexOf(
                                'Duplicate entry'
                            ) !== -1
                                ? '重複加入群組'
                                : errorOfJoinGroup.message}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupsJoin;
