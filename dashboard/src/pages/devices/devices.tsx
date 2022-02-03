import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { DeviceDataservice } from '../../dataservices/device.dataservice';
import {
    selectDevices,
    devicesActions,
} from '../../redux/reducers/devices.reducer';
import { CookieHelper } from '../../helpers/cookie.helper';
import styles from './devices.module.scss';
import { useQuery } from '../../hooks/query.hook';

const Devices = () => {
    const query = useQuery();
    const dispatch = useDispatch();
    const devices = useSelector(selectDevices);

    useEffect(() => {
        const page = Number(query.get('page') || 1);
        const limit = Number(query.get('limit') || 20);
        const token = CookieHelper.GetCookie('token') || null;

        if (devices === null && token) {
            (async () => {
                const data: any = await DeviceDataservice.GetList(
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
            {devices?.map((item) => (
                <div key={item.id}>
                    <Link to={`/dashboard/devices/${item.id}`}>
                        {item.name}
                    </Link>
                    <br />
                </div>
            ))}
        </div>
    );
};

export default Devices;
