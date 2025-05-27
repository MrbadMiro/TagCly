import React from 'react';
import { useGetMyOrdersQuery } from '../redux/api/orderApiSlice';
import Title from '../components/Title';

const OrderCollar = () => {
  const { 
    data: orders, 
    isLoading, 
    isError, 
    error 
  } = useGetMyOrdersQuery();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Detailed error logging
  React.useEffect(() => {
    if (isError) {
      console.error('Order Fetch Error:', error);
    }
  }, [isError, error]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 mb-4 w-1/2 mx-auto"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-100 h-24 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error Loading Orders</strong>
          <span className="block sm:inline">
            {error?.data?.message || 'Unable to fetch orders. Please try again later.'}
          </span>
        </div>
      </div>
    );
  }

  // No orders state
  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Title text1={'MY'} text2={'ORDERS'} />
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-6 rounded mt-6">
          <p className="text-xl">No orders found</p>
          <p className="text-sm text-gray-500 mt-2">
            You haven't placed any orders yet.
          </p>
        </div>
      </div>
    );
  }

  // Render orders
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      {orders.map((order) => (
        <div 
          key={order._id} 
          className="py-4 border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          {order.products.map((product) => (
            <div key={product._id} className="flex flex-start gap-6 text-sm">
              <img 
                className="w-16 sm:w-20 object-cover" 
                src={product.productId.image} 
                alt={product.productId.modelName} 
              />
              <div>
                <p className="sm:text-base font-medium">{product.productId.modelName}</p>
                <div className="flex items-center gap-3 mt-2 text-base text-gray-700">
                  <p className="text-lg">${product.price.toFixed(2)}</p>
                  <p>Quantity: {product.quantity}</p>
                  <p>Size: {product.variant.size}</p>
                </div>
                <p className="mt-2">
                  Date: <span className="text-gray-300">
                    {formatDate(order.createdAt)}
                  </span>
                </p>
              </div>
            </div>
          ))}

          <div className="md:w-1/2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span 
                className={`min-w-2 h-2 rounded-full ${getOrderStatusColor(order.orderStatus)}`}
              ></span>
              <p className="text-sm md:text-base capitalize">
                {order.orderStatus}
              </p>
            </div>
            <button 
              className="border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-100 transition-colors"
              onClick={() => {/* Implement order tracking logic */}}
            >
              Track Order
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderCollar;