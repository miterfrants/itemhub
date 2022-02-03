import './app.css';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectDevices } from './redux/reducers/device.reducer';
import { useContext, useEffect } from 'react';
import { AuthDataservice } from './dataservices/auth.dataservice';
import { CookieHelper } from './helpers/cookie.helper';
import { LogContext } from './contexts/logs.context';

function App() {
    // 暫時直接打測試帳號的 API 取得 token，之後可再拔掉
    useEffect(() => {
        const token = CookieHelper.GetCookie('token') || null;
        if (token === null) {
            (async () => {
                AuthDataservice.SignWithEmail({
                    email: 'miterfrants@gmail.com',
                    password: '@Testing123123',
                }).then((response) => {
                    const tokenValue = response.data.token;
                    CookieHelper.SetCookie('token', tokenValue, 14);
                });
            })();
        }
    }, []);
    const devices = useSelector(selectDevices);

    const { logs, addLog } = useContext(LogContext);
    return (
        <div>
            <button onClick={() => addLog('testing')}>Add Logs</button>
            <div>
                {logs.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </div>
            <div>
                {devices.map((item) => (
                    <div key={item.name}>{item.name}</div>
                ))}
            </div>
            <Outlet />
        </div>
    );
}

export default App;
