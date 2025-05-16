// Dashboard.jsx
import React, { useState } from 'react'
import MyRequests from './MyRequests'
import AllRequests from './AllRequests'
import NewRequestForm from './NewRequestForm'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('myRequests')

  return (
    <>
      <h1 className='text-black text-center'>Dashboard</h1>
      <div className='p-4'>
        <div className='flex justify-center gap-4 mb-4'>
          {/* <Link to='/my-requests'> */}
          <button
            onClick={() => setActiveTab('myRequests')}
            className={`px-4 py-2 rounded ${
              activeTab === 'myRequests'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            My Requests
          </button>
          {/* </Link> */}


          {/* <Link to='/all-requests'> */}
          <button
            onClick={() => setActiveTab('allRequests')}
            className={`px-4 py-2 rounded ${
              activeTab === 'allRequests'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            All Requests
          </button>
          {/* </Link> */}
          {/* <Link to='/new-request'> */}
          <button 
          className={`px-4 py-2 rounded ${
            activeTab === 'newRequest'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('newRequest')}>
            New Request
          </button>
          {/* </Link> */}
        </div>
        {activeTab === 'newRequest' ? <NewRequestForm /> : activeTab === 'myRequests' ? <MyRequests /> : <AllRequests />}
      </div>
    </>
  )
}

export default Dashboard
