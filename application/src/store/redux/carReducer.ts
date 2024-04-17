import { createSlice } from "@reduxjs/toolkit";
import { Product } from "../../entity/Product.entity";

interface ShoppingCartState {
    value: number[]
}
const initialState: ShoppingCartState = {
    value: []
}
export const carSlice = createSlice({
    name: 'shoppingCart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            state.value.push(action.payload)
        },
        removeFromCart: (state, action) => {
            state.value = state.value.filter((item) => item !== action.payload)
        },
        clearCart: (state) => {
            state.value = []
        }
    }
})
export default carSlice.reducer
export const { addToCart, removeFromCart, clearCart } = carSlice.actions