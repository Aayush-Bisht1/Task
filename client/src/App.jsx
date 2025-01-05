import React, { useState, useEffect } from 'react';
import AuthPage from './pages/authPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<AuthPage />}/>
        <Route path='/dashboard' element={<Dashboard />}/>
      </Routes>
    </Router>
  )
}

export default App
