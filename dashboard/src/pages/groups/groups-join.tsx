import Spinner from '@/components/spinner/spinner';
import { RESPONSE_STATUS } from '@/constants/api';
import { COOKIE_KEY } from '@/constants/cookie-key';
import { useJoinGroupApi } from '@/hooks/apis/groups.hook';
import { useQuery } from '@/hooks/query.hook';
import { JoinGroupType } from '@/types/join-group.type';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const GroupsJoin = () => {
    const query = useQuery();
    const token = query.get('token') || '';

    const { id: idFromUrl, invitationId: invitationIdFromUrl } = useParams();
    const {
        fetchApi: joinGroup,
        isLoading: isJoining,
        data: responseOfJoinGroup,
        error: errorOfJoinGroup,
    } = useJoinGroupApi({
        id: idFromUrl,
        token,
        invitationId: invitationIdFromUrl,
    } as JoinGroupType);

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
