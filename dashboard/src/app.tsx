import './app.scss';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from './hooks/query.hook';
import {
    useGetTriggerOperatorsApi,
    useGetMicrocontrollersApi,
    useGetDeviceModesApi,
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
import OfflineNotificationDialog from './components/offline-notification-dialog/offline-notification-dialog';
import RealtimeDeviceImageDialog from './components/realtime-device-image-dialog/realtime-device-image-dialog';
import moment from 'moment';
import { useGetGroupNamesApi } from './hooks/apis/groups.hook';
import ComputedFunctionDialog from './components/computed-function-dialog/computed-function-dialog';
import PipelineExecuteLogDialog from './components/pipeline-execute-log-dialog/pipeline-execute-log-dialog';

const isDev = import.meta.env.VITE_ENV === 'dev';

const App = () => {
    const query = useQuery();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const dashboardTokenFromQueryString =
        query.get(COOKIE_KEY.DASHBOARD_TOKEN) || '';

    const dashboardRefreshTokenFromQueryString =
        query.get(COOKIE_KEY.DASHBOARD_REFRESH_TOKEN) || '';

    if (isDev && dashboardTokenFromQueryString) {
        const payload = jwt_decode<{ exp: number }>(
            dashboardTokenFromQueryString
        );
        CookieHelpers.SetCookie({
            name: COOKIE_KEY.DASHBOARD_TOKEN,
            value: dashboardTokenFromQueryString,
            unixTimestamp: payload?.exp,
        });

        CookieHelpers.SetCookie({
            name: COOKIE_KEY.DASHBOARD_REFRESH_TOKEN,
            value: dashboardRefreshTokenFromQueryString,
            unixTimestamp: payload?.exp,
        });
    }

    const token = CookieHelpers.GetCookie({ name: COOKIE_KEY.DASHBOARD_TOKEN });

    // invitation
    const isInvitationUrl =
        /\/dashboard\/groups\/\d+\/invitations\/\d+\/join/gi.test(pathname);
    let isTokenExpired = false;
    const groupIds = useRef([]);
    let isGroupUser = false;

    if (token) {
        const payload = jwt_decode<{ exp: number; roles: string[] }>(token);
        isGroupUser =
            payload.roles.filter((item) => item.startsWith('group_')).length >=
            1;
        Array.prototype.push.apply(
            groupIds.current,
            payload.roles
                .filter((item) => item.startsWith('group_'))
                .map((item) => Number(item.replace('group_', '')))
        );
        isTokenExpired = payload.exp <= moment().unix();
    }

    if ((!token || isTokenExpired) && isInvitationUrl) {
        const { id: groupId, invitationId } = params;
        CookieHelpers.SetCookie({
            name: COOKIE_KEY.INVITATION,
            value: JSON.stringify({
                token: query.get('token') || '',
                groupId,
                invitationId,
            }),
            unixTimestamp: moment().add(1, 'hours').unix(),
        });
    }

    if (!token || isTokenExpired) {
        window.location.href = import.meta.env.VITE_WEBSITE_URL;
    }

    // join group
    if (!isInvitationUrl) {
        const rawInvitationData = CookieHelpers.GetCookie({
            name: COOKIE_KEY.INVITATION,
        });
        if (rawInvitationData) {
            const invitation = JSON.parse(rawInvitationData);
            navigate(
                `/dashboard/groups/${invitation.groupId}/invitations/${invitation.invitationId}/join?token=${invitation.token}`
            );
        }
    }

    const { getTriggerOperatorsApi } = useGetTriggerOperatorsApi();
    const { getProtocols } = useGetProtocols();
    const { getMicrocontrollersApi } = useGetMicrocontrollersApi();
    const { getDeviceModesApi } = useGetDeviceModesApi();
    const { fetchApi: getGroupNames, data: groups } = useGetGroupNamesApi(
        groupIds.current
    );

    useEffect(() => {
        getTriggerOperatorsApi();
        getMicrocontrollersApi();
        getDeviceModesApi();
        getProtocols();

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (isGroupUser && groupIds.current.length > 0) {
            getGroupNames();
        }
        // eslint-disable-next-line
    }, [isGroupUser, groupIds]);

    return token ? (
        <div className="dashboard" data-testid="Dashboard">
            <div className="d-md-flex">
                <Header groups={groups} />
                <div className="position-relative container-fluid px-0 bg-grey-100 content">
                    <Outlet />
                    <Footer />
                </div>
            </div>
            <Dialog />
            <MonitorConfigDialog />
            <RealtimeDeviceImageDialog />
            <OfflineNotificationDialog />
            <ComputedFunctionDialog />
            <PipelineExecuteLogDialog />
            <Toaster />
        </div>
    ) : (
        <>Redirect</>
    );
};

export default App;
