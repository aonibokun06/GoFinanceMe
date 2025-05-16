// Dashboard.jsx
import React, { useState } from 'react'
import MyRequests from './MyRequests'
import AllRequests from './AllRequests'
import NewRequestForm from './NewRequestForm'
import { Pie } from 'react-chartjs-2';
import PaymentProgress from './PaymentProgress'
// import { ProgressCircle } from "@chakra-ui/react"

import Chart from 'chart.js/auto';
// import BorrowerDashboard from './BorrowerDashboard'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('myRequests')
  const user = useAuth()
  //need to create dashboard for user. Fancy modrn tailwind css Hello abdulah
  //define two types of views for the dashboard, lender or borrower
  //if lender, show all requests and allow them to fund requests
  //if borrower, show all requests and allow them to create requests
  //if borrower, show all requests and allow them to fund requests
  //if borrower, show all requests and allow them to create requests
  //if borrower, show all requests and allow them to fund requests
  //if borrower, show all requests and allow them to create requests
  //to detrmine if user is borrower or lender, check if user has any requests
  //if user is not borrower then is elnder

  //if the user has a borrows request, then they are a borrower
  // const isBorrower = user.requests.length !== 0
  // sample data for slice breakdown pie chart
  const sliceData = {
    labels: ['Amount', 'Funded So Far', 'Remaining'],
    datasets: [
      {
        data: [100, 30, 70], // replace with real values
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // primary blue
          'rgba(16, 185, 129, 0.7)',  // secondary green
          'rgba(245, 158, 11, 0.7)'   // accent yellow
        ],
      },
    ],
  };
  return (

    <div style={{ paddingTop: '120px' }}>
      <h1>Hello Abdullah</h1>
      <div id='bill-container'>
        <h2>Your monthly bill is $100</h2>
      </div>
      <div id='slice-breakdown' className="max-w-sm mx-auto">
        <Pie data={sliceData} />
      </div>
      <div id='progress-circle'>
        {/* <PaymentProgress /> */}
        5/8 months paid
      </div>

    </div>

  )

  return (
    <>
      <h1 className='text-black text-center'>Dashboard</h1>
      <div className='p-4'>
        <div className='flex justify-center gap-4 mb-4'>
          {/* <Link to='/my-requests'> */}
          <button
            onClick={() => setActiveTab('myRequests')}
            className={`px-4 py-2 rounded ${activeTab === 'myRequests'
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
            className={`px-4 py-2 rounded ${activeTab === 'allRequests'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
              }`}
          >
            All Requests
          </button>
          {/* </Link> */}
          {/* <Link to='/new-request'> */}
          <button
            className={`px-4 py-2 rounded ${activeTab === 'newRequest'
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
      <div id='dashboard-content'>
        {/* {isBorrower ? <BorrowerDashboard /> : <LenderDashboard />} */}
      </div>
    </>
  )
}

export default Dashboard;
