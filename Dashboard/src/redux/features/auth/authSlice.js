import { createSlice } from "@reduxjs/toolkit";

// Helper function to safely parse localStorage data
const getUserInfoFromLocalStorage = () => {
    try {
        const userInfo = localStorage.getItem("userInfo");
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
        console.error("Error parsing userInfo from localStorage:", error);
        return null;
    }
};

// Initial state
const initialState = {
    userInfo: getUserInfoFromLocalStorage(), // Safely get user info from localStorage
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            try {
                localStorage.setItem("userInfo", JSON.stringify(action.payload)); // Store user info in localStorage
            } catch (error) {
                console.error("Error saving userInfo to localStorage:", error);
            }
        },
        logout: (state) => {
            state.userInfo = null;
            try {
                localStorage.removeItem("userInfo"); // Clear user info from localStorage
            } catch (error) {
                console.error("Error removing userInfo from localStorage:", error);
            }
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;   