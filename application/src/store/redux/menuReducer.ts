import { createSlice } from '@reduxjs/toolkit';

interface MenuState {
  isOpen: boolean;
}

const initialState: MenuState = {
  isOpen: false,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    openMenu: state => {
      state.isOpen = true;
    },
    closeMenu: state => {
      state.isOpen = false;
    },
  },
});

export default menuSlice.reducer;
export const { openMenu, closeMenu } = menuSlice.actions;
