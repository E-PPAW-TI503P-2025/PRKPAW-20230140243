import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';

function App() {
  return (
    <Router>
      <div>
        
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<LoginPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}
export default App;
