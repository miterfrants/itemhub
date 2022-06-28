import './app.scss';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from './hooks/query.hook';
import {
    useGetTriggerOperatorsApi,
    useGetMicrocontrollersApi,
    useGetDeviceModesApi,
} from '@/hooks/apis/universal.hook';

import { CookieHelpers } from './helpers/cookie.helper';
import { COOKIE_KEY } from './constants/cookie-key';
import Header from './components/header/header';
import Footer from './components/footer/footer';
import Dialog from './components/dialog/dialog';
import Toaster from './components/toaster/toaster';
import jwt_decode from 'jwt-decode';
import MonitorConfigDialog from './components/monitor-config-dialog/monitor-config-dialog';

const isDev = import.meta.env.VITE_ENV === 'dev';

const App = () => {
    const query = useQuery();
    const dashboardTokenFromQueryString =
        query.get(COOKIE_KEY.DASHBOARD_TOKEN) || '';

    if (isDev && dashboardTokenFromQueryString) {
        const payload = jwt_decode<{ exp: number }>(
            dashboardTokenFromQueryString
        );
        CookieHelpers.SetCookie({
            name: COOKIE_KEY.DASHBOARD_TOKEN,
            value: dashboardTokenFromQueryString,
            unixTimestamp: payload?.exp,
        });
    }

    const token = CookieHelpers.GetCookie({ name: COOKIE_KEY.DASHBOARD_TOKEN });
    if (!token) {
        window.location.href = import.meta.env.VITE_WEBSITE_URL;
    }

    const { getTriggerOperatorsApi } = useGetTriggerOperatorsApi();
    useEffect(() => {
        getTriggerOperatorsApi();
    }, []);

    const { getMicrocontrollersApi } = useGetMicrocontrollersApi();
    useEffect(() => {
        getMicrocontrollersApi();
    }, []);

    const { getDeviceModesApi } = useGetDeviceModesApi();
    useEffect(() => {
        getDeviceModesApi();
    }, []);

    return token ? (
        <div className="dashboard" data-testid="Dashboard">
            <div className="d-md-flex">
                <Header />
                <div className="position-relative container-fluid px-0 bg-grey-100 content">
                    <Outlet />
                    <Footer />
                </div>
            </div>
            <Dialog />
            <MonitorConfigDialog />
            <Toaster />
        </div>
    ) : (
        <>Redirect</>
    );
};

export default App;
