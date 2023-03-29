import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { PipelineType } from '@/types/pipeline.type';

export type PipelineState = {
    pipelines: PipelineType[] | null;
    rowNum: number;
};

const initialState: PipelineState = {
    pipelines: null,
    rowNum: 0,
};

export const pipelinesSlice = createSlice({
    name: 'pipelines',
    initialState: initialState,
    reducers: {
        refresh: (state, action: PayloadAction<PipelineState>) => {
            return action.payload;
        },
        refreshOne: (state, action: PayloadAction<PipelineType>) => {
            const list = state.pipelines;
            const newOne = action.payload;

            if (list === null) {
                return {
                    ...state,
                    pipelines: [newOne],
                };
            }

            const targetIndex = list.findIndex(
                (oldOne) => oldOne.id === newOne.id
            );
            list[targetIndex] = {
                ...newOne,
            };

            return {
                ...state,
                pipelines: list,
            };
        },
        append: (state, action: PayloadAction<PipelineType>) => {
            let pipelines = state.pipelines;
            if (pipelines === null) {
                pipelines = [];
            }

            const deviceInState = pipelines.find(
                (item) => item.id === action.payload.id
            );
            if (!deviceInState) {
                pipelines.push(action.payload);
            }

            const newPipelines = [...pipelines];
            return {
                ...state,
                pipelines: newPipelines,
            };
        },
        addOne: (state, action: PayloadAction<PipelineType>) => {
            let list = state.pipelines;
            const newOne = action.payload;

            if (list === null) {
                list = [];
            }

            return {
                ...state,
                pipelines: [newOne, ...list],
            };
        },
        update: (state, action: PayloadAction<Partial<PipelineType>>) => {
            const pipelines = state.pipelines;

            const newPipelineData = action.payload;

            if (pipelines === null) {
                throw new Error(
                    'Can not update pipeline when pipelines is null.'
                );
            }

            const newPipelines = [...pipelines];
            const targetIndex = newPipelines.findIndex(
                ({ id }) => id === newPipelineData.id
            );
            newPipelines[targetIndex] = {
                ...newPipelines[targetIndex],
                ...newPipelineData,
            };

            return {
                ...state,
                pipelines: newPipelines,
            };
        },
        deleteMultiple: (state, action: PayloadAction<{ ids: number[] }>) => {
            const pipelines = state.pipelines;
            const deletePayload = action.payload;

            if (pipelines === null) {
                throw new Error('Can not updateDevice when pipelines is null.');
            }

            const newList = pipelines.filter(
                (item) => deletePayload.ids.indexOf(item.id) === -1
            );

            return {
                ...state,
                oauthClients: newList,
            };
        },
    },
});

export const pipelinesActions = pipelinesSlice.actions;

export const selectPipelines = (state: RootState) => state.pipelines;

export default pipelinesSlice.reducer;
