// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: "user",
  // `initialState` is the correct property name, not `initialValue`
  initialState: null, 
  reducers: {
    // Reducers are defined inside the `reducers` object
    addUser: (state, action) => {
      // Immer, built into createSlice, allows direct mutation
      // but returning the payload also works for simple replacements.
      return action.payload; 
    },
    removeUser: (state, action) => {
      return null;
    }
  }
});

// Actions are automatically generated and exported from userSlice.actions
export const { addUser, removeUser } = userSlice.actions;

// The reducer for this slice is exported as userSlice.reducer
export default userSlice.reducer;