// import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { menuActions, selectMenu } from '@/redux/reducers/menu.reducer';

const PageTitle = (props: { title: string }) => {
    const { title } = props;
    const isOpen = useAppSelector(selectMenu).menu.isOpen;
    const dispatch = useAppDispatch();

    const openMenu = () => {
        dispatch(menuActions.open());
    };

    return (
        <div className="page-title" data-testid="page-title">
            <div className="w-100 d-flex align-items-center p-4">
                <div
                    role="button"
                    className={`hamburger p-2 ${isOpen ? 'd-none' : ''}`}
                    onClick={openMenu}
                >
                    <div className="bg-black bg-opacity-85 w-100 rounded-pill" />
                    <div className="bg-black bg-opacity-85 w-100 rounded-pill" />
                    <div className="bg-black bg-opacity-85 w-100 rounded-pill" />
                </div>
                <div className="flex-fill">
                    <div className="d-flex align-items-center justify-content-between">
                        <h3 className="mb-0">{title}</h3>
                        <div className="d-flex">
                            {/* <a
                                href=""
                                className="d-flex align-items-center btn bg-black bg-opacity-10 text-black text-opacity-65 border border-secondary rounded-pill px-3 py-2"
                            >
                                <img
                                    className="icon pe-2"
                                    src="/src/assets/images/icon-refresh.svg"
                                />
                                <div className="lh-1 py-1">重新整理</div>
                            </a>
                            <a
                                href=""
                                className="d-flex align-items-center btn bg-primary-500 shadow-sm text-white border border-primary rounded-pill ms-3  px-3 py-2"
                            >
                                <img
                                    className="icon pe-2"
                                    src="/src/assets/images/icon-plus.svg"
                                />
                                <div className="lh-1 py-1">新增裝置</div>
                            </a> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageTitle;
