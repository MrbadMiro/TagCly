import { apiSlice } from './apiSlice';
import { PETS_URL } from '../constants';

export const petApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register a new pet
    registerPet: builder.mutation({
      query: (petData) => ({
        url: PETS_URL,
        method: 'POST',
        body: petData,
      }),
      invalidatesTags: ['Pet'],
    }),

    // Get pet details
    getPetDetails: builder.query({
      query: (petId) => ({
        url: `${PETS_URL}/${petId}`,
        method: 'GET',
      }),
      providesTags: (result, error, petId) => [{ type: 'Pet', id: petId }],
    }),

    // Update pet details
    updatePetDetails: builder.mutation({
      query: (args) => {
        // Destructure with a default empty object to prevent undefined
        const { id, updatedPet } = args || {};
        
        // Add extensive logging and validation
        console.log('Update Pet Args:', { id, updatedPet });
        
        // Throw an error if id is missing
        if (!id) {
          throw new Error('Pet ID is required for update');
        }

        return {
          url: `${PETS_URL}/${id}`,
          method: 'PUT',
          body: updatedPet
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Pet', id }],
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
  useRegisterPetMutation,
  useGetPetDetailsQuery,
  useUpdatePetDetailsMutation,
  useDeletePetMutation,
} = petApiSlice;