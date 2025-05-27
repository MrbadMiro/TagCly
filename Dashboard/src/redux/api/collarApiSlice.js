import { apiSlice } from "./apiSlice";
import { COLLARS_URL } from "../constants";

export const collarApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Add a new collar
    addCollar: builder.mutation({
      query: (data) => ({
        url: COLLARS_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Collar"],
    }),

    // Fetch all collars
    getCollars: builder.query({
      query: () => ({
        url: COLLARS_URL,
        method: "GET",
      }),
      providesTags: ["Collar"],
      keepUnusedDataFor: 5, // Cache data for 5 seconds
    }),

    // Fetch a single collar by ID
    getCollarById: builder.query({
      query: (id) => ({
        url: `${COLLARS_URL}/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Collar", id }],
      keepUnusedDataFor: 5,
    }),

    // Update collar details
    updateCollar: builder.mutation({
      query: (data) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;

        return {
          url: `${COLLARS_URL}/${isFormData ? data.get('id') : data.id}`,
          method: "PUT",
          body: data,
          formData: isFormData,
        };
      },
      invalidatesTags: (result, error, arg) => {
        const collarId = arg instanceof FormData ? arg.get('id') : arg.id;
        return [{ type: "Collar", id: collarId }];
      },
    }),

    // Delete a collar
    deleteCollar: builder.mutation({
      query: (collarId) => ({
        url: `${COLLARS_URL}/${collarId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Collar"],
    }),

    // Add component to collar
    addComponent: builder.mutation({
      query: (data) => ({
        url: `${COLLARS_URL}/${data.collarId}/components`,
        method: "POST",
        body: data.componentData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Collar", id: arg.collarId }
      ],
    }),

    // Update component stock
    updateComponentStock: builder.mutation({
      query: (data) => ({
        url: `${COLLARS_URL}/${data.collarId}/components/update`,
        method: "PUT",
        body: data.stockData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Collar", id: arg.collarId }
      ],
    }),

    // Add a review to a collar
    addCollarReview: builder.mutation({
      query: (data) => ({
        url: `${COLLARS_URL}/${data.collarId}/reviews`,
        method: "POST",
        body: data.reviewData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Collar", id: arg.collarId }
      ],
    }),

    // Fetch top collars
    getTopCollars: builder.query({
      query: () => ({
        url: `${COLLARS_URL}/top`,
        method: "GET",
      }),
      providesTags: ["Collar"],
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useAddCollarMutation,
  useGetCollarsQuery,
  useGetCollarByIdQuery,
  useUpdateCollarMutation,
  useDeleteCollarMutation,
  useAddComponentMutation,
  useUpdateComponentStockMutation,
  useAddCollarReviewMutation,
  useGetTopCollarsQuery,
} = collarApiSlice;