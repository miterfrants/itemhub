import { Link, Outlet } from 'react-router-dom';
import styles from './dashboard.module.scss';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import { useIsSigned } from '../../hooks/is-signed.hook';

const Dashboard = () => {
    const { loading, error } = useIsSigned();

    if (error && import.meta.env.VITE_ENV === 'prod') {
        location.href = '/';
    }
    return (
        <div className={styles.dashboard} data-testid="Dashboard">
            {loading ? (
                <div>Loading</div>
            ) : error ? (
                <div>{JSON.stringify(error)}</div>
            ) : (
                <div>
                    <Header />
                    <nav>
                        <Link to="/dashboard/devices">Devices</Link> |{' '}
                        <Link to="/dashboard/triggers">Triggers</Link> |{' '}
                        <Link to="/dashboard/oauth-clients">oAuth Clients</Link>
                    </nav>
                    <Outlet />
                    <Footer />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
