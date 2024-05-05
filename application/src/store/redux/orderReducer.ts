import { createSlice } from "@reduxjs/toolkit";
import { Order } from "../../entity/Order.entity";

interface OrderState {
    value: number 
}
const initialState: OrderState = {
    value: -1
}

export const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setOrder: (state, action) => {
            state.value = action.payload
        },
        clearOrder: (state) => {
            state.value = -1
        },
    }
})

export default orderSlice.reducer
export const { setOrder, clearOrder } = orderSlice.actions