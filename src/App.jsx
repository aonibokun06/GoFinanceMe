import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NewRequestForm from './components/NewRequestForm';
import MyRequests from './components/MyRequests';
import AllRequests from './components/AllRequests';
import useAuth from './components/hooks/useAuth';
import './index.css'

const App = () => {
  const user = useAuth(); // Custom hook to check if the user is authenticated
  /*
  if (user === null) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }
*/
  if (!user) {
    return <Login />;
  }
  

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-request" element={<NewRequestForm />} />
          <Route path="/my-requests" element={<MyRequests />}></Route>
          <Route path="/all-requests" element={<AllRequests />}></Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;