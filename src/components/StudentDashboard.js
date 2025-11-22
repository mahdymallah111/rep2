import React, { useState } from 'react';

const StudentDashboard = ({ user, onLogout }) => {
  const [showExamAlert, setShowExamAlert] = useState(false);

  const studentExams = [
    { 
      id: 1, 
      course: 'Introduction to Programming', 
      code: 'CSCI101',
      date: '2024-01-15', 
      startTime: '09:00', 
      endTime: '11:00', 
      room: 'A-101', 
      building: 'Main Building',
      seatColor: 'Green',
      status: 'upcoming'
    }
  ];

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h3>Student Portal</h3>
        <ul className="sidebar-nav">
          <li>
            <a className="nav-link active">📚 My Exams</a>
          </li>
          <li>
            <a className="nav-link" onClick={onLogout}>
              🚪 Logout
            </a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <h2 className="page-header">Welcome, {user.name}</h2>
        
        <div className="alert warning">
          <strong>Reminder:</strong> Always check your exam schedule 24 hours before the exam.
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Personal Exam Timetable</h3>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Room</th>
                  <th>Building</th>
                  <th>Seat Color</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {studentExams.map(exam => (
                  <tr key={exam.id}>
                    <td>
                      <strong>{exam.code}</strong><br/>
                      {exam.course}
                    </td>
                    <td>{exam.date}</td>
                    <td>{exam.startTime} - {exam.endTime}</td>
                    <td>{exam.room}</td>
                    <td>{exam.building}</td>
                    <td>
                      <span style={{ color: exam.seatColor.toLowerCase(), fontWeight: 'bold' }}>
                        {exam.seatColor}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge status-upcoming">
                        {exam.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <button 
              className="btn btn-primary"
              onClick={() => setShowExamAlert(true)}
            >
              Test Exam Alert
            </button>
          </div>
        </div>
      </div>

      {showExamAlert && (
        <div className="exam-alert">
          <div className="exam-alert-content">
            <h2>🚨 YOU HAVE AN EXAM RIGHT NOW!</h2>
            <div className="countdown">01:15:30</div>
            <p><strong>Course:</strong> CSCI101 - Introduction to Programming</p>
            <p><strong>Time:</strong> 09:00 AM - 11:00 AM</p>
            <p><strong>Room:</strong> A-101, Main Building</p>
            <p><strong>Seat Color:</strong> <span style={{color: 'green'}}>GREEN</span></p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowExamAlert(false)}
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;