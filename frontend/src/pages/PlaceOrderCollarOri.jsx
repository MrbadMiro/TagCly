import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateSingleCollarOrderMutation } from '../redux/api/orderApiSlice';
import Title from '../components/Title';
import CartTotalCollar from '../components/CartTotalCollar';
import { assets } from '../assets/assets';
import { toast } from 'react-toastify';

const PlaceOrderCollar = () => {
    const [method, setMethod] = useState('cod');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    });
    const navigate = useNavigate();
    const { state } = useLocation();
    const product = state?.product;
    const [createOrder, { isLoading }] = useCreateSingleCollarOrderMutation();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        // Debug product data
        console.log('Current product:', {
            id: product?._id,
            variant: product?.variant
        });

        // Validate product exists
        if (!product) {
            toast.error('No product selected. Please go back and try again.');
            return;
        }

        // Validate product ID
        if (!product._id) {
            toast.error('Product ID is missing. Please select a valid product.');
            return;
        }

        // Validate variant exists
        if (!product.variant || !product.variant._id) {
            toast.error('Please select a valid product variant.');
            return;
        }

        // Validate shipping info
        const requiredFields = {
            firstName: 'First Name',
            email: 'Email',
            phone: 'Phone',
            street: 'Street Address',
            city: 'City'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([field]) => !formData[field])
            .map(([_, name]) => name);

        if (missingFields.length > 0) {
            toast.error(`Missing required fields: ${missingFields.join(', ')}`);
            return;
        }

        try {
            const orderData = {
                productId: product._id,
                variantId: product.variant._id,
                paymentMethod: method,
                shippingInfo: {
                    ...formData,
                    // Ensure optional fields have default values
                    lastName: formData.lastName || '',
                    state: formData.state || '',
                    zipcode: formData.zipcode || '',
                    country: formData.country || ''
                }
            };

            const res = await createOrder(orderData).unwrap();
            toast.success('Order placed successfully!');
            navigate(`/orderscollar/${res._id}`);
        } catch (err) {
            console.error('Order error:', err);
            toast.error(err?.data?.message || 'Failed to place order. Please try again.');
        }
    };

    return (
        <div className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* Left side - Delivery Information */}
            <div className='flex flex-col  w-full sm:max-w-[400px]'>
                <div className='gap-4 w-full flex flex-col'>
                    <div className='text-xl sm:text-2xl my-3'>
                        <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                    </div>
                    <div className='flex gap-3'>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='First name*'
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='Last name'
                        />
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        placeholder='Email Address*'
                        required
                    />
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        placeholder='Street Address*'
                        required
                    />
                    <div className='flex gap-3'>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='City*'
                            required
                        />
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='State/Province'
                        />
                    </div>
                    <div className='flex gap-3'>
                        <input
                            type="text"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='Zip/Postal Code'
                        />
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='Country'
                        />
                    </div>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        placeholder='Phone Number*'
                        required
                    />
                </div>
                <div className='gap-4 w-full flex flex-col mt-8'>
                    <div className='text-xl sm:text-2xl my-3'>
                        <Title text1={'PET'} text2={'INFORMATION'} />
                    </div>
                    <div className='flex gap-3'>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='First name*'
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='Last name'
                        />
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        placeholder='Email Address*'
                        required
                    />
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        placeholder='Street Address*'
                        required
                    />
                    <div className='flex gap-3'>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='City*'
                            required
                        />
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='State/Province'
                        />
                    </div>
                    <div className='flex gap-3'>
                        <input
                            type="text"
                            name="zipcode"
                            value={formData.zipcode}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='Zip/Postal Code'
                        />
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                            placeholder='Country'
                        />
                    </div>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                        placeholder='Phone Number*'
                        required
                    />
                </div>
            </div>

            {/* Right side - Order Summary */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotalCollar product={product} />
                </div>
                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />

                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div
                            onClick={() => setMethod('stripe')}
                            className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'stripe' ? 'border-blue-500' : 'border-gray-300'
                                }`}
                        >
                            <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400 border-0' : 'border-gray-400'
                                }`}></div>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe" />
                        </div>
                        <div
                            onClick={() => setMethod('razorpy')}
                            className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'razorpy' ? 'border-blue-500' : 'border-gray-300'
                                }`}
                        >
                            <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpy' ? 'bg-green-400 border-0' : 'border-gray-400'
                                }`}></div>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="Razorpay" />
                        </div>
                        <div
                            onClick={() => setMethod('cod')}
                            className={`flex items-center gap-3 border p-2 px-3 cursor-pointer ${method === 'cod' ? 'border-blue-500' : 'border-gray-300'
                                }`}
                        >
                            <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400 border-0' : 'border-gray-400'
                                }`}></div>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isLoading}
                            className={`bg-black text-white px-16 py-3 text-sm ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
                                }`}
                        >
                            {isLoading ? 'Processing...' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderCollar;