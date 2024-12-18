'use client'
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EmployeeState {
    isAuthenticated: boolean;
    employeeInfo: {
        id: string,
        empname: string,
        email: string,
        role: string,
    } | null
}

interface LoginPayload {
    id: string,
    empname: string,
    email: string,
}

const initialState: EmployeeState = {
    isAuthenticated: false,
    employeeInfo: null
};

const employeeSlice = createSlice({
    name:'employee',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<LoginPayload>) => {
            state.isAuthenticated = true;
            state.employeeInfo = {
                id: action.payload.id,
                empname: action.payload.empname,
                email: action.payload.email,
                role: 'employee'
            };
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.employeeInfo = null;
        }
    }
});

export const {login, logout} = employeeSlice.actions;
export default employeeSlice.reducer;