import { useAppSelector } from '@/hooks/redux.hook';
import { useEffect, useState } from 'react';
import closeIcon from '@/assets/images/dark-close.svg';
import { RESPONSE_STATUS } from '@/constants/api';
import {
    useDeleteGroupUsersApi,
    useGetGroupUsersApi,
} from '@/hooks/apis/group-users.hook';
import { GroupUsersType } from '@/types/group-users.type';
import { selectGroupUsers } from '@/redux/reducers/group-users.reducer';
import Spinner from '../spinner/spinner';
const GroupUsers = ({ groupId }: { groupId: number | undefined }) => {
    const [groupUsers, setGroupUsers] = useState<GroupUsersType[] | undefined>(
        undefined
    );
    const [shouldBeDeleteId, setShouldBeDeleteId] = useState<number>(0);
    const [isGetted, setIsGetted] = useState<boolean>(false);
    const groupUsersFromStore: GroupUsersType[] =
        useAppSelector(selectGroupUsers);

    const {
        isLoading: isGetting,
        fetchApi: getGroupUsers,
        data: responseOfGet,
    } = useGetGroupUsersApi({
        groupId: groupId || 0,
    });
    const { fetchApi: deleteGroupUsers, data: responseOfDelete } =
        useDeleteGroupUsersApi({
            groupId: groupId || 0,
            id: shouldBeDeleteId,
        });

    useEffect(() => {
        getGroupUsers();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (shouldBeDeleteId === 0) {
            return;
        }
        deleteGroupUsers();
        // eslint-disable-next-line
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setShouldBeDeleteId(0);
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    useEffect(() => {
        setGroupUsers([
            ...groupUsersFromStore.filter((item) => item.groupId == groupId),
        ]);
        // eslint-disable-next-line
    }, [groupUsersFromStore]);

    useEffect(() => {
        if (!isGetted && responseOfGet) {
            setIsGetted(true);
        }
        // eslint-disable-next-line
    }, [isGetting, responseOfGet]);

    return (
        <div className="card">
            <div>
                <label className="form-label" htmlFor="title">
                    群組使用者
                </label>
            </div>
            {isGetting && !isGetted ? (
                <div className="d-flex justify-content-center">
                    <Spinner />
                </div>
            ) : (
                <div className="d-inline-flex flex-wrap align-items-center mt-2">
                    {groupUsers &&
                        groupUsers.map((item) => {
                            return (
                                <div
                                    className={`px-3 py-1 border border-1 me-3 rounded-2 d-flex align-items-center mb-3 ${
                                        !item.id
                                            ? 'border-warn bg-warn bg-opacity-30'
                                            : 'border-gray-400'
                                    }`}
                                    key={`${item.id}-${item.email}`}
                                >
                                    {item.email}
                                    <img
                                        role="button"
                                        className="ms-2"
                                        src={closeIcon}
                                        onClick={() => {
                                            setShouldBeDeleteId(item.id || 0);
                                        }}
                                    />
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};
export default GroupUsers;
