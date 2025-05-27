import { apiSlice } from './apiSlice';
import { PETS_HEALTH_URL } from '../constants';

export const activityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get activity trends for a pet
    getActivityTrends: builder.query({
      query: ({ petId, days = 7, resolution = 'daily' } = {}) => {
        if (!petId) {
          console.error('Missing petId in query parameters');
          throw new Error('Pet ID is required');
        }
        
        console.log(`Making request for petId: ${petId}`); // Debug log
        
        return {
          url: `${PETS_HEALTH_URL}/${petId}/activity`,
          method: 'GET',
          params: { days, resolution },
        };
      },
      providesTags: (result, error, { petId }) => 
        result ? [{ type: 'Activity', id: petId }] : ['Activity'],
      keepUnusedDataFor: 60,
      transformResponse: (response) => {
        if (!response?.data) {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response format');
        }
        
        return {
          ...response.data,
          lastUpdated: new Date().toISOString(),
        };
      },
    }),

    // Get activity trends for all pets
    getAllPetsActivityTrends: builder.query({
      query: ({ days = 7, resolution = 'daily' } = {}) => {
        return {
          url: `${PETS_HEALTH_URL}/activity/all`,
          method: 'GET',
          params: { days, resolution },
        };
      },
      providesTags: ['AllPetsActivity'],
      keepUnusedDataFor: 60,
      transformResponse: (response) => {
        if (!response?.data) {
          console.error('Invalid response format:', response);
          throw new Error('Invalid response format');
        }
        
        return {
          data: response.data,
          lastUpdated: new Date().toISOString(),
        };
      },
    }),

    // Refresh activity trends
    refreshActivityTrends: builder.mutation({
      query: ({ petId, days = 7, resolution = 'daily' } = {}) => {
        if (!petId) {
          console.error('Missing petId in mutation parameters');
          throw new Error('Pet ID is required');
        }
        
        return {
          url: `${PETS_HEALTH_URL}/${petId}/activity`,
          method: 'GET',
          params: { days, resolution },
        };
      },
      invalidatesTags: (result, error, { petId }) => [{ type: 'Activity', id: petId }],
    }),

    // Refresh all pets activity trends
    refreshAllPetsActivityTrends: builder.mutation({
      query: ({ days = 7, resolution = 'daily' } = {}) => {
        return {
          url: `${PETS_HEALTH_URL}/activity/all`,
          method: 'GET',
          params: { days, resolution },
        };
      },
      invalidatesTags: ['AllPetsActivity'],
    }),
  }),
});

export const {
  useGetActivityTrendsQuery,
  useGetAllPetsActivityTrendsQuery,
  useRefreshActivityTrendsMutation,
  useRefreshAllPetsActivityTrendsMutation,
} = activityApiSlice;