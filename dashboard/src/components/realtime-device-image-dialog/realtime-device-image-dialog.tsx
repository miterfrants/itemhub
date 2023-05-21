import { useAppSelector } from '@/hooks/redux.hook';
import {
    realtimeDeviceImageDialogActions,
    selectRealtimeDeviceImageDialog,
} from '@/redux/reducers/realtime-device-image-dialog.reducer';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import Spinner from '../spinner/spinner';
import { useGetLastDeviceImageApi } from '@/hooks/apis/devices.hook';
import { ApiHelpers } from '@/helpers/api.helper';

const RealtimeDeviceImageDialog = () => {
    const dialog = useAppSelector(selectRealtimeDeviceImageDialog);
    const { isOpen, deviceId } = dialog;
    const [deviceImage, setDeviceImage] = useState<null | string>('');
    const {
        fetchApi: getLastDeviceImage,
        data: lastDeviceImageBlob,
        error: lastDeviceImageError,
    } = useGetLastDeviceImageApi(deviceId || 0);
    const dispatch = useDispatch();

    const [recursiveStartFlag, setRecursiveStartFlag] = useState(false);
    const recursiveTimer = useRef<null | NodeJS.Timeout>(null);

    useEffect(() => {
        return () => {
            if (recursiveTimer.current) {
                clearTimeout(recursiveTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!deviceId) {
            setDeviceImage(null);
            return;
        }
        getLastDeviceImage();
        setRecursiveStartFlag(true);
        // eslint-disable-next-line
    }, [deviceId, isOpen]);

    useEffect(() => {
        if (!lastDeviceImageBlob) {
            return;
        }
        setDeviceImage(
            ApiHelpers.ArrayBufferToBase64(lastDeviceImageBlob.blob)
        );
    }, [lastDeviceImageBlob]);

    useEffect(() => {
        if (lastDeviceImageError) {
            setDeviceImage('');
        }
    }, [lastDeviceImageError]);

    useEffect(() => {
        if (recursiveStartFlag) {
            recursiveStart();
        } else if (recursiveTimer.current) {
            clearTimeout(recursiveTimer.current);
        }
        // eslint-disable-next-line
    }, [recursiveStartFlag]);

    const close = () => {
        if (recursiveTimer.current) {
            clearTimeout(recursiveTimer.current);
        }
        dispatch(realtimeDeviceImageDialogActions.close());
    };

    const recursiveStart = () => {
        if (!recursiveStartFlag) {
            return;
        }
        recursiveTimer.current = setTimeout(() => {
            getLastDeviceImage();
            recursiveStart();
        }, 5 * 1000);
    };
    return (
        <div
            className={`realtime-device-image-dialog dialog position-fixed top-0 w-100 h-100 d-flex align-items-center justify-content-center p-0 p-sm-2 ${
                isOpen ? '' : 'd-none'
            }`}
        >
            <div className="card ">
                {deviceImage == null ? (
                    <div className="d-flex align-items-center justify-content-center w-100 h-100">
                        <Spinner />
                    </div>
                ) : deviceImage ? (
                    <div
                        className="w-100 h-100"
                        style={{
                            backgroundImage: `url(data:image/jpg;base64,${deviceImage})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    />
                ) : (
                    deviceImage != null && <div>目前沒有資料</div>
                )}
                <div
                    onClick={() => {
                        close();
                    }}
                    className="position-absolute top-0 btn-close end-0 me-3 mt-2"
                    role="button"
                />
            </div>
        </div>
    );
};

export default RealtimeDeviceImageDialog;
