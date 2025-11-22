import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    universityId: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let user = null;
    
    if (credentials.universityId === 'admin' && credentials.password === 'admin') {
      user = {
        id: '1',
        name: 'System Administrator',
        role: 'admin',
        universityId: 'admin'
      };
    }
    else if (credentials.universityId === 'student' && credentials.password === 'student') {
      user = {
        id: '2',
        name: 'John Student',
        role: 'student',
        universityId: '20230001'
      };
    }
    else if (credentials.universityId === 'instructor' && credentials.password === 'instructor') {
      user = {
        id: '3',
        name: 'Dr. Sarah Johnson',
        role: 'instructor',
        universityId: 'PROF001'
      };
    } else {
      alert('Invalid credentials. Use admin/admin, student/student, or instructor/instructor');
      return;
    }
    
    onLogin(user);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>LIU Exam System</h2>
        <div className="system-title">Smart Exam & Room Scheduling Management</div>
        
        <div className="form-group">
          <label>University ID</label>
          <input
            type="text"
            name="universityId"
            value={credentials.universityId}
            onChange={handleChange}
            placeholder="Enter your university ID"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" className="login-btn">Sign In</button>
      </form>
    </div>
  );
};

export default Login;