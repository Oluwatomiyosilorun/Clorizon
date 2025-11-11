import React, { useState } from "react";

export default function AnalyticsSummaryWidget({ dispatch }) {
  const [data, setData] = useState({
    users: '12,500',
    sales: '$89,000',
    conversion: '4.2%'
  });
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      const newUsers = Math.floor(Math.random() * 5000 + 10000).toLocaleString();
      const newSales = `$${(Math.random() * 50000 + 70000).toFixed(0).toLocaleString()}`;
      const newConversion = `${(Math.random() * 2 + 3).toFixed(1)}%`;

      setData({
        users: newUsers,
        sales: newSales,
        conversion: newConversion,
      });
      setLoading(false);
      
      // Inter-Widget Communication: Broadcast a data refresh event
      dispatch({ type: 'REFRESH_ANALYTICS' });
    }, 1500); // 1.5 second delay
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-xl h-full flex flex-col border border-indigo-200 min-h-0 max-h-70">
      <h3 className="text-xl font-bold mb-3 text-indigo-700 flex-shrink-0">Analytics Summary</h3>
      
      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-500">Fetching new metrics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 flex-grow">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="p-4 border-l-4 border-indigo-400 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500 capitalize">{key}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      <button
        className="mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 flex-shrink-0"
        onClick={refreshData}
        disabled={loading}
      >
        Refresh Data
      </button>
      <p className="text-xs text-center text-gray-400 mt-2 flex-shrink-0">Triggers inter-widget update for Chat.</p>
    </div>
  );
};
