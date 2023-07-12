import { Link, useLocation, useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/redux.hook';
import { menuActions, selectMenu } from '@/redux/reducers/menu.reducer';
import chartIcon from '@/assets/images/chart.svg';
import deviceIcon from '@/assets/images/device.svg';
import logoIcon from '@/assets/images/logo.svg';
import logoWordingIcon from '@/assets/images/logo-wording.svg';
import shieldIcon from '@/assets/images/shield.svg';
import docIcon from '@/assets/images/doc.svg';
import pipelineIcon from '@/assets/images/pipeline.svg';
import groupIcon from '@/assets/images/group.svg';
import lineUs from '@/assets/images/icon-line.png';
import refreshIcon from '@/assets/images/refresh.png';
import { useState, useEffect } from 'react';
import { layoutActions } from '@/redux/reducers/layout.reducer';
import { GroupNameType } from '@/types/group.type';

const Header = (props: { groups: GroupNameType[] | null }) => {
    const { groups } = props;
    const { groupId } = useParams();
    const isOpen = useAppSelector(selectMenu).isOpen;
    const dispatch = useAppDispatch();
    const [menuBlockClassName, setMenuBlockClassName] = useState('d-none');
    const location = useLocation();
    const [showGroupMenu, setShowGroupMenu] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen) {
            setMenuBlockClassName('');
        } else {
            setTimeout(() => {
                setMenuBlockClassName('d-none d-md-block');
            }, 500);
        }
    }, [isOpen]);

    useEffect(() => {
        if (document.body.clientWidth <= 767) {
            dispatch(menuActions.close());
        }
    }, [location]);

    const closeMenu = () => {
        dispatch(menuActions.close());
        dispatch(layoutActions.resize());
    };

    const openMenu = () => {
        dispatch(menuActions.open());
        dispatch(layoutActions.resize());
    };

    return (
        <div
            className={`${
                !isOpen ? 'close' : ''
            } flex-shrink-0 header sticky-md-top align-items-start`}
            data-testid="Header"
        >
            <div className="position-fixed">
                <div className="logo-block d-flex align-items-center justify-content-between justify-content-md-center px-3">
                    <Link to="/dashboard/">
                        <div className="logo align-items-center overflow-hidden d-flex flex-nowrap justify-content-start">
                            <img className="logo-icon ps-3" src={logoIcon} />
                            <img
                                className="ms-25 logo-text"
                                src={logoWordingIcon}
                            />
                        </div>
                    </Link>

                    <div
                        role="button"
                        className="hamburger p-2"
                        onClick={() => {
                            isOpen ? closeMenu() : openMenu();
                        }}
                    >
                        <div className="bg-white w-100 rounded-pill" />
                        <div className="bg-white w-100 rounded-pill" />
                        <div className="bg-white w-100 rounded-pill" />
                    </div>
                </div>

                <div className={`${menuBlockClassName} menu-block py-2`}>
                    {groups && (
                        <div
                            onMouseEnter={() => {
                                setShowGroupMenu(true);
                            }}
                            onMouseLeave={() => {
                                setShowGroupMenu(false);
                            }}
                            role="button"
                            className="position-relative nav-item d-flex align-items-center justify-content-start text-white text-opacity-85 rounded-1 py-2 px-3 my-2 mx-3"
                        >
                            <img src={refreshIcon} />
                            <div className="mx-3">切換群組</div>
                            {showGroupMenu && (
                                <div className="position-absolute d-flex custom-width-200 mx-n3 text-white top-0">
                                    <div className="w-50" />
                                    <div className="bg-primary-800 px-4 rounded-1 position-relative">
                                        <div className="left-arrow" />
                                        {groupId && (
                                            <Link
                                                to={`/dashboard`}
                                                className="py-2 d-block text-white nav-item"
                                            >
                                                回到個人管理介面
                                            </Link>
                                        )}
                                        {groups
                                            .filter(
                                                (group) =>
                                                    group.id.toString() !==
                                                    groupId
                                            )
                                            .map((group) => (
                                                <Link
                                                    to={`/dashboard/groups/${group.id}/monitors`}
                                                    className="py-2 d-block text-white nav-item"
                                                    key={`group-${group.id}`}
                                                >
                                                    {group.name}
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Link
                        to={
                            groupId
                                ? `/dashboard/groups/${groupId}/monitors`
                                : `/dashboard`
                        }
                        className="nav-item d-flex align-items-center justify-content-start justify-content-md-center text-white text-opacity-85 rounded-1 py-2 px-3 my-2 mx-3"
                    >
                        <img src={chartIcon} />
                        <span className="text-block text-nowrap overflow-hidden">
                            <div className="mx-3">監控中心</div>
                        </span>
                    </Link>
                    <Link
                        to={
                            groupId
                                ? `/dashboard/groups/${groupId}/devices`
                                : `/dashboard/devices`
                        }
                        className="nav-item d-flex align-items-center justify-content-start justify-content-md-center text-white text-opacity-85 rounded-1 py-2 px-3 my-2 mx-3"
                    >
                        <img src={deviceIcon} />
                        <span className="text-block text-nowrap overflow-hidden">
                            <div className="mx-3">裝置</div>
                        </span>
                    </Link>

                    {!groupId && (
                        <>
                            <Link
                                to="/dashboard/oauth-clients"
                                className="nav-item d-flex align-items-center justify-content-start justify-content-md-center text-white text-opacity-85 rounded-1 py-2 px-3 my-2 mx-3"
                            >
                                <img src={shieldIcon} />
                                <span className="text-block text-nowrap overflow-hidden">
                                    <div className="mx-3">oAuthClient</div>
                                </span>
                            </Link>

                            <Link
                                to="/dashboard/pipelines"
                                className="nav-item d-flex align-items-center justify-content-start justify-content-md-center text-white text-opacity-85 rounded-1 py-2 px-3 my-2 mx-3"
                            >
                                <img src={pipelineIcon} />
                                <span className="text-block text-nowrap overflow-hidden">
                                    <div className="mx-3">自動化觸發流程</div>
                                </span>
                            </Link>

                            <Link
                                to="/dashboard/groups"
                                className="nav-item d-flex align-items-center justify-content-start justify-content-md-center text-white text-opacity-85 rounded-1 py-2 px-3 my-2 mx-3"
                            >
                                <img src={groupIcon} />
                                <span className="text-block text-nowrap overflow-hidden">
                                    <div className="mx-3">群組權限</div>
                                </span>
                            </Link>
                        </>
                    )}

                    <a
                        href={`${import.meta.env.VITE_WEBSITE_URL}/swagger/`}
                        target="_blank"
                        className="nav-item d-flex align-items-center justify-content-start justify-content-md-center text-white text-opacity-85 rounded-1 py-2 px-3 my-2 mx-3"
                        rel="noreferrer"
                    >
                        <img src={docIcon} />
                        <span className="text-block text-nowrap overflow-hidden">
                            <div className="mx-3">API 文件</div>
                        </span>
                    </a>
                </div>
                <div
                    className={`space position-absolute bg-black bg-opacity-65 ${
                        isOpen ? 'd-md-none' : 'd-none'
                    }`}
                    onClick={closeMenu}
                />
                <div className="position-fixed line-us text-center">
                    <a
                        href="https://line.me/ti/p/@151cpegm"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img src={lineUs} alt="line-us" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Header;
