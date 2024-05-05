import { createSlice } from "@reduxjs/toolkit";
import { themeInterface } from "../../interface/themeInterface";
import { darkTheme } from "../../styles/Theme";

interface ThemeState {
    value: themeInterface
}
export const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        value: darkTheme
    },
    reducers: {
        setTheme: (state, action) => {
            state.value = action.payload
        }
    }
})


export default themeSlice.reducer


export const { setTheme } = themeSlice.actions