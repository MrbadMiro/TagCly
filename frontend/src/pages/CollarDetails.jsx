import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCollarsQuery } from '../redux/api/collarApiSlice';
import { useSelector } from 'react-redux';
import Login from './Login'; // Import the Login component

const CollarDetails = () => {
  const { collarId } = useParams();
  const navigate = useNavigate();
  
  // State to control login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: apiResponse, isLoading, isError } = useGetCollarsQuery();
  
  // Extract the collar data from API response
  const collar = apiResponse?.data?.[0] || apiResponse?.[0];
  const selectedVariant = collar?.variants?.[0];

  const handleBuyNow = () => {
    // Check if user is logged in
    if (!userInfo) {
      // Show login modal instead of redirecting
      setShowLoginModal(true);
      return;
    }

    // If logged in, proceed to place order
    navigate('/place-ordercollar', { 
      state: { 
        product: {
          _id: collar._id,
          modelName: collar.modelName,
          basePrice: collar.basePrice,
          variant: selectedVariant,
          image: collar.image
        }
      } 
    });
  };

  // Close login modal and handle successful login
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Proceed with buy action
    navigate('/place-ordercollar', { 
      state: { 
        product: {
          _id: collar._id,
          modelName: collar.modelName,
          basePrice: collar.basePrice,
          variant: selectedVariant,
          image: collar.image
        }
      } 
    });
  };
  
  if (isLoading) return <div className="text-center py-8">Loading collar details...</div>;
  if (isError) return <div className="text-center py-8 text-red-500">Error loading collar</div>;
  if (!collar) return <div className="text-center py-8">Collar not found</div>;

  return (
    <div className="relative flex flex-col md:flex-row container mx-auto p-4 md:p-6 gap-6 md:gap-8">
      {/* Login Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl relative w-full max-w-md">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-2xl font-bold text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
            <Login onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}

      {/* Existing Collar Details Component */}
      <div className="w-full md:w-1/2">
        <img 
          src={collar.image} 
          alt={collar.modelName} 
          className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/default-collar.jpg';
          }}
        />
      </div>

      {/* Right Side: Collar Details */}
      <div className="w-full md:w-1/2 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">{collar.modelName}</h1>
        <div className="text-xl md:text-2xl font-semibold text-green-600">
          ${collar.basePrice.toFixed(2)}
        </div>

        {selectedVariant && (
          <div>
            <h3 className="font-medium mb-3">Variant</h3>
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-2 border border-gray-300 rounded bg-gray-50">
                <span className="font-medium">{selectedVariant.color} - {selectedVariant.size}</span>
                <span className="ml-2 text-sm">({selectedVariant.stock} in stock)</span>
              </div>
            </div>
          </div>
        )}

        {collar.description && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-700">{collar.description}</p>
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Details</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Status: {collar.status}</li>
            <li>Product ID: {collar.collarId}</li>
          </ul>
        </div>

        <button 
          onClick={handleBuyNow}
          className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Buy Now - ${collar.basePrice.toFixed(2)}
        </button>
      </div>
    </div>
  );
};

export default CollarDetails;