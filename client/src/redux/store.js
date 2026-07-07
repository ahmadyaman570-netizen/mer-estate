import { configureStore,combineReducers } from '@reduxjs/toolkit'
import { persistReducer,persistStore } from 'redux-persist'
import userReducer from './user/userSlice'
import importedStorage from "redux-persist/lib/storage/index.js";
const storage = importedStorage.default;

const rootReducer = combineReducers({
  user: userReducer,
});
const persistConfig = {
  key: 'root',
  storage,
 version: 1,
};
console.log(storage);
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware : (getDefaultMiddileware) => getDefaultMiddileware({
   serializableCheck: false,
  }),
});

export const persistor= persistStore(store)