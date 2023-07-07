import { ValidationHelpers } from '@/helpers/validation.helper';
import {
    useCreateInvitationsApi,
    useDeleteInvitationsApi,
    useGetInvitationsApi,
} from '@/hooks/apis/invitations.hook';
import { useAppSelector } from '@/hooks/redux.hook';
import { selectInvitations } from '@/redux/reducers/invitations.reducer';
import { InvitationType } from '@/types/invitation.type';
import { useEffect, useRef, useState } from 'react';
import closeIcon from '@/assets/images/dark-close.svg';
import { RESPONSE_STATUS } from '@/constants/api';
interface ValidationInterface {
    email: { isInvalid: boolean; errorMessage: string[] };
}
const Invitation = ({ groupId }: { groupId: number | undefined }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [invitations, setInvitations] = useState<InvitationType[]>([]);
    const [validation, setValidation] = useState<ValidationInterface>({
        email: {
            isInvalid: false,
            errorMessage: [],
        },
    });
    const [shouldBeCreatedEmails, setShouldBeCreatedEmails] = useState<
        string[]
    >([]);

    const [shouldBeDeleteId, setShouldBeDeleteId] = useState<number>(0);

    const invitationsFromStore: InvitationType[] =
        useAppSelector(selectInvitations);

    const { isLoading: isGetting, fetchApi: getInvitations } =
        useGetInvitationsApi({
            groupId: groupId || 0,
        });

    const { isLoading: isCreating, fetchApi: createInvitations } =
        useCreateInvitationsApi({
            groupId: groupId || 0,
            emails: shouldBeCreatedEmails,
        });

    const {
        isLoading: isDeleting,
        fetchApi: deleteInvitation,
        data: responseOfDelete,
    } = useDeleteInvitationsApi({
        groupId: groupId || 0,
        id: shouldBeDeleteId,
    });

    useEffect(() => {
        getInvitations();
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (shouldBeDeleteId === 0) {
            return;
        }
        deleteInvitation();
        // eslint-disable-next-line
    }, [shouldBeDeleteId]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setShouldBeDeleteId(0);
        }
        // eslint-disable-next-line
    }, [responseOfDelete]);

    useEffect(() => {
        const shouldBeCreatedInvitations = invitations
            .filter((item) => !item.id)
            .map((item) => item.email || '');
        setShouldBeCreatedEmails(shouldBeCreatedInvitations);
    }, [invitations]);

    useEffect(() => {
        if (shouldBeCreatedEmails.length === 0) {
            return;
        }
        createInvitations();
        // eslint-disable-next-line
    }, [shouldBeCreatedEmails]);

    useEffect(() => {
        setInvitations([
            ...invitationsFromStore.filter((item) => item.groupId == groupId),
        ]);
        // eslint-disable-next-line
    }, [invitationsFromStore]);

    const validateAndAddInvitation = (element: HTMLInputElement) => {
        const email = element.value;
        const isValidated = ValidationHelpers.isEmail(email);

        if (!isValidated) {
            setValidation({
                ...validation,
                email: {
                    isInvalid: true,
                    errorMessage: ['Email 格式錯誤'],
                },
            });
        } else {
            setValidation({
                ...validation,
                email: {
                    isInvalid: false,
                    errorMessage: [],
                },
            });
        }

        const emailExists = invitations.find((item) => item.email === email)
            ? true
            : false;

        if (emailExists) {
            setValidation({
                ...validation,
                email: {
                    isInvalid: true,
                    errorMessage: ['Email 已經存在'],
                },
            });
        }

        if (isValidated && !emailExists) {
            setInvitations([
                ...invitations,
                {
                    email: element.value,
                } as InvitationType,
            ]);
            element.value = '';
        }
    };

    return (
        <div className="card">
            <div>
                <label className="form-label" htmlFor="title">
                    邀請清單
                </label>
                <div className="d-flex">
                    <input
                        className={`form-control me-3 ${
                            validation.email.isInvalid && 'border-danger'
                        }`}
                        type="text"
                        placeholder="輸入 Email"
                        ref={inputRef}
                        onKeyUp={(e) => {
                            if (e.nativeEvent.key === 'Enter') {
                                validateAndAddInvitation(e.currentTarget);
                            }
                        }}
                    />

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            if (!inputRef.current) {
                                return;
                            }
                            validateAndAddInvitation(inputRef.current);
                        }}
                    >
                        新增
                    </button>
                </div>
                {validation.email.isInvalid && (
                    <div className="text-danger mt-1 fs-5">
                        {validation.email.errorMessage.join(' ')}
                    </div>
                )}
            </div>
            <div className="d-inline-flex flex-wrap align-items-center mt-3">
                {invitations.map((invitation) => {
                    return (
                        <div
                            className={`px-3 py-1 border border-1 me-3 rounded-2 d-flex align-items-center mb-3 ${
                                !invitation.id
                                    ? 'border-warn bg-warn bg-opacity-30'
                                    : 'border-gray-400'
                            }`}
                            key={`${invitation.id}-${invitation.email}`}
                        >
                            {invitation.email}
                            <img
                                role="button"
                                className="ms-2"
                                src={closeIcon}
                                onClick={() => {
                                    setShouldBeDeleteId(invitation.id || 0);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default Invitation;
