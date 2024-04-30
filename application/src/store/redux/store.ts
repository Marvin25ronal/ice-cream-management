import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeReducer";
import shoppingCartReducer from "./carReducer";

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        shoppingCart: shoppingCartReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch