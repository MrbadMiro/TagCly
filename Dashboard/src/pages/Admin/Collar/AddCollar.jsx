import React, { useState } from "react";
import { useAddCollarMutation } from "../../../redux/api/collarApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AddCollar() {
  const [modelName, setModelName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("available"); // Changed to match schema enum
  const [variants, setVariants] = useState([
    { color: "", size: "", stock: 0 }
  ]);
  const [image, setImage] = useState(null);

  const [addCollar, { isLoading }] = useAddCollarMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Check if the user is an admin
  const isAdmin = userInfo && userInfo.role === "admin";

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = field === 'stock' ? Number(value) : value;
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { color: "", size: "", stock: 0 }]);
  };

  const removeVariant = (index) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validation
    if (!modelName || !basePrice || isNaN(basePrice)) {
      toast.error("Please fill in all required fields with valid values.");
      return;
    }
  
    if (variants.some(v => !v.color || !v.size || isNaN(v.stock))) {
      toast.error("Please fill in all variant fields with valid values.");
      return;
    }
  
    const formData = new FormData();
    formData.append('modelName', modelName);
    formData.append('basePrice', basePrice);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('variants', JSON.stringify(variants.map(v => ({
      color: v.color,
      size: v.size,
      stock: v.stock
    }))));
    if (image) {
      formData.append('image', image);
    }
  
    try {
      const response = await addCollar(formData).unwrap();
      toast.success("Collar added successfully!");
      navigate("/collars");
    } catch (err) {
      console.error("Failed to add collar:", err);
      toast.error(err.data?.message || "Failed to add collar. Please try again.");
    }
  };

  // Only allow Admin to access this page
  if (!isAdmin) {
    return <div className="p-4 text-red-500">You do not have permission to access this page.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Collar</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Model Name Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Model Name*</label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Base Price Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Base Price*</label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>

        {/* Description Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          />
        </div>

        {/* Status Field - Updated to match schema enum */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="available">Available</option>
            <option value="low stock">Low Stock</option>
            <option value="out of stock">Out of Stock</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Collar Image</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/*"
          />
        </div>

        {/* Variants Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Variants*</h3>
          {variants.map((variant, index) => (
            <div key={index} className="mb-4 p-3 border rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                {/* Color */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Color*</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                {/* Size */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Size*</label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                {/* Stock */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Stock*</label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove Variant
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addVariant}
            className="text-blue-500 text-sm hover:text-blue-700"
          >
            + Add Another Variant
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:bg-blue-300"
        >
          {isLoading ? "Adding..." : "Add Collar"}
        </button>
      </form>
    </div>
  );
}

export default AddCollar;