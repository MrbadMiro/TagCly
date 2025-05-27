import React from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotalCollar = ({ product }) => {
    const { currency, delivery_fee } = React.useContext(ShopContext);
    const subtotal = product?.price || 0;
    const total = subtotal + delivery_fee;

    return (
        <div className='w-full'>
            <div className='text-2xl'>
                <Title text1={'ORDER'} text2={'SUMMARY'} />
            </div>
            <div className='flex flex-col gap-2 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Product</p>
                    <p>{product?.name}</p>
                </div>
                <div className='flex justify-between'>
                    <p>Price</p>
                    <p>{currency}{subtotal.toFixed(2)}</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <p>Shipping Fee</p>
                    <p>{currency}{delivery_fee}.00</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <b>Total</b>
                    <b>{currency}{total.toFixed(2)}</b>
                </div>
            </div>
        </div>
    );
};

export default CartTotalCollar;