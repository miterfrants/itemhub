import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type PipelineLogDialogState = {
    isOpen: boolean;
    pipelineId?: number;
};

export const pipelineLogDialogSlice = createSlice({
    name: 'pipelineLogDialog',
    initialState: {
        isOpen: false,
        pipelineId: undefined,
    } as PipelineLogDialogState,
    reducers: {
        open: (
            state,
            action: PayloadAction<Partial<PipelineLogDialogState>>
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

export const pipelineLogDialogActions = pipelineLogDialogSlice.actions;

export const selectPipelineLogDialog = (state: RootState) =>
    state.pipelineLogDialog;

export default pipelineLogDialogSlice.reducer;
