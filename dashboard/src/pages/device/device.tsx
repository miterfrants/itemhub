import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './device.module.scss';
import { CookieHelper } from '../../helpers/cookie.helper';
import { DevicesDataservice } from '../../dataservices/devices.dataservice';

const Device = () => {
    const { id } = useParams();
    const [device, setDevice] = useState<{ name: string; id: number } | null>(
        null
    );
    useEffect(() => {
        (async () => {
            const token = CookieHelper.GetCookie('token') || '';
            const data: any = await DevicesDataservice.GetOne(token, Number(id));
            setDevice(data);
        })();

        return () => {
            setDevice(null);
        };
    }, [id]);

    return (
        <div className={styles.Device} data-testid="Device">
            Device Component: Id: {id}
            {JSON.stringify(device)}
            <br />
            <Link to="../devices">Back</Link>
        </div>
    );
};

export default Device;
