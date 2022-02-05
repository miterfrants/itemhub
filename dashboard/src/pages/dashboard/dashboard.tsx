import { Link, Outlet } from 'react-router-dom';
import styles from './dashboard.module.scss';
import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';

const Dashboard = () => {
    return (
        <div className={styles.dashboard} data-testid="Dashboard">
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
        </div>
    );
};

export default Dashboard;
