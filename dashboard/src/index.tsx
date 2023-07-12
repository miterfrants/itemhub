import ReactDOM from 'react-dom';
import './index.scss';
import App from './app';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard';
import Devices from './pages/devices/devices';
import Device from './pages/device/device';
import DeviceForm from './pages/device-form/device-form';
import NotFound from './pages/not-found/not-found';
import OauthClients from './pages/oauth-clients/oauth-clients';
import { Provider } from 'react-redux';
import store from './redux/store';
import OauthClient from './pages/oauth-client/oauth-client';
import Pipelines from './pages/pipelines/pipelines';
import Pipeline from './pages/pipeline/pipeline';
import Groups from './pages/groups/groups';
import Group from './pages/group/group';
import DevicePinStatistics from './pages/device-pin-statistics/device-pin-statistics';
import GroupsJoin from './pages/groups/groups-join';

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route
                path=""
                element={
                    <Provider store={store}>
                        <App />
                    </Provider>
                }
            >
                <Route path="/" element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="dashboard/devices" element={<Devices />} />

                <Route
                    path="dashboard/groups/:groupId/monitors"
                    element={<Dashboard />}
                />
                <Route
                    path="dashboard/groups/:groupId/devices"
                    element={<Devices />}
                />

                <Route path="dashboard/devices/:id" element={<Device />} />
                <Route path="dashboard/groups" element={<Groups />} />
                <Route path="dashboard/groups/create" element={<Group />} />
                <Route path="dashboard/groups/:id" element={<Group />} />
                <Route
                    path="dashboard/groups/:id/invitations/:invitationId/join"
                    element={<GroupsJoin />}
                />
                <Route
                    path="dashboard/devices/:id/:pin"
                    element={<DeviceForm />}
                />
                <Route
                    path="dashboard/devices/:id/:pin/statistics"
                    element={<DevicePinStatistics />}
                />
                <Route
                    path="dashboard/devices/create"
                    element={<DeviceForm />}
                />
                <Route
                    path="dashboard/devices/edit/:id"
                    element={<DeviceForm />}
                />
                <Route
                    path="dashboard/oauth-clients"
                    element={<OauthClients />}
                />
                <Route
                    path="dashboard/oauth-clients/create"
                    element={<OauthClient />}
                />
                <Route
                    path="dashboard/oauth-clients/:id"
                    element={<OauthClient />}
                />

                <Route path="dashboard/404" element={<NotFound />} />
                <Route path="dashboard/pipelines" element={<Pipelines />} />
                <Route
                    path="dashboard/pipelines/create"
                    element={<Pipeline />}
                />
                <Route path="dashboard/pipelines/:id" element={<Pipeline />} />
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);
