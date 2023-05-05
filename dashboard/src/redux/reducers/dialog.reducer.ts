import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type DialogState = {
    type: DialogTypeEnum;
    title: string;
    message: string;
    isOpen: boolean;
    checkedMessage: string;
    buttonClassName: string;
    promptInvalidMessage: string;
    callback: () => void;
    cancelCallback: () => void;
};

export enum DialogTypeEnum {
    PROMPT = 'prompt',
    ALERT = 'alert',
    CONFIRM = 'confirm',
}

export const dialogSlice = createSlice({
    name: 'dialog',
    initialState: {
        type: DialogTypeEnum.ALERT,
        title: '',
        message: '',
        isOpen: false,
        checkedMessage: '',
        buttonClassName: '',
        promptInvalidMessage: '',
        callback: () => {},
        cancelCallback: () => {},
    },
    reducers: {
        open: (state, action: PayloadAction<Partial<DialogState>>) => {
            const {
                type,
                title,
                message,
                checkedMessage,
                buttonClassName,
                promptInvalidMessage,
                callback,
                cancelCallback,
            } = action.payload;

            return {
                type: type || DialogTypeEnum.ALERT,
                title: title || '',
                message: message || '',
                isOpen: true,
                checkedMessage: checkedMessage || '',
                buttonClassName: buttonClassName || '',
                promptInvalidMessage: promptInvalidMessage || '',
                callback: callback ? callback : () => {},
                cancelCallback: cancelCallback ? cancelCallback : () => {},
            };
        },
        close: (state) => {
            state.isOpen = false;
            state.cancelCallback();
            return state;
        },
    },
});

export const dialogActions = dialogSlice.actions;

export const selectDialog = (state: RootState) => state.dialog;

export default dialogSlice.reducer;
