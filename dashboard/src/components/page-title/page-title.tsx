import { useAppDispatch, useAppSelector } from '@/hooks/redux.hook';
import { menuActions, selectMenu } from '@/redux/reducers/menu.reducer';
import refreshIcon from '/src/assets/images/icon-refresh.svg';
import plusIcon from '/src/assets/images/icon-plus.svg';

const PageTitle = (props: {
    title: string;
    primaryButtonVisible?: boolean;
    secondaryButtonVisible?: boolean;
    primaryButtonWording?: string;
    secondaryButtonWording?: string;
    primaryButtonCallback?: () => void;
    secondaryButtonCallback?: () => void;
    primaryButtonIcon?: string;
    primaryButtonClassName?: string;
    secondaryButtonIcon?: string;
}) => {
    const {
        title,
        primaryButtonVisible,
        secondaryButtonVisible,
        primaryButtonCallback,
        primaryButtonWording,
        secondaryButtonCallback,
        secondaryButtonWording,
        primaryButtonIcon,
        primaryButtonClassName,
        secondaryButtonIcon,
    } = props;
    const isOpen = useAppSelector(selectMenu).menu.isOpen;
    const dispatch = useAppDispatch();

    const openMenu = () => {
        dispatch(menuActions.open());
    };

    return (
        <div className="page-title" data-testid="page-title">
            <div className="w-100 d-flex align-items-center p-45">
                <div
                    role="button"
                    className={`d-none hamburger p-2 ${
                        isOpen ? 'd-none' : 'd-md-block'
                    }`}
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
                            <button
                                onClick={primaryButtonCallback}
                                className={`${
                                    primaryButtonVisible ? '' : 'd-none'
                                } ${
                                    primaryButtonClassName || 'bg-light'
                                } d-flex align-items-center btn rounded-pill px-3 py-2`}
                            >
                                <img
                                    className="icon pe-2"
                                    src={primaryButtonIcon || refreshIcon}
                                />
                                <div className="lh-1 py-1 fw-bold">
                                    {primaryButtonWording}
                                </div>
                            </button>
                            <button
                                onClick={secondaryButtonCallback}
                                className={`${
                                    secondaryButtonVisible ? '' : 'd-none'
                                } d-flex align-items-center btn bg-light-blue text-white border border-light-blue rounded-pill ms-3  px-3 py-2`}
                            >
                                <img
                                    className="icon pe-2"
                                    src={secondaryButtonIcon || plusIcon}
                                />
                                <div className="lh-1 py-1 fw-bold">
                                    {secondaryButtonWording}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageTitle;