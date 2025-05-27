import React, { useState } from "react";
import { useGetCollarsQuery, useDeleteCollarMutation, useUpdateCollarMutation } from "../../../redux/api/collarApiSlice";
import { useSelector } from "react-redux";
import { PencilLine, Trash, Check, X } from "lucide-react";
import { toast } from "react-toastify";

function AllCollars() {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: apiResponse, isLoading, isError, error, refetch } = useGetCollarsQuery();
  const [deleteCollar] = useDeleteCollarMutation();
  const [updateCollar] = useUpdateCollarMutation();

  // State for editable fields
  const [editableCollarId, setEditableCollarId] = useState(null);
  const [editedCollar, setEditedCollar] = useState({
    modelName: "",
    basePrice: 0,
    description: "",
    status: "available",
    variants: []
  });

  // Safely extract collars array from API response
  const collars = Array.isArray(apiResponse) ? apiResponse : 
                 Array.isArray(apiResponse?.data) ? apiResponse.data : 
                 [];

  // Check user roles
  const isAdmin = userInfo && userInfo.role === "admin";
  const hasViewAccess = isAdmin;
  const hasDeleteAccess = isAdmin;

  // Only allow Admins to access this page
  if (!hasViewAccess) {
    return <div className="p-4 text-red-500">You do not have permission to access this page.</div>;
  }

  // Handle delete collar
  const handleDelete = async (collarId) => {
    if (!hasDeleteAccess) {
      toast.error("Only administrators can delete collars.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this collar?")) {
      try {
        await deleteCollar(collarId).unwrap();
        toast.success("Collar deleted successfully!");
        refetch();
      } catch (err) {
        console.error("Failed to delete collar:", err);
        const errorMessage = err.data?.message || err.error || "Unknown error occurred";
        toast.error(`Failed to delete collar: ${errorMessage}`);
      }
    }
  };

  // Handle edit collar
  const handleEdit = (collar) => {
    setEditableCollarId(collar._id);
    setEditedCollar({
      modelName: collar.modelName,
      basePrice: collar.basePrice,
      description: collar.description,
      status: collar.status,
      variants: [...collar.variants]
    });
  };

  // Handle save edited collar
  const handleSave = async (collarId) => {
    try {
      await updateCollar({ id: collarId, updatedCollar: editedCollar }).unwrap();
      toast.success("Collar updated successfully!");
      setEditableCollarId(null);
      refetch();
    } catch (err) {
      console.error("Failed to update collar:", err);
      const errorMessage = err.data?.message || err.error || "Unknown error occurred";
      toast.error(`Failed to update collar: ${errorMessage}`);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditableCollarId(null);
  };

  // Handle variant change in edit mode
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...editedCollar.variants];
    updatedVariants[index][field] = field === 'stock' ? Number(value) : value;
    setEditedCollar({ ...editedCollar, variants: updatedVariants });
  };

  // Loading state
  if (isLoading) {
    return <div className="p-4 text-center">Loading collars...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error loading collars: {error.message}
        <button 
          onClick={refetch} 
          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // No collars found
  if (collars.length === 0) {
    return <div className="p-4 text-center">No collars found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Collars</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collars.map((collar, index) => (
                <tr key={collar._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  
                  {/* Model Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editableCollarId === collar._id ? (
                      <input
                        type="text"
                        value={editedCollar.modelName}
                        onChange={(e) => setEditedCollar({...editedCollar, modelName: e.target.value})}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{collar.modelName}</div>
                    )}
                  </td>
                  
                  {/* Base Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editableCollarId === collar._id ? (
                      <input
                        type="number"
                        value={editedCollar.basePrice}
                        onChange={(e) => setEditedCollar({...editedCollar, basePrice: Number(e.target.value)})}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">${collar.basePrice.toFixed(2)}</div>
                    )}
                  </td>
                  
                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editableCollarId === collar._id ? (
                      <select
                        value={editedCollar.status}
                        onChange={(e) => setEditedCollar({...editedCollar, status: e.target.value})}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="available">Available</option>
                        <option value="low stock">Low Stock</option>
                        <option value="out of stock">Out of Stock</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        collar.status === 'available' ? 'bg-green-100 text-green-800' :
                        collar.status === 'low stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {collar.status}
                      </span>
                    )}
                  </td>
                  
                  {/* Variants */}
                  <td className="px-6 py-4">
                    {editableCollarId === collar._id ? (
                      <div className="space-y-2">
                        {editedCollar.variants.map((variant, idx) => (
                          <div key={idx} className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={variant.color}
                              onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                              className="p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Color"
                            />
                            <input
                              type="text"
                              value={variant.size}
                              onChange={(e) => handleVariantChange(idx, 'size', e.target.value)}
                              className="p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Size"
                            />
                            <input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                              className="p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Stock"
                              min="0"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 max-h-20 overflow-y-auto">
                        {collar.variants.map((variant, idx) => (
                          <div key={idx} className="mb-1">
                            <span className="font-medium">{variant.color}</span> / 
                            <span className="font-medium">{variant.size}</span> - 
                            Stock: <span className="font-medium">{variant.stock}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {editableCollarId === collar._id ? (
                        <>
                          <button
                            onClick={() => handleSave(collar._id)}
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
                            onClick={() => handleEdit(collar)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <PencilLine size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(collar._id)}
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

export default AllCollars;