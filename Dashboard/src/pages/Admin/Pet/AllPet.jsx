import React, { useState, useEffect } from "react";
import {
    useGetPetsQuery,
    useDeletePetMutation,
    useUpdatePetDetailsMutation
} from "../../../redux/api/petApiSlice";
import { useSelector } from "react-redux";
import { PencilLine, Trash, Check, X } from "lucide-react";
import { toast } from "react-toastify";

function AllPet() {
    const { userInfo } = useSelector((state) => state.auth);
    const { data: pets = [], isLoading, isError, error, refetch } = useGetPetsQuery();
    const [deletePet] = useDeletePetMutation();
    const [updatePet] = useUpdatePetDetailsMutation();

    // State for editable fields
    const [editablePetId, setEditablePetId] = useState(null);
    const [editedPet, setEditedPet] = useState({
        name: "",
        breed: "",
        age: 0,
        weight: 0,
        gender: "male",
        activityLevel: "moderate",
        trainingStatus: "untrained"
    });

    // Debug effect to log state changes
    useEffect(() => {
        console.log("Current editablePetId:", editablePetId);
    }, [editablePetId]);

    // Check user roles
    const isAdmin = userInfo && userInfo.role === "admin";
    const hasViewAccess = isAdmin;
    const hasDeleteAccess = isAdmin;

    // Handle delete pet
    const handleDelete = async (petId) => {
        if (!hasDeleteAccess) {
            toast.error("Only administrators can delete pets.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this pet?")) {
            try {
                await deletePet(petId).unwrap();
                toast.success("Pet deleted successfully!");
                refetch();
            } catch (err) {
                console.error("Failed to delete pet:", err);
                const errorMessage = err.data?.message || err.error || "Failed to delete pet";
                toast.error(errorMessage);
            }
        }
    };

    // Handle edit pet
    const handleEdit = (pet) => {
        console.log("Editing pet with ID:", pet._id);
        setEditablePetId(pet._id);
        setEditedPet({
            name: pet.name,
            breed: pet.breed,
            age: pet.age,
            weight: pet.weight,
            gender: pet.gender,
            activityLevel: pet.activityLevel,
            trainingStatus: pet.trainingStatus
        });
    };

    // Handle save edited pet with robust ID validation
    const handleSave = async (petId) => {
        console.group('Pet Update Process');
        console.log('Original Pet ID:', petId);
        console.log('Current Editable Pet ID:', editablePetId);
        console.log('Edited Pet Data:', editedPet);
      
        // Validate petId more robustly
        const stringId = String(petId).trim();
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(stringId);
        
        if (!isValidObjectId) {
          console.error('Invalid Pet ID Format:', petId);
          toast.error("Invalid pet ID format");
          console.groupEnd();
          return;
        }
      
        try {
          console.log('Preparing Mutation Arguments:', { 
            id: stringId,
            updatedPet: editedPet 
          });
      
          // Explicitly log before mutation
          console.log('About to call updatePet with:', { 
            id: stringId,
            updatedPet: editedPet 
          });
      
          const response = await updatePet({ 
            id: stringId,  // Make absolutely sure the ID is a string
            updatedPet: editedPet 
          }).unwrap();
      
          console.log('Update Response:', response);
      
          toast.success("Pet updated successfully!");
          setEditablePetId(null);
          refetch();
          console.groupEnd();
        } catch (err) {
          console.error("Full error details:", err);
          const errorMessage = 
            err.data?.error || 
            err.data?.message || 
            err.message || 
            "Failed to update pet";
          
          toast.error(`Error: ${errorMessage}`);
          console.groupEnd();
        }
      };

    // Handle cancel edit
    const handleCancel = () => {
        setEditablePetId(null);
    };

    // Only allow Admins to access this page
    if (!hasViewAccess) {
        return <div className="p-4 text-red-500">You do not have permission to access this page.</div>;
    }

    // Loading state
    if (isLoading) {
        return <div className="p-4 text-center">Loading pets...</div>;
    }

    // Error state
    if (isError) {
        return (
            <div className="p-4 text-red-500 text-center">
                Error loading pets: {error.message}
                <button
                    onClick={refetch}
                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    // No pets found
    if (pets.length === 0) {
        return <div className="p-4 text-center">No pets found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">All Pets</h1>

            {/* Debug information - can be removed after fixing */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Information:</h3>
                {pets.length > 0 && (
                    <div className="text-sm">
                        <p>First pet ID: <code>{pets[0]._id}</code></p>
                        <p>Type: <code>{typeof pets[0]._id}</code></p>
                        <p>Currently editing: <code>{editablePetId || 'None'}</code></p>
                    </div>
                )}
            </div>
            {/* Debug information */}
            <div className="bg-gray-100 p-4 mb-4 rounded">
                <h3 className="font-bold">Debug Information</h3>
                <pre className="text-xs">
                    Current Editable Pet ID: {editablePetId}
                    Edited Pet Data: {JSON.stringify(editedPet, null, 2)}
                </pre>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Breed</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pets.map((pet) => (
                                <tr key={pet._id} className="hover:bg-gray-50">
                                    {/* ID Column - for debugging */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                        {pet._id}
                                    </td>

                                    {/* Name */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editablePetId === pet._id ? (
                                            <input
                                                type="text"
                                                value={editedPet.name}
                                                onChange={(e) => setEditedPet({ ...editedPet, name: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="text-sm font-medium text-gray-900">{pet.name}</div>
                                        )}
                                    </td>

                                    {/* Breed */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editablePetId === pet._id ? (
                                            <input
                                                type="text"
                                                value={editedPet.breed}
                                                onChange={(e) => setEditedPet({ ...editedPet, breed: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900">{pet.breed}</div>
                                        )}
                                    </td>

                                    {/* Age */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editablePetId === pet._id ? (
                                            <input
                                                type="number"
                                                value={editedPet.age}
                                                onChange={(e) => setEditedPet({ ...editedPet, age: Number(e.target.value) })}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="0"
                                                step="0.1"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900">{pet.age} yrs</div>
                                        )}
                                    </td>

                                    {/* Weight */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editablePetId === pet._id ? (
                                            <input
                                                type="number"
                                                value={editedPet.weight}
                                                onChange={(e) => setEditedPet({ ...editedPet, weight: Number(e.target.value) })}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                min="0"
                                                step="0.1"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900">{pet.weight} kg</div>
                                        )}
                                    </td>

                                    {/* Gender */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editablePetId === pet._id ? (
                                            <select
                                                value={editedPet.gender}
                                                onChange={(e) => setEditedPet({ ...editedPet, gender: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pet.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                                                    pet.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {pet.gender}
                                            </span>
                                        )}
                                    </td>

                                    {/* Activity Level */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editablePetId === pet._id ? (
                                            <select
                                                value={editedPet.activityLevel}
                                                onChange={(e) => setEditedPet({ ...editedPet, activityLevel: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="moderate">Moderate</option>
                                                <option value="high">High</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pet.activityLevel === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                                    pet.activityLevel === 'moderate' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {pet.activityLevel}
                                            </span>
                                        )}
                                    </td>

                                    {/* Training Status */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editablePetId === pet._id ? (
                                            <select
                                                value={editedPet.trainingStatus}
                                                onChange={(e) => setEditedPet({ ...editedPet, trainingStatus: e.target.value })}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="untrained">Untrained</option>
                                                <option value="basic">Basic</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pet.trainingStatus === 'untrained' ? 'bg-red-100 text-red-800' :
                                                    pet.trainingStatus === 'basic' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {pet.trainingStatus}
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            {editablePetId === pet._id ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            console.log("Save button clicked for pet:", pet._id);
                                                            handleSave(pet._id);
                                                        }}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Save"
                                                    >
                                                        <Check size={20} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Cancel"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(pet)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Edit"
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pet._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                        disabled={!hasDeleteAccess}
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AllPet;