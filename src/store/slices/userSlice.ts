"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  isAuthenticated: boolean;
  userInfo: {
    id: string;
    username: string;
    email: string;
    image?: string[];
    phone?: string;
    birthday?: string;
    lookingFor?: string;
    interestedIn?: string;
    role: string;
    prime?:{
      isPrime: boolean,
      primeCount: number,
      startDate: string,
      endDate: string,
    } | null
  } | null;
}

interface LoginPayload {
  id: string;
  username: string;
  email: string;
  image?: string[];
  phone?: string;
  birthday?: string;
  lookingFor?: string;
  interestedIn?: string;
  prime?:{
    isPrime: boolean,
    primeCount: number,
    startDate: string,
    endDate: string,
  } | null
}

const initialState: UserState = {
  isAuthenticated: false,
  userInfo: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<LoginPayload>) => {
      state.isAuthenticated = true;
      state.userInfo = {
        id: action.payload.id,
        username: action.payload.username,
        email: action.payload.email,
        image: action.payload.image,
        role: "user",
        phone: action.payload.phone,
        birthday: action.payload.birthday, 
        lookingFor: action.payload.lookingFor, 
        interestedIn: action.payload.interestedIn,
        prime: action.payload.prime 
      };
    },
    updateStatus: (state, action: PayloadAction<LoginPayload>) => {
      if (state.userInfo) {
        state.userInfo = {
          ...state.userInfo, 
          ...action.payload,
        };
      }
    },
    updatePrimeStatus: (
      state,
      action: PayloadAction<{
        isPrime: boolean;
        primeCount: number;
        startDate: string;
        endDate: string;
      }>
    ) => {
      if (state.userInfo && state.userInfo.prime) {
        state.userInfo.prime = {
          ...state.userInfo.prime,
          ...action.payload, // Update only prime details
        };
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.userInfo = null;
    },
  },
});

export const { login, logout, updateStatus, updatePrimeStatus } = userSlice.actions;
export default userSlice.reducer;
