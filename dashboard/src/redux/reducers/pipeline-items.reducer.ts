import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { PipelineItemType } from '@/types/pipeline.type';

export const pipelineItemsSlice = createSlice({
    name: 'pipelineItems',
    initialState: null as PipelineItemType[] | null,
    reducers: {
        updatePipelineItems: (
            state,
            action: PayloadAction<PipelineItemType[]>
        ) => {
            const pipelineItems = action.payload;
            const oldItems: PipelineItemType[] = (
                state ? [...state] : []
            ) as PipelineItemType[];

            // update exists pipelineItems
            const updatedOldPins = oldItems.map((oldItem: PipelineItemType) => {
                const existsInPayload = pipelineItems.find(
                    (item) => item.id === oldItem.id && oldItem.id && item.id
                );

                if (existsInPayload) {
                    return { ...oldItem, ...existsInPayload };
                } else {
                    return oldItem;
                }
            });

            // filter exists pipelineItems
            const newPipelineItemsExcludedExists = pipelineItems.filter(
                (item) => {
                    return !updatedOldPins
                        .map((oldPin) => oldPin.id)
                        .includes(item.id);
                }
            );

            return [...updatedOldPins, ...newPipelineItemsExcludedExists];
        },
        updatePipelineItem: (
            state,
            action: PayloadAction<PipelineItemType>
        ) => {
            const pipelineItems = state;
            const newItem = action.payload;

            const newPipelineItems = [...(pipelineItems || [])];

            const targetIndex = newPipelineItems.findIndex(
                (item) => item.id === newItem.id
            );
            if (targetIndex >= 0) {
                newPipelineItems[targetIndex] = {
                    ...newPipelineItems[targetIndex],
                    ...newItem,
                };
            } else {
                newPipelineItems.push(newItem);
            }
            return newPipelineItems;
        },
        deleteMultiple: (
            state,
            action: PayloadAction<{ pipelineItemIds: number[] }>
        ) => {
            const deletePayload = action.payload;

            if (state === null) {
                throw new Error('Can not delete when pipelineItems is null.');
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

export const pipelineItemsActions = pipelineItemsSlice.actions;

export const selectPipelineItems = (state: RootState) => state.pipelineItems;

export default pipelineItemsSlice.reducer;
