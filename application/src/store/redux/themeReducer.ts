import { createSlice } from "@reduxjs/toolkit";

export const themeSlice = createSlice({
    name: 'theme',
    initialState: {
        value: 0
    },
    reducers: {
        setTheme: (state, action) => {
            state.value = action.payload
        }
    }
})


export default themeSlice.reducer


export const { setTheme } = themeSlice.actions