import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login user
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"], // Invalidate cache on login
    }),

    // Register a new user
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"], // Invalidate cache on registration
    }),

    // Logout user
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"], // Invalidate cache on logout
    }),

    // Update user profile
    profile: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"], // Invalidate cache on profile update
    }),

    // Fetch all users
    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
        method: "GET",
      }),
      providesTags: ["User"], // Invalidate cache when a user is added, updated, or deleted
      keepUnusedDataFor: 5, // Cache data for 5 seconds
    }),

    // Delete a user by ID
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"], // Invalidate cache on user deletion
    }),

    // Fetch a single user by ID
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }], // Tag for individual user
      keepUnusedDataFor: 5, // Cache data for 5 seconds
    }),

    // Update a user by ID
    updateUser: builder.mutation({
      query: (data) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;

        return {
          url: `${USERS_URL}/${isFormData ? data.get('userId') : data.userId}`,
          method: "PUT",
          body: data,
          // Don't set Content-Type when sending FormData, browser will set it properly with boundary
          formData: isFormData,
        };
      },
      invalidatesTags: (result, error, arg) => {
        const userId = arg instanceof FormData ? arg.get('userId') : arg.userId;
        return [{ type: "User", id: userId }];
      },
    }),
    // Fetch all students
    getStudents: builder.query({
      query: () => ({
        url: `${USERS_URL}/students`,
        method: "GET",
      }),
      providesTags: ["User"], // Invalidate cache when a student is added, updated, or deleted
      keepUnusedDataFor: 5, // Cache data for 5 seconds
    }),

    // Forgot Password - Send OTP
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: "POST",
        body: data, // Use data directly, which already has { email }
      }),
    }),

    // Validate OTP
    validateOTP: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/validate-otp`,
        method: "POST",
        body: data, // Use data directly, which already has { email, otp }
      }),
    }),

    // Reset Password - Verify OTP and Update Password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useProfileMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetUserDetailsQuery,
  useGetStudentsQuery,
  useForgotPasswordMutation,
  useValidateOTPMutation, // Add this
  useResetPasswordMutation,
} = userApiSlice;