import React, { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const fetchUser = async () => {
    try {
      const response = await axios.get("https://frs-task.onrender.com/api/auth/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(response.data.user);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchUser();  
  },[]);
  return (
    <Router>
      <Routes>
        <Route path='/' element={user ? <Dashboard /> : <AuthPage />}/>
        <Route path='/dashboard' element={user ? <Dashboard />: <AuthPage />}/>
      </Routes>
    </Router>
  )
}

export default App
