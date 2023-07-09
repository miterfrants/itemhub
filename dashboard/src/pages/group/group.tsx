import GroupUsers from '@/components/group-users/group-users';
import Invitation from '@/components/invitation/invitation';
import PageTitle from '@/components/page-title/page-title';
import Spinner from '@/components/spinner/spinner';
import { RESPONSE_STATUS } from '@/constants/api';
import {
    useCreateGroupApi,
    useGetGroupApi,
    useUpdateGroupApi,
} from '@/hooks/apis/groups.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectGroups } from '@/redux/reducers/groups.reducer';
import {
    ToasterTypeEnum,
    toasterActions,
} from '@/redux/reducers/toaster.reducer';
import { GroupType } from '@/types/group.type';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

interface ValidationInterface {
    name: { isInvalid: boolean; errorMessage: string[] };
}

const Group = () => {
    const { id: idFromUrl } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const id: number | undefined = idFromUrl ? Number(idFromUrl) : undefined;
    const isCreateMode = !idFromUrl;
    const fromStore = useAppSelector(selectGroups);
    const [group, setGroup] = useState<GroupType | undefined>(undefined);
    const [validation, setValidation] = useState<ValidationInterface>({
        name: {
            isInvalid: false,
            errorMessage: [],
        },
    });
    const { isLoading: isGetting, fetchApi: getGroup } = useGetGroupApi(
        Number(id)
    );
    const {
        isLoading: isCreating,
        fetchApi: createGroup,
        data: responseOfCreate,
    } = useCreateGroupApi(group || ({ name: '' } as GroupType));
    const {
        isLoading: isUpdating,
        fetchApi: updateGroup,
        data: responseOfUpdate,
    } = useUpdateGroupApi(group || ({ name: '' } as GroupType));

    useEffect(() => {
        if (isCreateMode) {
            return;
        }
        const targetGroup = (fromStore.groups || []).find(
            (item) => item.id === id
        );

        if (!targetGroup) {
            getGroup();
            return;
        }
        setGroup(targetGroup);
        //eslint-disable-next-line
    }, [fromStore]);

    useEffect(() => {
        if (responseOfCreate && responseOfCreate?.id) {
            navigate(`/dashboard/groups/${responseOfCreate.id}`);
            dispatch(
                toasterActions.pushOne({
                    message: '新增成功',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [responseOfCreate]);

    useEffect(() => {
        if (
            responseOfUpdate &&
            responseOfUpdate?.status === RESPONSE_STATUS.OK
        ) {
            dispatch(
                toasterActions.pushOne({
                    message: '更新成功',
                    duration: 5,
                    type: ToasterTypeEnum.INFO,
                })
            );
        }
        // eslint-disable-next-line
    }, [responseOfUpdate]);

    const validate = (_group: GroupType) => {
        if (!_group.name) {
            setValidation({
                ...validation,
                name: {
                    isInvalid: true,
                    errorMessage: ['名稱為必填欄位'],
                },
            });
            return false;
        }
        return true;
    };

    const back = () => {
        navigate(`/dashboard/groups`);
    };

    const sendApi = () => {
        if (!group || !validate(group)) {
            return;
        }

        isCreateMode ? createGroup() : updateGroup();
    };

    return (
        <div className="group">
            <PageTitle
                primaryButtonWording="新增群組"
                secondaryButtonWording="重新整理"
                title={isCreateMode ? '新增群組' : '編輯群組'}
            />
            <div className="card">
                {isGetting && group === undefined && !isCreateMode ? (
                    <div className="d-flex justify-content-center">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <label className="form-label" htmlFor="title">
                                名稱
                            </label>
                            <input
                                className={`form-control ${
                                    validation.name.isInvalid && 'border-danger'
                                }`}
                                type="text"
                                placeholder="輸入名稱"
                                value={group?.name}
                                onChange={(e) => {
                                    setGroup({
                                        ...group,
                                        name: e.currentTarget.value,
                                    } as GroupType);
                                }}
                            />
                            {validation.name.isInvalid && (
                                <div className="text-danger mt-1 fs-5">
                                    {validation.name.errorMessage.join(' ')}
                                </div>
                            )}
                        </div>

                        <div className="d-flex flex-wrap justify-content-end mt-5">
                            <button
                                className="btn btn-secondary me-3"
                                onClick={back}
                            >
                                返回
                            </button>
                            <button
                                disabled={isCreating || isUpdating}
                                className="btn btn-primary"
                                onClick={sendApi}
                            >
                                {isCreateMode ? (
                                    <div>新增</div>
                                ) : (
                                    <div>儲存編輯</div>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
            {!isCreateMode && <Invitation groupId={id} />}
            {!isCreateMode && <GroupUsers groupId={id} />}
        </div>
    );
};

export default Group;
