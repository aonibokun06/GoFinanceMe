import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import Login from './components/Login'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import RequestWizardStep1 from './pages/RequestWizardStep1'
import RequestWizardStep2 from './pages/RequestWizardStep2'
import DashboardPage from './pages/DashboardPage'
import RequestsListPage from './pages/RequestsListPage'
import RequestDetailPage from './pages/RequestDetailPage'
import ManageRequestOffersPage from './pages/ManageRequestOffersPage'
import TransactionsPage from './pages/TransactionsPage'
import SettingsPage from './pages/SettingsPage'
import useAuth from './hooks/useAuth'
import Header from './components/Header'
const App = () => {
  const user = useAuth() // Custom hook to check if the user is authenticated
  /*
  if (user === null) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }
*/
  // if (!user) {
  //   return <Login></Login>
  // }
  function handleLogout() {
    // setUser(null)
  }
  return (
    <Router>
      <div className='min-h-screen bg-gray-100'>
        <Header user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto">

          <Routes>
            <Route path='/' element={<DashboardPage />} />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/request' element={<RequestWizardStep1 />} />
            <Route path='/request/details' element={<RequestWizardStep2 />} />
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/requests' element={<RequestsListPage />} />
            <Route path='/requests/:requestId' element={<RequestDetailPage />} />
            <Route path='/request/offers/:requestId' element={<ManageRequestOffersPage />} />
            <Route path='/transactions' element={<TransactionsPage />} />
            <Route path='/settings' element={<SettingsPage />} />

          </Routes>
        </div>

      </div>
    </Router>
  )
}

export default App
