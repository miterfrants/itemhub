import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type PipelineExecuteLogDialogState = {
    isOpen: boolean;
    pipelineId?: number;
};

export const pipelineExecuteLogDialogSlice = createSlice({
    name: 'pipelineExecuteLogDialog',
    initialState: {
        isOpen: false,
        pipelineId: undefined,
    } as PipelineExecuteLogDialogState,
    reducers: {
        open: (
            state,
            action: PayloadAction<Partial<PipelineExecuteLogDialogState>>
        ) => {
            const { pipelineId } = action.payload;

            return {
                isOpen: true,
                pipelineId,
            };
        },
        close: (state) => {
            state.isOpen = false;
            state.pipelineId = undefined;
            return state;
        },
    },
});

export const pipelineExecuteLogDialogActions =
    pipelineExecuteLogDialogSlice.actions;

export const selectPipelineExecuteLogDialog = (state: RootState) =>
    state.pipelineExecuteLogDialog;

export default pipelineExecuteLogDialogSlice.reducer;
