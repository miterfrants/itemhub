import { useAppSelector } from '@/hooks/redux.hook';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
    computedFunctionDialogActions,
    selectComputedFunctionDialog,
} from '@/redux/reducers/computed-function-dialog.reducer';
import {
    useCreateComputedFunction,
    useUpdateComputedFunction,
} from '@/hooks/apis/computed-functions.hook';
import {
    ToasterTypeEnum,
    toasterActions,
} from '@/redux/reducers/toaster.reducer';
import DeviceAndPinInputs from '../inputs/device-and-pin-input/device-and-pin-input';

const ComputedFunctionDialog = () => {
    const dialog = useAppSelector(selectComputedFunctionDialog);
    const {
        id,
        isOpen,
        deviceId,
        pin,
        groupId,
        monitorId,
        func,
        sourceDeviceId,
        sourcePin,
    } = dialog;

    const dispatch = useDispatch();
    const refFuncInput = useRef<HTMLInputElement | null>(null);
    const [state, setState] = useState<{
        sourceDeviceId?: number | null;
        sourcePin?: string | null;
    }>({ sourceDeviceId, sourcePin });
    const [validation, setValidation] = useState({
        sourceDeviceId: {
            errorMessage: '',
            invalid: false,
        },
        sourcePin: {
            errorMessage: '',
            invalid: false,
        },
    });
    const [computedFunc, setComputedFunc] = useState<string>('');
    const {
        fetchApi: updateComputedFunction,
        data: respOfUpdateComputedFunction,
    } = useUpdateComputedFunction({
        id,
        func: computedFunc,
        sourceDeviceId: state?.sourceDeviceId || undefined,
        sourcePin: state?.sourcePin || undefined,
    });

    const {
        fetchApi: createComputedFunction,
        data: respOfCreateComputedFunction,
    } = useCreateComputedFunction({
        deviceId,
        pin,
        monitorId,
        groupId,
        func: computedFunc,
        sourceDeviceId: state?.sourceDeviceId,
        sourcePin: state?.sourcePin,
    });

    useEffect(() => {
        setComputedFunc(func || '');
    }, [func]);

    useEffect(() => {
        setState({
            sourceDeviceId,
            sourcePin,
        });
    }, [sourceDeviceId, sourcePin]);

    useEffect(() => {
        setTimeout(() => {
            refFuncInput.current?.focus();
        });
    }, [isOpen]);

    useEffect(() => {
        if (!respOfUpdateComputedFunction && !respOfCreateComputedFunction) {
            return;
        }
        dispatch(
            toasterActions.pushOne({
                message: '成功更新轉換公式',
                duration: 5,
                type: ToasterTypeEnum.INFO,
            })
        );
        setComputedFunc('');
        dispatch(computedFunctionDialogActions.close());
        // eslint-disable-next-line
    }, [respOfUpdateComputedFunction, respOfCreateComputedFunction]);

    const close = () => {
        setComputedFunc('');
        dispatch(computedFunctionDialogActions.close());
    };

    const submit = () => {
        if (id) {
            updateComputedFunction();
        } else {
            createComputedFunction();
        }
    };

    return (
        <div
            className={`computed-function-dialog dialog position-fixed top-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 ${
                isOpen ? '' : 'd-none'
            }`}
        >
            <div className="text-black bg-white card">
                <h3 className="mb-0">轉換公式</h3>
                <hr />
                <div className="mt-3">
                    <div>
                        <input
                            className="form-control"
                            type="text"
                            value={computedFunc}
                            onChange={(event) => {
                                setComputedFunc(event.currentTarget.value);
                            }}
                            onKeyUp={(event) => {
                                if (event.key.toLowerCase() === 'enter') {
                                    submit();
                                }
                            }}
                            ref={refFuncInput}
                            placeholder="data*2 - 5"
                        />
                    </div>
                    <div className="mt-3">
                        <DeviceAndPinInputs
                            isDeviceNameError={
                                validation.sourceDeviceId.invalid
                            }
                            deviceNameLabel="裝置"
                            isPinError={validation.sourcePin.invalid}
                            pinLabel="Pin"
                            defaultPinValue={state?.sourcePin || ''}
                            defaultDeviceId={state?.sourceDeviceId || 0}
                            isDisabled={false}
                            sensorOnly
                            updatePin={(newPin) => {
                                setState({
                                    ...state,
                                    sourcePin: newPin,
                                });
                            }}
                            updateDeviceId={(newDeviceId) => {
                                setState({
                                    ...state,
                                    sourceDeviceId: newDeviceId,
                                    sourcePin: undefined,
                                });
                            }}
                        />
                    </div>
                    <div className="text-warn mt-3 mb-4 d-flex align-items-top">
                        <div className="mt-1 me-2 bg-warn text-white rounded-circle align-items-center text-center fw-bold flex-shrink-0">
                            !
                        </div>
                        <div>
                            感測器回傳資料參數為 data，可根據回傳數字設定算式，
                            如: data*2+5，系統會依照算式計算回傳資料，
                            <br />
                            <br />
                            可另外設定其他設備的感測資料，參數為
                            sourceSensorData，抓取離目前裝置最近的一筆資料 如:
                            data*2+5+sourceSensorData
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 px-0 d-flex justify-content-center">
                        <button
                            className="btn btn-primary rounded-pill mt-3 mx-0"
                            onClick={() => {
                                submit();
                            }}
                        >
                            {id ? '修改' : '新增'}
                        </button>
                    </div>
                </div>
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

export default ComputedFunctionDialog;
