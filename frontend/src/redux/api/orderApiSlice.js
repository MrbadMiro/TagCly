import { apiSlice } from './apiSlice';
import { ORDERS_URL } from '../constants';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Admin: Get all orders
    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
        method: 'GET',
      }),
      providesTags: ['Order'],
      keepUnusedDataFor: 5,
    }),

    // User: Create single collar order
    createSingleCollarOrder: builder.mutation({
      query: (orderData) => ({
        url: `${ORDERS_URL}/single`,
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    // User: Get my orders
    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/myorders`,
        method: 'GET',
      }),
      providesTags: ['Order'],
    }),

    // User: Get order by ID (renamed from getOrderDetails)
    getOrderById: builder.query({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    // User: Update to paid
    payOrder: builder.mutation({
      query: ({ orderId, paymentResult }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: paymentResult,
      }),
      invalidatesTags: (result, error, { orderId }) => [{ type: 'Order', id: orderId }],
    }),

    // Admin: Update to delivered
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, orderId) => [{ type: 'Order', id: orderId }],
    }),

    // Admin: Delete order
    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),

    // Admin: Update order (general update for status, etc.)
    updateOrder: builder.mutation({
      query: ({ id, updatedOrder }) => ({
        url: `${ORDERS_URL}/${id}`,
        method: 'PUT',
        body: updatedOrder,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    
  }),
});

export const {
  useGetOrdersQuery,
  useCreateSingleCollarOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery, // Renamed from useGetOrderDetailsQuery
  usePayOrderMutation,
  useDeliverOrderMutation,
  useDeleteOrderMutation, // Add this export
  useUpdateOrderMutation, // Add this export
} = orderApiSlice;