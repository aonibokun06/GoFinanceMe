import React from 'react';
import PropTypes from 'prop-types';

const BorrowerDashboard = ({
  billAmount,
  dueDate,
  slices,
  fundingProgress,    // { funded, goal, percentage }
  activityFeed,       // [ { id, timestamp, message } ]
  onCreateRequest,
  onShareRequest,
  onEditStory
}) => (
  <div className="space-y-6">
    {/* Monthly Bill Summary */}
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Monthly Bill Summary</h2>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold">${billAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total due</p>
        </div>
        <div className="text-right">
          <p className="text-lg text-indigo-600">
            {Math.ceil((new Date(dueDate) - Date.now())/(1000*60*60*24))} days left
          </p>
          <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Pay Now
          </button>
        </div>
      </div>
    </div>

    {/* Slice Breakdown */}
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Slice Breakdown</h2>
      <ul className="space-y-4">
        {slices.map(slice => (
          <li key={slice.id} className="flex justify-between">
            <div>
              <p className="font-medium">{slice.lenderName}</p>
              <p className="text-sm text-gray-500">
                Principal: ${slice.principal.toLocaleString()} &bull; APR: {slice.apr}%
              </p>
            </div>
            <p className="text-sm font-semibold">
              ${slice.monthlyPayment.toLocaleString()}/mo
            </p>
          </li>
        ))}
      </ul>
    </div>

    {/* Funding Progress */}
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Funding Progress</h2>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-green-500 h-full"
          style={{ width: `${fundingProgress.percentage}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-gray-600">
        {fundingProgress.percentage}% funded &bull; $
        {fundingProgress.funded.toLocaleString()} of $
        {fundingProgress.goal.toLocaleString()}
      </p>
      {fundingProgress.percentage < 50 && (
        <button className="mt-3 px-3 py-1 bg-yellow-400 rounded">
          Boost My Ask
        </button>
      )}
    </div>

    {/* Recent Activity Feed */}
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <ul className="space-y-2 text-sm text-gray-700">
        {activityFeed.map(item => (
          <li key={item.id}>
            <span className="font-medium">
              {new Date(item.timestamp).toLocaleString()}:
            </span>{' '}
            {item.message}
          </li>
        ))}
      </ul>
    </div>

    {/* Quick Actions */}
    <div className="flex space-x-4">
      <button onClick={onCreateRequest} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded">
        Post New Request
      </button>
      <button onClick={onEditStory} className="flex-1 px-4 py-2 bg-gray-200 rounded">
        Edit Story
      </button>
      <button onClick={onShareRequest} className="flex-1 px-4 py-2 bg-gray-200 rounded">
        Share Request
      </button>
    </div>
  </div>
);

BorrowerDashboard.propTypes = {
  billAmount: PropTypes.number.isRequired,
  dueDate: PropTypes.string.isRequired,
  slices: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    lenderName: PropTypes.string,
    principal: PropTypes.number,
    apr: PropTypes.number,
    monthlyPayment: PropTypes.number
  })).isRequired,
  fundingProgress: PropTypes.shape({
    funded: PropTypes.number,
    goal: PropTypes.number,
    percentage: PropTypes.number
  }).isRequired,
  activityFeed: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    timestamp: PropTypes.string,
    message: PropTypes.string
  })).isRequired,
  onCreateRequest: PropTypes.func,
  onShareRequest: PropTypes.func,
  onEditStory: PropTypes.func
};

export default BorrowerDashboard;