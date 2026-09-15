import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../entity/User.entity';

interface UserState {
  activeUser: User | null;
}

const initialState: UserState = {
  activeUser: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveUser: (state, action: PayloadAction<User>) => {
      state.activeUser = action.payload;
    },
    clearActiveUser: state => {
      state.activeUser = null;
    },
  },
});

export default userSlice.reducer;

export const { setActiveUser, clearActiveUser } = userSlice.actions;
