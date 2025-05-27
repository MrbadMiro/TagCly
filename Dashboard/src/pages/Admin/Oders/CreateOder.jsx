import React, { useState } from "react";
import { useCreateSingleCollarOrderMutation } from "../../../redux/api/orderApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateOrder = () => {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe"); // Default to stripe
  const [savePet, setSavePet] = useState(false);
  
  // Shipping info state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });

  // Pet info state
  const [pet, setPet] = useState({
    existingPet: "",
    newPet: {
      name: "",
      breed: "",
      age: "",
      weight: "",
      gender: "male",
      specialNeeds: "",
    },
  });

  const [createSingleCollarOrder, { isLoading }] = useCreateSingleCollarOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePetChange = (e) => {
    const { name, value } = e.target;
    setPet((prev) => ({
      ...prev,
      newPet: {
        ...prev.newPet,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        productId,
        variantId,
        paymentMethod,
        shippingInfo: {
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          street: shippingInfo.street,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipcode: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
        pet,
        savePet,
      };
  
      const res = await createSingleCollarOrder(orderData).unwrap();
      toast.success("Order created successfully!");
  
      // Reset the entire form after successful submission
      setProductId("");
      setVariantId("");
      setPaymentMethod("stripe"); // Reset to default payment method
      setSavePet(false);
      
      // Reset shipping info
      setShippingInfo({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
      });
  
      // Reset pet info
      setPet({
        existingPet: "",
        newPet: {
          name: "",
          breed: "",
          age: "",
          weight: "",
          gender: "male",
          specialNeeds: "",
        },
      });
  
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to create order");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Order</h1>
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Information */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Product Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Product ID</label>
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Variant ID</label>
              <input
                type="text"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Pet Information */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-3">Pet Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Pet Type</label>
              <select
                className="w-full p-2 border rounded"
                value={pet.existingPet ? "existing" : "new"}
                onChange={(e) => {
                  if (e.target.value === "existing") {
                    setPet(prev => ({ ...prev, existingPet: "" }));
                  } else {
                    setPet(prev => ({
                      existingPet: "",
                      newPet: {
                        name: "",
                        breed: "",
                        age: "",
                        weight: "",
                        gender: "male",
                        specialNeeds: ""
                      }
                    }));
                  }
                }}
              >
                <option value="new">New Pet</option>
                <option value="existing">Existing Pet</option>
              </select>
            </div>

            {pet.existingPet ? (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Pet</label>
                <select
                  className="w-full p-2 border rounded"
                  value={pet.existingPet}
                  onChange={(e) => setPet(prev => ({ ...prev, existingPet: e.target.value }))}
                >
                  <option value="">Select a pet</option>
                  {/* You would map through user's pets here */}
                  <option value="1">Max (Golden Retriever)</option>
                  <option value="2">Bella (Labrador)</option>
                </select>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Pet Name</label>
                  <input
                    type="text"
                    name="name"
                    value={pet.newPet.name}
                    onChange={handlePetChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={pet.newPet.breed}
                      onChange={handlePetChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                      type="text"
                      name="age"
                      value={pet.newPet.age}
                      onChange={handlePetChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={pet.newPet.weight}
                      onChange={handlePetChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select
                      name="gender"
                      value={pet.newPet.gender}
                      onChange={handlePetChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Special Needs (optional)</label>
                  <textarea
                    name="specialNeeds"
                    value={pet.newPet.specialNeeds}
                    onChange={handlePetChange}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={savePet}
                      onChange={(e) => setSavePet(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm">Save this pet to my profile</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Shipping Information */}
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={shippingInfo.firstName}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={shippingInfo.lastName}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={shippingInfo.email}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                name="street"
                value={shippingInfo.street}
                onChange={handleShippingChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Apartment/Suite (optional)</label>
              <input
                type="text"
                name="apartment"
                value={shippingInfo.apartment}
                onChange={handleShippingChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State/Province</label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingInfo.postalCode}
                  onChange={handleShippingChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                name="country"
                value={shippingInfo.country}
                onChange={handleShippingChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
            <div className="space-y-2 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={() => setPaymentMethod("stripe")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span>Stripe (Credit/Debit Card)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span>Razorpay</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLoading ? "Creating Order..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrder;