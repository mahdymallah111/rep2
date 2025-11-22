import React, { useState } from 'react';
import ManageCourses from './ManageCourses';
import ManageInstructors from './ManageInstructors';
import ManageStudents from './ManageStudents';
import ScheduleExams from './ScheduleExams';
import ConflictReport from './ConflictReport';
import ManageRooms from './ManageRooms';

const AdminDashboard = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'courses': return <ManageCourses />;
      case 'instructors': return <ManageInstructors />;
      case 'students': return <ManageStudents />;
      case 'schedule': return <ScheduleExams />;
      case 'conflicts': return <ConflictReport />;
      case 'rooms': return <ManageRooms />;

      default:
        return (
          <div>
            <h1 className="page-header">Hi, {user.name} 👋</h1>
            <p className="page-subtitle">Choose an action below:</p>

            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="action-buttons-grid">
                  <button className="btn btn-primary action-btn" onClick={() => setActivePage('schedule')}>
                    📅 Schedule Exam
                  </button>

                  <button className="btn btn-secondary action-btn" onClick={() => setActivePage('courses')}>
                    📚 Manage Courses
                  </button>

                  <button className="btn btn-secondary action-btn" onClick={() => setActivePage('instructors')}>
                    👨‍🏫 Manage Faculty
                  </button>

                  <button className="btn btn-secondary action-btn" onClick={() => setActivePage('students')}>
                    👥 Manage Students
                  </button>

                  <button className="btn btn-secondary action-btn" onClick={() => setActivePage('rooms')}>
                    🏫 Manage Rooms
                  </button>

                  <button className="btn btn-warning action-btn" onClick={() => setActivePage('conflicts')}>
                    ⚠️ Conflict Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>LIU Exam System</h3>
          <div className="user-info">{user.name}</div>
          <div className="user-role">Administrator</div>
        </div>

        <ul className="sidebar-nav">
          <li>
            <a className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('dashboard')}>
              📊 Dashboard
            </a>
          </li>
          <li><a className={`nav-link ${activePage === 'courses' ? 'active' : ''}`} onClick={() => setActivePage('courses')}>📚 Courses</a></li>
          <li><a className={`nav-link ${activePage === 'instructors' ? 'active' : ''}`} onClick={() => setActivePage('instructors')}>👨‍🏫 Faculty</a></li>
          <li><a className={`nav-link ${activePage === 'students' ? 'active' : ''}`} onClick={() => setActivePage('students')}>👥 Students</a></li>
          <li><a className={`nav-link ${activePage === 'rooms' ? 'active' : ''}`} onClick={() => setActivePage('rooms')}>🏫 Rooms</a></li>
          <li><a className={`nav-link ${activePage === 'schedule' ? 'active' : ''}`} onClick={() => setActivePage('schedule')}>📅 Schedule Exams</a></li>
          <li><a className={`nav-link ${activePage === 'conflicts' ? 'active' : ''}`} onClick={() => setActivePage('conflicts')}>⚠️ Conflict Report</a></li>

          <li className="nav-divider"><hr /></li>

          <li>
            <a className="nav-link logout-link" onClick={onLogout}>
              🚪 Sign Out
            </a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;