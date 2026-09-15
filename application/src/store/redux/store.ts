import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeReducer';
import shoppingCartReducer from './carReducer';
import orderReducer from './orderReducer';
import userReducer from './userReducer';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    shoppingCart: shoppingCartReducer,
    order: orderReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
