import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetActivityTrendsQuery, useRefreshActivityTrendsMutation } from '../../../redux/api/activityApislice';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from 'date-fns';
import { Activity, ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';

const SpecificActivity = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [daysToAnalyze, setDaysToAnalyze] = useState(7);
  const [resolution, setResolution] = useState('daily');

  // Fetch specific pet activity data
  const { 
    data: activityData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetActivityTrendsQuery({ petId, days: daysToAnalyze, resolution });

  // Refresh data mutation
  const [refreshData, { isLoading: isRefreshing }] = useRefreshActivityTrendsMutation();

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      await refreshData({ petId, days: daysToAnalyze, resolution }).unwrap();
      toast.success('Activity data refreshed successfully!');
    } catch (err) {
      console.error('Failed to refresh activity data:', err);
      const errorMessage = err.data?.message || err.error || 'Unknown error occurred';
      toast.error(`Failed to refresh data: ${errorMessage}`);
    }
  };

  // Transform data for chart
  const chartData = activityData?.activityByDay?.map(day => ({
    date: format(new Date(day.timestamp), 'MMM dd'),
    value: day.averageValue,
    samples: day.sampleCount
  })) || [];

  // Get activity level color
  const getActivityLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'text-green-500 dark:text-green-600';
      case 'moderate':
        return 'text-blue-500 dark:text-blue-600';
      case 'low':
        return 'text-yellow-500 dark:text-yellow-600';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  // Get trend direction
  const getTrendIcon = (change) => {
    if (!change || isNaN(change)) return null;
    return change > 0 ? 
      <TrendingUp size={18} className="text-green-500 dark:text-green-600" /> : 
      <TrendingDown size={18} className="text-red-500 dark:text-red-600" />;
  };

  // Get trend color
  const getTrendColor = (change) => {
    if (!change || isNaN(change)) return '';
    return change > 0 ? 
      'border-green-500 text-green-500 dark:border-green-600 dark:text-green-600' : 
      'border-red-500 text-red-500 dark:border-red-600 dark:text-red-600';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">Loading activity data...</div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <p>Error loading activity data: {error?.message || 'Unknown error'}</p>
          <button 
            onClick={refetch} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <button 
          onClick={() => navigate('/ml/activity/${petId}')}
          className="mr-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Pet Activity Details</h1>
        
        <div className="ml-auto flex items-center space-x-4">
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Activity Level Card */}
        <div className="card shadow-md rounded-lg overflow-hidden">
          <div className="card-header p-4 flex items-center">
            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
              <Activity size={26} />
            </div>
            <p className="card-title ml-3 font-semibold">Activity Level</p>
          </div>
          <div className="card-body p-4 bg-slate-100 transition-colors dark:bg-slate-950">
            <p className={`text-3xl font-bold ${getActivityLevelColor(activityData?.activityLevel)}`}>
              {activityData?.activityLevel || 'N/A'}
            </p>
            {activityData?.activityLevel && (
              <span className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Pet ID: {petId}
              </span>
            )}
          </div>
        </div>
        
        {/* Current Average Card */}
        <div className="card shadow-md rounded-lg overflow-hidden">
          <div className="card-header p-4 flex items-center">
            <div className="w-fit rounded-lg bg-green-500/20 p-2 text-green-500 transition-colors dark:bg-green-600/20 dark:text-green-600">
              <Activity size={26} />
            </div>
            <p className="card-title ml-3 font-semibold">Current Average</p>
          </div>
          <div className="card-body p-4 bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
              {activityData?.currentPeriodAverage ? activityData.currentPeriodAverage.toFixed(1) : 'N/A'}
            </p>
            {activityData?.percentageChange && (
              <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium mt-2 ${getTrendColor(activityData.percentageChange)}`}>
                {getTrendIcon(activityData.percentageChange)}
                {activityData.percentageChange > 0 ? '+' : ''}{activityData.percentageChange.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        
        {/* Previous Average Card */}
        <div className="card shadow-md rounded-lg overflow-hidden">
          <div className="card-header p-4 flex items-center">
            <div className="w-fit rounded-lg bg-purple-500/20 p-2 text-purple-500 transition-colors dark:bg-purple-600/20 dark:text-purple-600">
              <Activity size={26} />
            </div>
            <p className="card-title ml-3 font-semibold">Previous Average</p>
          </div>
          <div className="card-body p-4 bg-slate-100 transition-colors dark:bg-slate-950">
            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
              {activityData?.previousPeriodAverage ? activityData.previousPeriodAverage.toFixed(1) : 'N/A'}
            </p>
            <span className="mt-2 inline-block text-sm text-gray-500">
              Comparison period
            </span>
          </div>
        </div>
      </div>
      
      {/* Activity Graph */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Activity Trend</h2>
        
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No chart data available</div>
        )}
      </div>
      
      {/* Summary Message */}
      {activityData?.summaryMessage && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2">Activity Summary</h2>
          <p className="text-gray-700">{activityData.summaryMessage}</p>
        </div>
      )}
    </div>
  );
};

export default SpecificActivity;