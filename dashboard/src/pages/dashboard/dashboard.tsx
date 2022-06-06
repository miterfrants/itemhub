import PageTitle from '@/components/page-title/page-title';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(`/dashboard/devices/`);
    }, []);
    return (
        <div className="dashboard" data-testid="Dashboard">
            <PageTitle title="監控中心" />
        </div>
    );
};

export default Dashboard;
