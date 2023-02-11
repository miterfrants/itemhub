import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { PipelineConnectorType } from '@/types/pipeline.type';

export const pipelineConnectorsSlice = createSlice({
    name: 'pipelineConnectors',
    initialState: null as PipelineConnectorType[] | null,
    reducers: {
        updatePipelineConnectors: (
            state,
            action: PayloadAction<PipelineConnectorType[]>
        ) => {
            const pipelineConnectors = action.payload;
            const oldItems: PipelineConnectorType[] = (
                state ? [...state] : []
            ) as PipelineConnectorType[];

            // update exists pipelineConnectors
            const updatedOldItems = oldItems.map(
                (oldItem: PipelineConnectorType) => {
                    const existsInPayload = pipelineConnectors.find(
                        (item) =>
                            item.id === oldItem.id && oldItem.id && item.id
                    );

                    if (existsInPayload) {
                        return { ...oldItem, ...existsInPayload };
                    } else {
                        return oldItem;
                    }
                }
            );

            // filter exists pipelineConnectors
            const newPipelineConnectorsExcludedExists =
                pipelineConnectors.filter((item) => {
                    return !updatedOldItems
                        .map((oldItem) => oldItem.id)
                        .includes(item.id);
                });

            return [...updatedOldItems, ...newPipelineConnectorsExcludedExists];
        },
        updatePipelineConnector: (
            state,
            action: PayloadAction<Partial<PipelineConnectorType>>
        ) => {
            const pipelineConnectors = state;
            const newItem = action.payload;

            if (pipelineConnectors === null) {
                throw new Error(
                    'Can not updatePin when pipelineConnectors is null.'
                );
            }

            const newPipelineConnectors = [...pipelineConnectors];

            const targetIndex = newPipelineConnectors.findIndex(
                (item) => item.id === newItem.id
            );
            newPipelineConnectors[targetIndex] = {
                ...newPipelineConnectors[targetIndex],
                ...newItem,
            };

            return newPipelineConnectors;
        },
        deleteMultiple: (
            state,
            action: PayloadAction<{ pipelineItemIds: number[] }>
        ) => {
            const deletePayload = action.payload;

            if (state === null) {
                throw new Error(
                    'Can not delete when pipelineConnectors is null.'
                );
            }

            const newList = state.filter(
                (item) =>
                    deletePayload.pipelineItemIds.indexOf(
                        Number(item.id || 0)
                    ) === -1
            );
            return newList;
        },
    },
});

export const pipelineConnectorsActions = pipelineConnectorsSlice.actions;

export const selectPipelineConnectors = (state: RootState) =>
    state.pipelineConnectors;

export default pipelineConnectorsSlice.reducer;