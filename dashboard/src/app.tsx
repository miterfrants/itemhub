import './app.css';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthDataservice } from './dataservices/auth.dataservice';
import { CookieHelper } from './helpers/cookie.helper';

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
    return <Outlet />;
}

export default App;
