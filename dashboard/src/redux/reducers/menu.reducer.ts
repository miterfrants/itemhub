import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

const defaultMenuState = document.body.clientWidth > 767 ? true : false;

export const menuSlice = createSlice({
    name: 'menu',
    initialState: { isOpen: defaultMenuState },
    reducers: {
        open: () => {
            return { isOpen: true };
        },
        close: () => {
            return { isOpen: false };
        },
    },
});

export const menuActions = menuSlice.actions;

export const selectMenu = (state: RootState) => state.menu;

export default menuSlice.reducer;
