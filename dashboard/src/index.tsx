import ReactDOM from 'react-dom';
import './index.scss';
import App from './app';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard/dashboard';
import DeviceView from './pages/device-view/device-view';
import Device from './pages/device/device';
import DeviceForm from './pages/device-form/device-form';
import NotFound from './pages/not-found/not-found';
import Triggers from './pages/triggers/triggers';
import Trigger from './pages/trigger/trigger';
import OauthClients from './pages/oauth-clients/oauth-clients';
import { Provider } from 'react-redux';
import store from './redux/store';
import OauthClient from './pages/oauth-client/oauth-client';

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
                <Route path="dashboard/devices" element={<DeviceView />} />
                <Route path="dashboard/devices/:id" element={<Device />} />
                <Route
                    path="dashboard/devices/:id/:pin"
                    element={<DeviceForm />}
                />
                <Route
                    path="dashboard/devices/create"
                    element={<DeviceForm />}
                />
                <Route
                    path="dashboard/devices/edit/:id"
                    element={<DeviceForm />}
                />
                <Route path="dashboard/triggers" element={<Triggers />} />
                <Route path="dashboard/triggers/create" element={<Trigger />} />
                <Route
                    path="dashboard/triggers/edit/:id"
                    element={<Trigger />}
                />
                <Route path="dashboard/triggers/:id" element={<Trigger />} />
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
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);
