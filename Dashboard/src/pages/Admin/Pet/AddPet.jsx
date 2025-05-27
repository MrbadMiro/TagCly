import React, { useState } from 'react';
import { useRegisterPetMutation } from '../../../redux/api/petApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const AddPet = () => {
  const [registerPet, { isLoading }] = useRegisterPetMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    gender: 'male',
    collarId: '',
    healthConditions: [],
    medications: [],
    vaccinations: [],
    activityLevel: 'moderate',
    trainingStatus: 'untrained',
    profileImage: ''
  });

  const [newHealthCondition, setNewHealthCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newVaccination, setNewVaccination] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddHealthCondition = () => {
    if (newHealthCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        healthConditions: [...prev.healthConditions, newHealthCondition.trim()]
      }));
      setNewHealthCondition('');
    }
  };

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const handleAddVaccination = () => {
    if (newVaccination.trim()) {
      setFormData(prev => ({
        ...prev,
        vaccinations: [...prev.vaccinations, newVaccination.trim()]
      }));
      setNewVaccination('');
    }
  };

  const handleRemoveItem = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '',
      age: '',
      weight: '',
      gender: 'male',
      collarId: '',
      healthConditions: [],
      medications: [],
      vaccinations: [],
      activityLevel: 'moderate',
      trainingStatus: 'untrained',
      profileImage: ''
    });
    setNewHealthCondition('');
    setNewMedication('');
    setNewVaccination('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const petData = {
        ...formData,
        ownerId: userInfo._id,
        age: Number(formData.age),
        weight: Number(formData.weight)
      };

      const res = await registerPet(petData).unwrap();
      toast.success('Pet registered successfully!');
      
      // Reset form for new entry instead of navigating away
      resetForm();
      
    } catch (err) {
      toast.error(err?.data?.error || 'Failed to register pet');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Register New Pet</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pet Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Breed*</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Age (years)*</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)*</label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Gender*</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Collar ID (optional)</label>
            <input
              type="text"
              name="collarId"
              value={formData.collarId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium mb-1">Activity Level</label>
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
        
        {/* Training Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Training Status</label>
          <select
            name="trainingStatus"
            value={formData.trainingStatus}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="untrained">Untrained</option>
            <option value="basic">Basic Training</option>
            <option value="advanced">Advanced Training</option>
          </select>
        </div>
        
        {/* Health Conditions */}
        <div>
          <label className="block text-sm font-medium mb-1">Health Conditions</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newHealthCondition}
              onChange={(e) => setNewHealthCondition(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Add health condition"
            />
            <button
              type="button"
              onClick={handleAddHealthCondition}
              className="px-4 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          {formData.healthConditions.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.healthConditions.map((condition, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{condition}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('healthConditions', index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Medications */}
        <div>
          <label className="block text-sm font-medium mb-1">Medications</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Add medication"
            />
            <button
              type="button"
              onClick={handleAddMedication}
              className="px-4 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          {formData.medications.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.medications.map((med, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{med}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('medications', index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Vaccinations */}
        <div>
          <label className="block text-sm font-medium mb-1">Vaccinations</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newVaccination}
              onChange={(e) => setNewVaccination(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Add vaccination"
            />
            <button
              type="button"
              onClick={handleAddVaccination}
              className="px-4 bg-blue-500 text-white rounded"
            >
              Add
            </button>
          </div>
          {formData.vaccinations.length > 0 && (
            <div className="mt-2 space-y-1">
              {formData.vaccinations.map((vac, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span>{vac}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem('vaccinations', index)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium mb-1">Profile Image URL</label>
          <input
            type="text"
            name="profileImage"
            value={formData.profileImage}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/pet-image.jpg"
          />
        </div>
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Registering...' : 'Register Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPet;