import { apiSlice } from "./apiSlice";
import { COLLARS_URL } from "../constants";

export const collarApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch all collars
    getCollars: builder.query({
      query: () => ({
        url: COLLARS_URL,
        method: "GET",
      }),
      providesTags: ["Collar"],
      keepUnusedDataFor: 5,
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

    // Add a new collar (supports both form data and regular data)
    addCollar: builder.mutation({
      query: (data) => {
        const isFormData = data instanceof FormData;
        return {
          url: COLLARS_URL,
          method: "POST",
          body: data,
          ...(isFormData ? { formData: true } : {}),
        };
      },
      invalidatesTags: ["Collar"],
    }),

    // Update collar details
    updateCollarDetails: builder.mutation({
      query: (data) => {
        const isFormData = data instanceof FormData;
        const collarId = isFormData ? data.get('id') : data.id;
        
        return {
          url: `${COLLARS_URL}/${collarId}`,
          method: "PUT",
          body: data,
          ...(isFormData ? { formData: true } : {}),
        };
      },
      invalidatesTags: (result, error, arg) => {
        const collarId = arg instanceof FormData ? arg.get('id') : arg.id;
        return [{ type: "Collar", id: collarId }];
      },
    }),

    // Remove a collar
    removeCollar: builder.mutation({
      query: (collarId) => ({
        url: `${COLLARS_URL}/${collarId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Collar"],
    }),

    // Update variant stock
    updateVariantStock: builder.mutation({
      query: ({ variantId, stock }) => ({
        url: `${COLLARS_URL}/variant/${variantId}/stock`,
        method: "PATCH",
        body: { stock },
      }),
      invalidatesTags: ["Collar"],
    }),
  }),
});

export const {
  useGetCollarsQuery,
  useGetCollarByIdQuery,
  useAddCollarMutation,
  useUpdateCollarDetailsMutation,
  useRemoveCollarMutation,
  useUpdateVariantStockMutation,
} = collarApiSlice;