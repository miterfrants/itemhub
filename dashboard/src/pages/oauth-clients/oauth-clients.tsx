import { useEffect, useState } from 'react';
import { useQuery } from '@/hooks/query.hook';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux.hook';
import {
    useDeleteOauthClients,
    useGetOauthClients,
} from '@/hooks/apis/oauth-clients.hook';
import { selectOauthClients } from '@/redux/reducers/oauth-clients.reducer';
import Pagination from '@/components/pagination/pagination';
import { RESPONSE_STATUS } from '@/constants/api';
import PageTitle from '@/components/page-title/page-title';

const OauthClients = () => {
    const query = useQuery();
    const limit = Number(query.get('limit') || 5);
    const page = Number(query.get('page') || 1);

    const { oauthClients, rowNum } = useAppSelector(selectOauthClients);

    const [selectedIds, setSelectedIds] = useState(Array<number>());
    const [refreshFlag, setRefreshFlag] = useState(false);

    const { isLoading, fetchApi } = useGetOauthClients({
        page,
        limit,
    });

    const {
        isLoading: isDeleting,
        fetchApi: deleteMultipleApi,
        data: responseOfDelete,
    } = useDeleteOauthClients(selectedIds);

    useEffect(() => {
        fetchApi();
    }, [page, refreshFlag]);

    useEffect(() => {
        if (responseOfDelete?.status === RESPONSE_STATUS.OK) {
            setRefreshFlag(!refreshFlag);
        }
    }, [responseOfDelete]);

    const check = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedIds((previous) => {
            const newSelectedIds = [...previous];
            if (event.target.checked) {
                newSelectedIds.push(Number(event.target.value));
            } else {
                const index = newSelectedIds.findIndex(
                    (item) => item === Number(event.target.value)
                );
                newSelectedIds.splice(index, 1);
            }

            return newSelectedIds;
        });
    };

    return (
        <div className="oauth-clients" data-testid="oauth-clients">
            <PageTitle title="oAuth Client 列表" />
            <div>
                <button
                    onClick={deleteMultipleApi}
                    disabled={isDeleting || selectedIds.length <= 0}
                >
                    {isDeleting ? 'Deleting' : 'Delete Selected Row'}
                </button>
                <Link
                    to={`/dashboard/oauth-clients/create`}
                    className="btn btn-lg"
                >
                    Create
                </Link>
            </div>

            {isLoading || oauthClients === null ? (
                <div>Loading</div>
            ) : (
                oauthClients.map(({ id, clientId }) => (
                    <label className="d-flex align-items-top" key={id}>
                        <input type="checkbox" onChange={check} value={id} />
                        <div>
                            <div>
                                <span>Id</span>
                                <span>ClientId</span>
                            </div>
                            <Link to={`/dashboard/oauth-clients/${id}`}>
                                <span>{id}</span>
                                <span>{clientId}</span>
                            </Link>
                        </div>
                    </label>
                ))
            )}
            <div>Page: {page}</div>
            <Pagination rowNum={rowNum} page={page} limit={limit} />
        </div>
    );
};

export default OauthClients;
