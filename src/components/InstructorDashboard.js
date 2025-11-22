import React, { useState } from 'react';

const InstructorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const instructorData = {
    fullName: 'Dr. Sarah Johnson',
    department: 'Computer Science',
    employeeId: 'PROF001',
    assignedExams: [
      { 
        id: 1, 
        course: 'Advanced Physics', 
        code: 'PHY301',
        date: '2024-01-18', 
        time: '11:00 AM', 
        duration: 3,
        room: 'Room C-301', 
        building: 'Main Building',
        seatColor: 'Yellow',
        status: 'upcoming',
        students: 25
      }
    ]
  };

  const stats = {
    totalExams: instructorData.assignedExams.length,
    upcomingExams: instructorData.assignedExams.length,
    availableDays: 5
  };

  const getStatusBadge = (status) => {
    return <span className={`status-badge ${status === 'upcoming' ? 'status-upcoming' : 'status-active'}`}>
      {status}
    </span>;
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Faculty Portal</h3>
          <div className="user-info">{user.name}</div>
          <div className="user-info">{instructorData.department} • {instructorData.employeeId}</div>
        </div>
        
        <ul className="sidebar-nav">
          <li>
            <a className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
               onClick={() => setActiveTab('dashboard')}>
              📊 Dashboard
            </a>
          </li>
          <li>
            <a className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`} 
               onClick={() => setActiveTab('schedule')}>
              📅 Exam Schedule
            </a>
          </li>
          <li>
            <a className="nav-link" onClick={onLogout}>
              🚪 Sign Out
            </a>
          </li>
        </ul>
      </div>
      
      <div className="main-content">
        <h2 className="page-header">Welcome, {instructorData.fullName}</h2>
        
        {activeTab === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalExams}</div>
                <div className="stat-label">Total Exams</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.upcomingExams}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.availableDays}</div>
                <div className="stat-label">Available Days</div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Upcoming Exams</h3>
              </div>
              <div className="card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Date & Time</th>
                      <th>Room</th>
                      <th>Students</th>
                      <th>Seat Color</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructorData.assignedExams.map(exam => (
                      <tr key={exam.id}>
                        <td>
                          <strong>{exam.code}</strong>
                          <div>{exam.course}</div>
                        </td>
                        <td>
                          <div>{exam.date}</div>
                          <div>{exam.time}</div>
                        </td>
                        <td>{exam.room}</td>
                        <td>{exam.students}</td>
                        <td>
                          <span className={`seat-color-badge seat-color-${exam.seatColor.toLowerCase()}`}>
                            {exam.seatColor}
                          </span>
                        </td>
                        <td>{getStatusBadge(exam.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <h3 className="page-header">My Exam Schedule</h3>
            <div className="card">
              <div className="card-header">
                <h4>All Assigned Exams</h4>
              </div>
              <div className="card-body">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Room</th>
                      <th>Duration</th>
                      <th>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instructorData.assignedExams.map(exam => (
                      <tr key={exam.id}>
                        <td>
                          <strong>{exam.code}</strong><br/>
                          <span>{exam.course}</span>
                        </td>
                        <td>{exam.date}</td>
                        <td>{exam.time}</td>
                        <td>{exam.room}</td>
                        <td>{exam.duration}h</td>
                        <td>{exam.students}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;