import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useGetUserDetailsQuery, useProfileMutation } from '../redux/api/usersApiSlice';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { data: user, refetch } = useGetUserDetailsQuery();
  const [updateProfile] = useProfileMutation();
  const [isEdit, setIsEdit] = useState(false);
  
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: ''
    },
    gender: '',
    dob: ''
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setUserData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          line1: user.address?.line1 || '',
          line2: user.address?.line2 || ''
        },
        gender: user.gender || 'Male',
        dob: user.dob || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({
        username: userData.username,
        phone: userData.phone,
        address: userData.address,
        gender: userData.gender,
        dob: userData.dob
      }).unwrap();
      
      refetch(); // Refresh user data
      setIsEdit(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className='max-w-lg mx-auto p-6 flex flex-col gap-4 text-sm'>
      {/* Profile Picture */}
      <div className='flex items-center gap-6'>
        <img 
          className='w-24 h-24 rounded-full object-cover border-2 border-gray-200' 
          src={assets.profile_icon} 
          alt="Profile" 
        />
        {isEdit ? (
          <input
            className='bg-gray-50 text-2xl font-medium flex-1 border-b border-gray-300 focus:outline-none focus:border-primary'
            type="text"
            value={userData.username}
            onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
          />
        ) : (
          <h2 className='text-2xl font-medium'>{userData.username}</h2>
        )}
      </div>

      <hr className='my-2 border-gray-200' />

      {/* Contact Information */}
      <div>
        <p className='text-gray-500 uppercase text-xs font-medium mb-3'>Contact Information</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-4 text-gray-700'>
          <p className='font-medium'>Email:</p>
          <p className='text-blue-500'>{userData.email}</p>
          
          <p className='font-medium'>Phone:</p>
          {isEdit ? (
            <input
              className='bg-gray-50 border-b border-gray-300 focus:outline-none focus:border-primary'
              type="text"
              value={userData.phone}
              onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
            />
          ) : (
            <p>{userData.phone || 'Not provided'}</p>
          )}
          
          <p className='font-medium'>Address:</p>
          {isEdit ? (
            <div className='space-y-2'>
              <input
                className='w-full bg-gray-50 border-b border-gray-300 focus:outline-none focus:border-primary'
                type="text"
                value={userData.address.line1}
                onChange={(e) => setUserData(prev => ({
                  ...prev,
                  address: { ...prev.address, line1: e.target.value }
                }))}
                placeholder="Street address"
              />
              <input
                className='w-full bg-gray-50 border-b border-gray-300 focus:outline-none focus:border-primary'
                type="text"
                value={userData.address.line2}
                onChange={(e) => setUserData(prev => ({
                  ...prev,
                  address: { ...prev.address, line2: e.target.value }
                }))}
                placeholder="City, State, ZIP"
              />
            </div>
          ) : (
            <div>
              <p>{userData.address.line1 || 'Not provided'}</p>
              <p>{userData.address.line2 || ''}</p>
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <p className='text-gray-500 uppercase text-xs font-medium mb-3'>Basic Information</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-4 text-gray-700'>
          <p className='font-medium'>Gender:</p>
          {isEdit ? (
            <select
              className='bg-gray-50 border-b border-gray-300 focus:outline-none focus:border-primary'
              value={userData.gender}
              onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p>{userData.gender || 'Not specified'}</p>
          )}
          
          <p className='font-medium'>Birthday:</p>
          {isEdit ? (
            <input
              className='bg-gray-50 border-b border-gray-300 focus:outline-none focus:border-primary'
              type="date"
              value={userData.dob}
              onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))}
            />
          ) : (
            <p>{userData.dob || 'Not specified'}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='mt-8 flex gap-4'>
        {isEdit ? (
          <>
            <button
              className='border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-colors'
              onClick={handleSave}
            >
              Save Changes
            </button>
            <button
              className='border border-gray-400 text-gray-600 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors'
              onClick={() => setIsEdit(false)}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className='border border-primary text-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-colors'
            onClick={() => setIsEdit(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;