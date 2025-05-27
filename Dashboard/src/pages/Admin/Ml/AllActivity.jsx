import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllPetsActivityTrendsQuery, useRefreshAllPetsActivityTrendsMutation } from '../../../redux/api/activityApislice';
import { format } from 'date-fns';
import { RefreshCw, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

const AllActivity = () => {
  const navigate = useNavigate();
  const [expandedPet, setExpandedPet] = useState(null);
  const [daysToAnalyze, setDaysToAnalyze] = useState(7);
  const [resolution, setResolution] = useState('daily');

  // Fetch all pets activity data
  const { 
    data: allPetsActivity, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetAllPetsActivityTrendsQuery({ days: daysToAnalyze, resolution });

  // Refresh data mutation
  const [refreshData, { isLoading: isRefreshing }] = useRefreshAllPetsActivityTrendsMutation();

  // Toggle expanded pet details
  const toggleExpandPet = (petId) => {
    setExpandedPet(expandedPet === petId ? null : petId);
  };

  // Navigate to specific pet activity page
  const navigateToSpecificPet = (petId) => {
    navigate(`/activity/${petId}`);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      await refreshData({ days: daysToAnalyze, resolution }).unwrap();
      toast.success('Activity data refreshed successfully!');
    } catch (err) {
      console.error('Failed to refresh activity data:', err);
      const errorMessage = err.data?.message || err.error || 'Unknown error occurred';
      toast.error(`Failed to refresh data: ${errorMessage}`);
    }
  };

  // Format activity level with appropriate styling
  const getActivityLevelStyle = (level) => {
    switch (level) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-blue-100 text-blue-800';
      case 'low':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Format percentage change with appropriate styling
  const getPercentageChangeStyle = (change) => {
    if (!change || isNaN(change)) return '';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  // Get formatted percentage change string
  const getPercentageChangeString = (change) => {
    if (!change || isNaN(change)) return 'N/A';
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  // Loading state
  if (isLoading) {
    return <div className="p-4 text-center">Loading activity data...</div>;
  }

  // Error state
  if (isError) {
    return (
      <div className="p-4 text-red-500 text-center">
        Error loading activity data: {error?.message || 'Unknown error'}
        <button 
          onClick={refetch} 
          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Extract pets data from response
  const petsData = allPetsActivity?.data || [];

  // No data found
  if (petsData.length === 0) {
    return <div className="p-4 text-center">No activity data found for any pets</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Pets Activity</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label htmlFor="days" className="mr-2 text-sm font-medium">Days:</label>
            <select
              id="days"
              value={daysToAnalyze}
              onChange={(e) => setDaysToAnalyze(Number(e.target.value))}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="resolution" className="mr-2 text-sm font-medium">Resolution:</label>
            <select
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="hourly">Hourly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Average</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {petsData.map((petData, index) => {
                // Access nested data structure
                const activityData = petData?.activity?.data;
                
                return (
                  <React.Fragment key={petData.petId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{petData.petId}</div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {activityData?.activityLevel && (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActivityLevelStyle(activityData.activityLevel)}`}>
                            {activityData.activityLevel}
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {activityData?.currentPeriodAverage ? activityData.currentPeriodAverage.toFixed(1) : 'N/A'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getPercentageChangeStyle(activityData?.percentageChange)}`}>
                          {getPercentageChangeString(activityData?.percentageChange)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs">
                          {activityData?.summaryMessage || 'No summary available'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          {/* View Details button (expands in the current table) */}
                          <button
                            onClick={() => toggleExpandPet(petData.petId)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Expand details"
                          >
                            {expandedPet === petData.petId ? (
                              <>
                                <ChevronUp size={18} />
                              </>
                            ) : (
                              <>
                                <ChevronDown size={18} />
                              </>
                            )}
                          </button>
                          
                          {/* Navigate to detailed view with graphs */}
                          <button
                            onClick={() => navigateToSpecificPet(petData.petId)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View detailed activity charts"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedPet === petData.petId && activityData?.activityByDay && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <h3 className="font-medium text-gray-900 mb-2">Daily Activity Breakdown</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {activityData.activityByDay.map((dayData) => (
                                <div key={dayData.day} className="border rounded p-3 bg-white">
                                  <div className="font-medium">{format(new Date(dayData.timestamp), 'MMM dd, yyyy')}</div>
                                  <div className="text-gray-600">Average: {dayData.averageValue.toFixed(1)}</div>
                                  <div className="text-gray-600">Samples: {dayData.sampleCount}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllActivity;