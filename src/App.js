import React, { useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderDashboard = () => {
    if (!currentUser) return <Login onLogin={handleLogin} />;
    
    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
      case 'student':
        return <StudentDashboard user={currentUser} onLogout={handleLogout} />;
      case 'instructor':
        return <InstructorDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="App">
      {renderDashboard()}
    </div>
  );
}

export default App;