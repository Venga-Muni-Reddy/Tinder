// store.js
import { configureStore } from '@reduxjs/toolkit';
// Import the user reducer we just created
import userReducer from './userSlice'; 

const store = configureStore({
  reducer: {
    // Assign the imported userReducer to a key in your store's state
    user: userReducer, 
  },
});

export default store;