import React from 'react';
import { useParams } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { useGetActivityTrendsQuery } from '../../../redux/api/activityApislice';
import { TrendingUp, AlertCircle, Loader2 } from "lucide-react";

const Activity = () => {
    const { petId } = useParams(); // Get petId from URL
    const { theme } = useTheme();
    
    // Only run query if petId exists
    const { 
        data: apiResponse, 
        isLoading, 
        isError, 
        error 
    } = useGetActivityTrendsQuery(petId ? { petId } : null, {
        skip: !petId // Skip query if petId is missing
    });

    // Early return if no petId
    if (!petId) {
        return (
            <div className="card flex items-center justify-center p-8 text-red-500">
                <AlertCircle className="mr-2 h-8 w-8" />
                <span>Error: No pet ID found in URL</span>
            </div>
        );
    }

    // Validate and transform the data
    const { chartData, summary, metrics } = React.useMemo(() => {
        const defaultState = {
            chartData: [],
            summary: "No activity data available",
            metrics: {
                currentAverage: 'N/A',
                previousAverage: 'N/A',
                daysAnalyzed: 'N/A',
                percentageChange: null
            }
        };

        if (!apiResponse?.data?.data) return defaultState;

        try {
            const activityData = apiResponse.data.data;
            
            const chartData = activityData.activityByDay?.map(day => ({
                name: new Date(day.day).toLocaleDateString('en-US', { weekday: 'short' }),
                date: day.day,
                value: day.averageValue,
                count: day.sampleCount
            })) || [];

            const metrics = {
                currentAverage: activityData.currentPeriodAverage?.toFixed(1) || 'N/A',
                previousAverage: activityData.previousPeriodAverage?.toFixed(1) || 'N/A',
                daysAnalyzed: activityData.daysAnalyzed || 'N/A',
                percentageChange: activityData.percentageChange
            };

            return {
                chartData,
                summary: activityData.summaryMessage || defaultState.summary,
                metrics
            };
        } catch (e) {
            console.error('Data transformation error:', e);
            return defaultState;
        }
    }, [apiResponse]);

    if (isLoading) {
        return (
            <div className="card flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-500" />
                <span>Loading activity data...</span>
            </div>
        );
    }

    if (isError) {
        let errorMessage = 'Unknown error occurred';
        
        if (error?.status === 400) {
            errorMessage = 'Invalid request - please check the pet ID';
        } else if (error?.status === 404) {
            errorMessage = 'Pet not found or no activity data available';
        } else if (error?.data?.message) {
            errorMessage = error.data.message;
        } else if (error?.message) {
            errorMessage = error.message;
        }

        return (
            <div className="card flex flex-col items-center p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Error loading activity data</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {errorMessage}
                </p>
                <p className="text-xs text-slate-500 mb-2">
                    Status: {error?.status || 'Unknown'} | Pet ID: {petId}
                </p>
                <button 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-4">
            {/* Summary Card */}
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Activity Overview</p>
                </div>
                <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                    <p className="text-lg font-medium text-slate-900 transition-colors dark:text-slate-50">
                        {summary}
                    </p>
                    {metrics.percentageChange !== null && !isNaN(metrics.percentageChange) && (
                        <span className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium mt-2 ${
                            metrics.percentageChange >= 0 
                                ? 'border-green-500 text-green-500 dark:border-green-600 dark:text-green-600' 
                                : 'border-red-500 text-red-500 dark:border-red-600 dark:text-red-600'
                        }`}>
                            <TrendingUp size={18} className={metrics.percentageChange < 0 ? 'rotate-180' : ''} />
                            {Math.abs(metrics.percentageChange)}% {metrics.percentageChange > 0 ? 'increase' : 'decrease'}
                        </span>
                    )}
                </div>
            </div>

            {/* Activity Chart */}
            {chartData.length > 0 ? (
                <div className="card">
                    <div className="card-header">
                        <p className="card-title">Daily Activity Trends</p>
                    </div>
                    <div className="card-body p-0">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border bg-white p-4 shadow-lg dark:bg-slate-900">
                                                    <p className="font-medium">{label}</p>
                                                    <p className="text-sm">
                                                        <span className="text-blue-500">Activity: </span>
                                                        {payload[0].value}%
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="text-blue-500">Samples: </span>
                                                        {payload[0].payload.count}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {new Date(payload[0].payload.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <XAxis
                                    dataKey="name"
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickMargin={6}
                                />
                                <YAxis
                                    strokeWidth={0}
                                    stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                    tickMargin={6}
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#2563eb"
                                    fillOpacity={1}
                                    fill="url(#colorActivity)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="card flex items-center justify-center p-8">
                    <AlertCircle className="h-8 w-8 text-yellow-500 mr-2" />
                    <span>No chart data available</span>
                </div>
            )}

            {/* Metrics Card */}
            <div className="card">
                <div className="card-header">
                    <p className="card-title">Activity Metrics</p>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-y-2 rounded-lg bg-slate-100 p-4 transition-colors dark:bg-slate-900">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Average</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                {metrics.currentAverage}%
                            </p>
                        </div>
                        <div className="flex flex-col gap-y-2 rounded-lg bg-slate-100 p-4 transition-colors dark:bg-slate-900">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Previous Average</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                {metrics.previousAverage}%
                            </p>
                        </div>
                        <div className="flex flex-col gap-y-2 rounded-lg bg-slate-100 p-4 transition-colors dark:bg-slate-900">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Days Analyzed</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                {metrics.daysAnalyzed}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Activity;