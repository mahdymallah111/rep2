import React, { useState, useMemo, useEffect } from 'react';
import { DataManager } from '../utils/dataPersistence';

const ConflictReport = () => {
  const [activeTab, setActiveTab] = useState('room');
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const loadedExams = DataManager.getExams();
    const loadedCourses = DataManager.getCourses();
    const loadedInstructors = DataManager.getInstructors();
    const loadedRooms = DataManager.getRooms();
    const loadedStudents = DataManager.getStudents();
    
    setExams(loadedExams);
    setCourses(loadedCourses);
    setInstructors(loadedInstructors);
    setRooms(loadedRooms);
    setStudents(loadedStudents);
  }, []);

  const conflicts = useMemo(() => {
    const roomConflicts = [];
    const instructorConflicts = [];
    const studentConflicts = [];

    // Room Conflicts: Multiple exams in same room at same time WITH SAME SEAT COLOR
    exams.forEach((exam, index) => {
      exams.forEach((otherExam, otherIndex) => {
        if (index < otherIndex && // Avoid duplicate comparisons
            exam.date === otherExam.date && 
            exam.time === otherExam.time && 
            exam.room === otherExam.room &&
            exam.seatColor === otherExam.seatColor) { // FIXED: Only conflict if same seat color
          roomConflicts.push({
            type: 'room',
            conflictId: `${exam.id}-${otherExam.id}`,
            exam1: exam,
            exam2: otherExam,
            room: exam.room,
            seatColor: exam.seatColor,
            date: exam.date,
            time: exam.time,
            severity: 'high'
          });
        }
      });
    });

    // Instructor Conflicts: Same instructor scheduled for multiple exams at same time
    exams.forEach((exam, index) => {
      exams.forEach((otherExam, otherIndex) => {
        if (index < otherIndex && // Avoid duplicate comparisons
            exam.date === otherExam.date && 
            exam.time === otherExam.time && 
            exam.instructor === otherExam.instructor) {
          instructorConflicts.push({
            type: 'instructor',
            conflictId: `${exam.id}-${otherExam.id}`,
            exam1: exam,
            exam2: otherExam,
            instructor: exam.instructor,
            date: exam.date,
            time: exam.time,
            severity: 'high'
          });
        }
      });
    });

    // Student Conflicts: Students enrolled in multiple exams at same time
    students.forEach(student => {
      const studentExams = exams.filter(exam => 
        student.enrolledCourses.includes(exam.courseCode)
      );

      studentExams.forEach((exam, index) => {
        studentExams.forEach((otherExam, otherIndex) => {
          if (index < otherIndex && // Avoid duplicate comparisons
              exam.date === otherExam.date && 
              exam.time === otherExam.time) {
            
            // Check if this student conflict already exists
            const existingConflict = studentConflicts.find(conflict => 
              conflict.exam1.id === exam.id && 
              conflict.exam2.id === otherExam.id &&
              conflict.studentId === student.studentId
            );

            if (!existingConflict) {
              studentConflicts.push({
                type: 'student',
                conflictId: `${student.studentId}-${exam.id}-${otherExam.id}`,
                studentId: student.studentId,
                studentName: student.name,
                exam1: exam,
                exam2: otherExam,
                date: exam.date,
                time: exam.time,
                severity: 'medium'
              });
            }
          }
        });
      });
    });

    // Capacity Conflicts: Exams scheduled in rooms that are too small
    exams.forEach(exam => {
      const course = courses.find(c => c.code === exam.courseCode);
      const room = rooms.find(r => r.name === exam.room);
      
      if (course && room && course.enrolled > room.capacity) {
        roomConflicts.push({
          type: 'capacity',
          conflictId: `${exam.id}-capacity`,
          exam: exam,
          course: course,
          room: room,
          studentsEnrolled: course.enrolled,
          roomCapacity: room.capacity,
          date: exam.date,
          time: exam.time,
          severity: 'high'
        });
      }
    });

    return {
      room: roomConflicts,
      instructor: instructorConflicts,
      student: studentConflicts
    };
  }, [exams, courses, instructors, rooms, students]);

  const getConflictSeverityBadge = (severity) => {
    const severityConfig = {
      high: { class: 'status-danger', label: 'High', icon: '🔴' },
      medium: { class: 'status-warning', label: 'Medium', icon: '🟡' },
      low: { class: 'status-info', label: 'Low', icon: '🔵' }
    };
    
    const config = severityConfig[severity] || { class: 'status-upcoming', label: severity, icon: '⚪' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const renderRoomConflicts = () => {
    const roomConflicts = conflicts.room.filter(conflict => conflict.type === 'room');
    const capacityConflicts = conflicts.room.filter(conflict => conflict.type === 'capacity');

    return (
      <div>
        {roomConflicts.length > 0 && (
          <div className="conflict-section">
            <h4>Double-Booked Rooms</h4>
            {roomConflicts.map(conflict => (
              <div key={conflict.conflictId} className="conflict-item">
                <div className="conflict-header">
                  {getConflictSeverityBadge(conflict.severity)}
                  <strong>Room {conflict.room}</strong> - {conflict.date} at {conflict.time}
                </div>
                <div className="conflict-details">
                  <div>• Seat Color: <span className={`seat-color-badge seat-color-${conflict.seatColor.toLowerCase()}`}>{conflict.seatColor}</span></div>
                  <div>• {conflict.exam1.courseCode} - {conflict.exam1.course} ({conflict.exam1.instructor})</div>
                  <div>• {conflict.exam2.courseCode} - {conflict.exam2.course} ({conflict.exam2.instructor})</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {capacityConflicts.length > 0 && (
          <div className="conflict-section">
            <h4>Capacity Issues</h4>
            {capacityConflicts.map(conflict => (
              <div key={conflict.conflictId} className="conflict-item">
                <div className="conflict-header">
                  {getConflictSeverityBadge(conflict.severity)}
                  <strong>{conflict.exam.courseCode}</strong> - {conflict.date} at {conflict.time}
                </div>
                <div className="conflict-details">
                  <div>• Room: {conflict.room.name} (Capacity: {conflict.roomCapacity})</div>
                  <div>• Students Enrolled: {conflict.studentsEnrolled}</div>
                  <div className="text-danger">• <strong>Over capacity by {conflict.studentsEnrolled - conflict.roomCapacity} students</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {roomConflicts.length === 0 && capacityConflicts.length === 0 && (
          <div className="alert success">
            <h4>✅ No room conflicts detected!</h4>
            <p>All exams are properly scheduled without room overlaps or capacity issues.</p>
          </div>
        )}
      </div>
    );
  };

  const renderInstructorConflicts = () => {
    return (
      <div>
        {conflicts.instructor.length > 0 ? (
          conflicts.instructor.map(conflict => (
            <div key={conflict.conflictId} className="conflict-item">
              <div className="conflict-header">
                {getConflictSeverityBadge(conflict.severity)}
                <strong>{conflict.instructor}</strong> - {conflict.date} at {conflict.time}
              </div>
              <div className="conflict-details">
                <div>• {conflict.exam1.courseCode} - {conflict.exam1.course} (Room: {conflict.exam1.room})</div>
                <div>• {conflict.exam2.courseCode} - {conflict.exam2.course} (Room: {conflict.exam2.room})</div>
              </div>
            </div>
          ))
        ) : (
          <div className="alert success">
            <h4>✅ No instructor conflicts detected!</h4>
            <p>All instructors are scheduled without timing overlaps.</p>
          </div>
        )}
      </div>
    );
  };

  const renderStudentConflicts = () => {
    // Group student conflicts by student for better organization
    const conflictsByStudent = conflicts.student.reduce((acc, conflict) => {
      if (!acc[conflict.studentId]) {
        acc[conflict.studentId] = [];
      }
      acc[conflict.studentId].push(conflict);
      return acc;
    }, {});

    return (
      <div>
        {conflicts.student.length > 0 ? (
          Object.entries(conflictsByStudent).map(([studentId, studentConflicts]) => (
            <div key={studentId} className="conflict-item">
              <div className="conflict-header">
                {getConflictSeverityBadge('medium')}
                <strong>{studentConflicts[0].studentName}</strong> (ID: {studentId})
              </div>
              <div className="conflict-details">
                <div className="text-warning"><strong>Has {studentConflicts.length} exam conflict(s):</strong></div>
                {studentConflicts.map(conflict => (
                  <div key={conflict.conflictId} className="conflict-subitem">
                    <div>• {conflict.date} at {conflict.time}:</div>
                    <div>&nbsp;&nbsp;{conflict.exam1.courseCode} - {conflict.exam1.course} (Room: {conflict.exam1.room})</div>
                    <div>&nbsp;&nbsp;{conflict.exam2.courseCode} - {conflict.exam2.course} (Room: {conflict.exam2.room})</div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="alert success">
            <h4>✅ No student conflicts detected!</h4>
            <p>All students are scheduled without exam timing overlaps.</p>
          </div>
        )}
      </div>
    );
  };

  const getTotalConflicts = () => {
    return conflicts.room.length + conflicts.instructor.length + conflicts.student.length;
  };

  const getRoomConflictCount = () => conflicts.room.length;
  const getInstructorConflictCount = () => conflicts.instructor.length;
  const getStudentConflictCount = () => conflicts.student.length;

  return (
    <div>
      <h2 className="page-header">Conflict Report</h2>
      <p className="page-subtitle">Detected scheduling conflicts and issues</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{getTotalConflicts()}</div>
          <div className="stat-label">Total Conflicts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getRoomConflictCount()}</div>
          <div className="stat-label">Room Conflicts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getInstructorConflictCount()}</div>
          <div className="stat-label">Instructor Conflicts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getStudentConflictCount()}</div>
          <div className="stat-label">Student Conflicts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Detected Conflicts</h3>
          <div className="action-buttons">
            <button
              className={`btn btn-sm ${activeTab === 'room' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('room')}
            >
              Room Conflicts ({getRoomConflictCount()})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'instructor' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('instructor')}
            >
              Instructor Conflicts ({getInstructorConflictCount()})
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('student')}
            >
              Student Conflicts ({getStudentConflictCount()})
            </button>
          </div>
        </div>
        <div className="card-body">
          {activeTab === 'room' && renderRoomConflicts()}
          {activeTab === 'instructor' && renderInstructorConflicts()}
          {activeTab === 'student' && renderStudentConflicts()}
        </div>
      </div>

      {getTotalConflicts() > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Conflict Resolution</h3>
          </div>
          <div className="card-body">
            <div className="alert warning">
              <h4>⚠️ Resolution Recommendations</h4>
              <ul>
                <li><strong>Room Conflicts:</strong> Reschedule one of the exams to a different time slot or assign different seat colors</li>
                <li><strong>Instructor Conflicts:</strong> Assign a different proctor or reschedule the exam</li>
                <li><strong>Student Conflicts:</strong> Consider creating a makeup exam or adjusting student enrollment</li>
                <li><strong>Capacity Issues:</strong> Move the exam to a larger room or split into multiple sessions</li>
              </ul>
              <p>Use the Exam Scheduling page to make the necessary adjustments.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConflictReport;