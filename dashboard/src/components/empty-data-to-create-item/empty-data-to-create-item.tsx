import { useNavigate } from 'react-router-dom';
import emptyImage from '@/assets/images/empty-image.svg';
import plusIcon from '@/assets/images/icon-plus.svg';

const EmptyDataToCreateItem = ({ itemName }: { itemName: string }) => {
    const navigate = useNavigate();
    const jumpToCreatePage = () => {
        navigate('create');
    };
    const howToUseLink = `${import.meta.env.VITE_WEBSITE_URL}/how/`;

    return (
        <div className="d-block p-6 text-center">
            <img src={emptyImage} alt="empty image" />
            <div className="mt-2">{`尚未建立任何${itemName}, 點擊按鈕開始新增吧！`}</div>
            <button
                onClick={jumpToCreatePage}
                className="btn btn-primary mx-auto mt-3"
            >
                <img className="icon pe-2" src={plusIcon} />
                <div>{`新增${itemName}`}</div>
            </button>
            <div className="text-center">
                <a
                    className="fs-5"
                    target="_blank"
                    href={howToUseLink}
                    rel="noreferrer"
                >
                    如何使用?
                </a>
            </div>
        </div>
    );
};

export default EmptyDataToCreateItem;
