
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from '@/store/slices/userSlice';
import employeeReducer from '@/store/slices/employeeSlice';
import adminReducer from '@/store/slices/adminSlice';
import { persistStore, persistReducer } from "redux-persist";
import storage from 'redux-persist/lib/storage';


const rootReducer = combineReducers({
    user: userReducer,
    admin: adminReducer,
    employee: employeeReducer
});


const persistConfig = {
    key: 'root',
    storage,
    
};

const persistedReducer = persistReducer( persistConfig, rootReducer );

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: false,
        })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;