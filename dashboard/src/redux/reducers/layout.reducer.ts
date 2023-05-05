import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

export type LayoutState = {
    version: number;
};

export const layout = createSlice({
    name: 'layout',
    initialState: {
        version: 0,
    },
    reducers: {
        resize: (state) => {
            return {
                version: state.version + 1,
            };
        },
    },
});

export const layoutActions = layout.actions;

export const selectLayout = (state: RootState) => state.layout;

export default layout.reducer;
