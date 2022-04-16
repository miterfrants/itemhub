import './app.scss';
import { Outlet } from 'react-router-dom';
import { CookieHelpers } from './helpers/cookie.helper';

const isDev = import.meta.env.VITE_ENV === 'dev';
import { useQuery } from './hooks/query.hook';
import { COOKIE_KEY } from './constants/cookie-key';
import Header from './components/header/header';
import Footer from './components/footer/footer';

const App = () => {
    const query = useQuery();
    const dashboardTokenFromQueryString =
        query.get(COOKIE_KEY.DASHBOARD_TOKEN) || '';
    if (isDev && dashboardTokenFromQueryString) {
        CookieHelpers.SetCookie({
            name: COOKIE_KEY.DASHBOARD_TOKEN,
            value: dashboardTokenFromQueryString,
        });
    }
    const token = CookieHelpers.GetCookie({ name: COOKIE_KEY.DASHBOARD_TOKEN });
    if (!token) {
        location.href = import.meta.env.VITE_WEBSITE_URL;
    }
    return token ? (
        <div className="dashboard" data-testid="Dashboard">
            <div className="d-flex">
                <Header />
                <div className="position-relative container-fluid overflow-scroll px-0 bg-grey-100 content">
                    <Outlet />
                    <Footer />
                </div>
            </div>
        </div>
    ) : (
        <>Redirect</>
    );
};

export default App;
