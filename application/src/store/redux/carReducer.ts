import { createSlice } from '@reduxjs/toolkit';
import { Product } from '../../entity/Product.entity';

interface ShoppingCartState {
  value: number[];
}
const initialState: ShoppingCartState = {
  value: [],
};
export const carSlice = createSlice({
  name: 'shoppingCart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.value.push(action.payload);
    },
    removeFromCart: (state, action) => {
      const indexToRemove = state.value
        .slice()
        .reverse()
        .findIndex(item => item === action.payload);
      if (indexToRemove !== -1) {
        const originalIndex = state.value.length - 1 - indexToRemove;
        state.value.splice(originalIndex, 1);
      }
    },
    removeAllProductsId: (state, action) => {
      state.value = state.value.filter(item => item !== action.payload);
    },
    clearCart: state => {
      state.value = [];
    },
    setQuantity: (state, action) => {
      // action.payload: { productId: number, quantity: number }
      const { productId, quantity } = action.payload;

      // Find the first occurrence index of this product
      const firstIndex = state.value.findIndex(item => item === productId);

      if (firstIndex !== -1) {
        // Remove all instances of this product
        const filteredArray = state.value.filter(item => item !== productId);

        // Create array with new quantity
        const newItems = Array(quantity).fill(productId);

        // Insert at the original position
        filteredArray.splice(firstIndex, 0, ...newItems);

        state.value = filteredArray;
      }
    },
  },
});
export default carSlice.reducer;
export const {
  addToCart,
  removeFromCart,
  clearCart,
  removeAllProductsId,
  setQuantity,
} = carSlice.actions;
