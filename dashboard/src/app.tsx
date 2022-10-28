import './app.scss';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQuery } from './hooks/query.hook';
import {
    useGetTriggerTypesApi,
    useGetTriggerOperatorsApi,
    useGetMicrocontrollersApi,
    useGetDeviceModesApi,
    useGetTriggerNotificationPeriodApi,
    useGetProtocols,
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
    const { getMicrocontrollersApi } = useGetMicrocontrollersApi();
    const { getDeviceModesApi } = useGetDeviceModesApi();
    const { getProtocols } = useGetProtocols();

    const { fetchApi: getTriggerTypes } = useGetTriggerTypesApi();
    const { fetchApi: getTriggerNotificationPeriodApi } =
        useGetTriggerNotificationPeriodApi();

    useEffect(() => {
        getTriggerOperatorsApi();
        getMicrocontrollersApi();
        getDeviceModesApi();
        getTriggerTypes();
        getProtocols();
        getTriggerNotificationPeriodApi();
        // eslint-disable-next-line
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
