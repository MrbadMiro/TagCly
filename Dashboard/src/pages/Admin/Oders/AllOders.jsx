import React, { useState } from "react";
import { 
  useGetOrdersQuery, 
  useDeleteOrderMutation, 
  useUpdateOrderMutation,
  useDeliverOrderMutation
} from "../../../redux/api/orderApiSlice";
import { useSelector } from "react-redux";
import { PencilLine, Trash, Check, X, Truck } from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";

function AllOrders() {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: orders = [], isLoading, isError, error, refetch } = useGetOrdersQuery();
  const [deleteOrder] = useDeleteOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [deliverOrder] = useDeliverOrderMutation();

  // State for editable fields
  const [editableOrderId, setEditableOrderId] = useState(null);
  const [editedOrder, setEditedOrder] = useState({
    orderStatus: "",
    paymentStatus: "",
    shippingInfo: {
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: ""
    }
  });

  // Check user roles
  const isAdmin = userInfo && userInfo.role === "admin";
  const hasViewAccess = isAdmin;
  const hasEditAccess = isAdmin;
  const hasDeleteAccess = isAdmin;

  // Handle delete order
  const handleDelete = async (orderId) => {
    if (!hasDeleteAccess) {
      toast.error("Only administrators can delete orders.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId).unwrap();
        toast.success("Order deleted successfully!");
        refetch();
      } catch (err) {
        console.error("Failed to delete order:", err);
        const errorMessage = err.data?.message || err.error || "Failed to delete order";
        toast.error(errorMessage);
      }
    }
  };

  // Handle edit order
  const handleEdit = (order) => {
    setEditableOrderId(order._id);
    setEditedOrder({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      shippingInfo: { ...order.shippingInfo }
    });
  };

  // Handle save edited order
  const handleSave = async (orderId) => {
    try {
      await updateOrder({ 
        id: orderId, 
        updatedOrder: editedOrder 
      }).unwrap();
      toast.success("Order updated successfully!");
      setEditableOrderId(null);
      refetch();
    } catch (err) {
      console.error("Failed to update order:", err);
      const errorMessage = err.data?.message || err.error || "Failed to update order";
      toast.error(errorMessage);
    }
  };

  // Handle mark as delivered
  const handleDeliver = async (orderId) => {
    try {
      await deliverOrder(orderId).unwrap();
      toast.success("Order marked as delivered!");
      refetch();
    } catch (err) {
      console.error("Failed to mark as delivered:", err);
      const errorMessage = err.data?.message || err.error || "Failed to update delivery status";
      toast.error(errorMessage);
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditableOrderId(null);
  };

  // Only allow Admins to access this page
  if (!hasViewAccess) {
    return <div className="p-4 text-red-500">You do not have permission to access this page.</div>;
  }

  // Loading state
  if (isLoading) {
    return <div className="p-4 text-center">Loading orders...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error loading orders: {error.message}
        <button 
          onClick={refetch} 
          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // No orders found
  if (orders.length === 0) {
    return <div className="p-4 text-center">No orders found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  {/* Order ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.substring(0, 8)}...
                  </td>
                  
                  {/* Customer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{order.shippingInfo.email}</div>
                  </td>
                  
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {moment(order.createdAt).format("MMM D, YYYY")}
                  </td>
                  
                  {/* Amount */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.totalAmount?.toFixed(2) || "0.00"}
                  </td>
                  
                  {/* Order Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editableOrderId === order._id ? (
                      <select
                        value={editedOrder.orderStatus}
                        onChange={(e) => setEditedOrder({...editedOrder, orderStatus: e.target.value})}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    )}
                  </td>
                  
                  {/* Payment Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editableOrderId === order._id ? (
                      <select
                        value={editedOrder.paymentStatus}
                        onChange={(e) => setEditedOrder({...editedOrder, paymentStatus: e.target.value})}
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {editableOrderId === order._id ? (
                        <>
                          <button
                            onClick={() => handleSave(order._id)}
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
                            onClick={() => handleEdit(order)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                            disabled={!hasEditAccess}
                          >
                            <PencilLine size={20} />
                          </button>
                          <button
                            onClick={() => handleDeliver(order._id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Mark as Delivered"
                            disabled={!hasEditAccess || order.orderStatus === 'delivered'}
                          >
                            <Truck size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
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

export default AllOrders;