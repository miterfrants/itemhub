import './devices.module.scss';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.hook';
import { DevicesDataservice } from '../../dataservices/devices.dataservice';
import {
    selectDevices,
    devicesActions,
} from '../../redux/reducers/devices.reducer';
import { CookieHelper } from '../../helpers/cookie.helper';
import styles from './devices.module.scss';
import { useQuery } from '../../hooks/query.hook';

const Devices = () => {
    const query = useQuery();
    const dispatch = useAppDispatch();
    const devices = useAppSelector(selectDevices);

    useEffect(() => {
        const page = Number(query.get('page') || 1);
        const limit = Number(query.get('limit') || 20);
        const token = CookieHelper.GetCookie('token') || null;

        if (devices === null && token) {
            (async () => {
                const data = await DevicesDataservice.GetList(
                    token,
                    page,
                    limit
                );
                dispatch(devicesActions.addDevices(data.devices));
            })();
        }
    }, [devices, query, dispatch]);

    return (
        <div className={styles.Devices} data-testid="Devices">
            {devices?.map(({ id, name, createdAt }) => (
                <div key={id}>
                    <table>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>CreateTime</th>
                        </tr>
                        <tr>
                            <td>{id}</td>
                            <td>{name}</td>
                            <td>{createdAt}</td>
                        </tr>
                        <tr>
                            <Link to={`/dashboard/devices/${id}`}>
                                Go to {name} detail page
                            </Link>
                        </tr>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default Devices;
