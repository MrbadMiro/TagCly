import { apiSlice } from './apiSlice';
import { PETS_URL } from '../constants';

export const petApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all pets
    getPets: builder.query({
      query: () => ({
        url: PETS_URL,
        method: 'GET',
      }),
      providesTags: ['Pet'],
      keepUnusedDataFor: 5, // Cache data for 5 seconds
    }),

    // Get pet details
    getPetDetails: builder.query({
      query: (petId) => ({
        url: `${PETS_URL}/${petId}`,
        method: 'GET',
      }),
      providesTags: (result, error, petId) => [{ type: 'Pet', id: petId }],
      keepUnusedDataFor: 5, // Cache data for 5 seconds
    }),

    // Register a new pet
    registerPet: builder.mutation({
      query: (petData) => ({
        url: PETS_URL,
        method: 'POST',
        body: petData,
      }),
      invalidatesTags: ['Pet'],
    }),

    // Update pet details
    updatePetDetails: builder.mutation({
      query: (data) => {
        // More aggressive destructuring and logging
        console.log('Raw mutation data:', data);
        
        // Ensure data is an object and has an id
        if (!data || typeof data !== 'object') {
          console.error('Invalid data passed to updatePetDetails:', data);
          throw new Error('Invalid update data');
        }
    
        const { id, updatedPet } = data;
        
        // Extensive logging
        console.log('Mutation Details:', { 
          id, 
          updatedPet,
          idType: typeof id,
          idValid: id ? /^[0-9a-fA-F]{24}$/.test(String(id).trim()) : false
        });
    
        // Validate ID more strictly
        if (!id || !String(id).trim() || !/^[0-9a-fA-F]{24}$/.test(String(id).trim())) {
          console.error('Invalid or missing pet ID:', id);
          throw new Error('Invalid or missing pet ID');
        }
    
        return {
          url: `${PETS_URL}/${id}`,
          method: 'PUT',
          body: updatedPet
        };
      },
      // Invalidate specific pet tag
      invalidatesTags: (result, error, arg) => {
        // More robust tag invalidation
        const id = arg?.id || arg;
        console.log('Invalidating tags for ID:', id);
        return id 
          ? [{ type: 'Pet', id }, 'Pet']
          : ['Pet'];
      },
    }),


    // Delete pet
    deletePet: builder.mutation({
      query: (petId) => ({
        url: `${PETS_URL}/${petId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pet'],
    }),
  }),
});

export const {
  useGetPetsQuery,
  useGetPetDetailsQuery,
  useRegisterPetMutation,
  useUpdatePetDetailsMutation,
  useDeletePetMutation,
} = petApiSlice;