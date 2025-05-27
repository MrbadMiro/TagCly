import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../redux/api/orderApiSlice';
import Title from '../components/Title';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const OrderCollarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    data: order, 
    isLoading, 
    isError, 
    error 
  } = useGetOrderByIdQuery(id);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Title text1={'LOADING'} text2={'ORDER DETAILS'} />
        <div className="mt-6 text-center">Loading order information...</div>
      </div>
    );
  }

  if (isError) {
    toast.error(error?.data?.message || 'Failed to load order details');
    navigate('/orderscollar');
    return null;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Title text1={'ORDER'} text2={'NOT FOUND'} />
        <div className="mt-6 text-center">Order not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Title text1={'ORDER'} text2={'DETAILS'} />
        <button 
          onClick={() => navigate('/orderscollar')}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Orders
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Order ID:</span> {order._id}</p>
              <p><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
              <p><span className="font-medium">Status:</span> <span className="capitalize">{order.orderStatus}</span></p>
              <p><span className="font-medium">Total:</span> ${order.totalAmount?.toFixed(2)}</p>
            </div>

            {/* Products */}
            <h3 className="text-lg font-semibold mt-6 mb-4">Products</h3>
            {order.products?.map((product) => (
              <div key={product._id} className="flex items-start gap-4 mb-4 pb-4 border-b">
                <img
                  src={product.productId?.image || assets.default_collar}
                  alt={product.productId?.modelName}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div>
                  <h4 className="font-medium">{product.productId?.modelName}</h4>
                  <p className="text-gray-600">${product.price?.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                  {product.variant && (
                    <p className="text-sm text-gray-500">
                      {product.variant.color && `Color: ${product.variant.color}`}
                      {product.variant.size && `, Size: ${product.variant.size}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping and Pet Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-2 mb-6">
              <p>{order.shippingInfo?.firstName} {order.shippingInfo?.lastName}</p>
              <p>{order.shippingInfo?.street}</p>
              <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipcode}</p>
              <p>{order.shippingInfo?.country}</p>
              <p>Phone: {order.shippingInfo?.phone}</p>
              <p>Email: {order.shippingInfo?.email}</p>
            </div>

            {order.pet && (
              <>
                <h3 className="text-lg font-semibold mb-4">Pet Information</h3>
                <div className="space-y-2">
                  {order.pet.existingPet ? (
                    <p>Using existing pet profile</p>
                  ) : (
                    <>
                      <p><span className="font-medium">Name:</span> {order.pet.newPet?.name}</p>
                      <p><span className="font-medium">Breed:</span> {order.pet.newPet?.breed}</p>
                      <p><span className="font-medium">Age:</span> {order.pet.newPet?.age} years</p>
                      <p><span className="font-medium">Weight:</span> {order.pet.newPet?.weight} kg</p>
                      <p><span className="font-medium">Gender:</span> {order.pet.newPet?.gender}</p>
                      {order.pet.newPet?.specialNeeds && (
                        <p><span className="font-medium">Special Needs:</span> {order.pet.newPet.specialNeeds}</p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCollarDetails;