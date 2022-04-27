import { useAppSelector } from '@/hooks/redux.hook';
import {
    DialogTypeEnum,
    selectDialog,
    dialogActions,
} from '@/redux/reducers/dialog.reducer';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

const Dialog = () => {
    const dialog = useAppSelector(selectDialog);
    const dispatch = useDispatch();
    let promptInputValue = '';

    const {
        type,
        title,
        message,
        checkedMessage,
        buttonClassName,
        callback,
        promptInvalidMessage,
        isOpen,
    } = dialog;

    const [isValid, setIsValid] = useState(true);
    const promptInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && type === DialogTypeEnum.PROMPT) {
            promptInputRef.current?.focus();
        }
    }, [isOpen]);

    const buttonBehavior = () => {
        if (type === DialogTypeEnum.ALERT) {
            close();
        } else if (type === DialogTypeEnum.CONFIRM) {
            confirm();
        } else if (type === DialogTypeEnum.PROMPT) {
            checkMessage();
        }
    };

    const confirm = () => {
        if (callback) {
            callback();
        }
        close();
    };

    const checkMessage = () => {
        if (checkedMessage === promptInputValue && callback) {
            callback();
            setIsValid(true);
            promptInputValue = '';
            if (promptInputRef.current) {
                promptInputRef.current.value = '';
            }
            close();
        } else {
            setIsValid(false);
        }
    };

    const close = () => {
        promptInputValue = '';
        dispatch(dialogActions.close());
    };
    return (
        <div
            className={`dialog position-fixed top-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 ${
                isOpen ? '' : 'd-none'
            }`}
        >
            <div className="card">
                <h4 className={title ? '' : 'd-none'}>{title}</h4>
                <div className={message ? '' : 'd-none'}>{message}</div>
                <div
                    className={`${
                        type === DialogTypeEnum.PROMPT ? '' : 'd-none'
                    }`}
                >
                    <input
                        className="form-control"
                        type="text"
                        ref={promptInputRef}
                        onKeyUp={(
                            event: React.KeyboardEvent<HTMLInputElement>
                        ) => {
                            if (event.key === 'Enter') {
                                buttonBehavior();
                            }
                            promptInputValue = event.currentTarget.value;
                        }}
                        defaultValue={promptInputValue}
                    />
                    <div
                        className={`invalid-message ${isValid ? 'd-none' : ''}`}
                    >
                        {promptInvalidMessage}
                    </div>
                </div>

                <div className="d-flex align-items-center">
                    <button
                        className={`btn ${
                            type ===
                            (DialogTypeEnum.PROMPT || DialogTypeEnum.CONFIRM)
                                ? ''
                                : 'd-none'
                        }`}
                        onClick={close}
                    >
                        取消
                    </button>
                    <button
                        className={`btn ${buttonClassName}`}
                        onClick={buttonBehavior}
                    >
                        確認
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dialog;