'use client'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminState {
    isAuthenticated: boolean;
    adminInfo: {
        id: string,
        email: string,
        role: string,
    } | null
};

interface LoginPayload {
    id: string;
    email: string;
}

const initialState: AdminState = {
    isAuthenticated: false,
    adminInfo: null
};

const adminSlice = createSlice({
    name:'admin',
    initialState,
    reducers: {
        login: (state, action: PayloadAction< LoginPayload >) => {
            state.isAuthenticated = true;
            state.adminInfo = {
                id: action.payload.id,
                email: action.payload.email,
                role: 'admin'
            }
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.adminInfo = null
        }
    }
});


export const {login, logout} = adminSlice.actions;
export default adminSlice.reducer;