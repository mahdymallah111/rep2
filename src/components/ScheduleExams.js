import React, { useState, useEffect } from 'react';
import { DataManager } from '../utils/dataPersistence';

const ScheduleExams = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);

  const [schedulingConfig, setSchedulingConfig] = useState({
    semesterStart: '2024-10-01',
    midtermStartWeek: 7,
    finalStartWeek: 16,
    finalStartDate: '2025-01-16',
    examDuration: 2,
    examType: 'midterm'
  });

  const [schedulingProgress, setSchedulingProgress] = useState({
    isScheduling: false,
    currentStep: '',
    progress: 0
  });

  useEffect(() => {
    setCourses(DataManager.getCourses());
    setInstructors(DataManager.getInstructors());
    setRooms(DataManager.getRooms());
    setExams(DataManager.getExams());
    setStudents(DataManager.getStudents());
  }, []);

  // Calculate exam dates based on semester start and week number
  const calculateExamDate = (weekNumber, dayOfWeek) => {
    const startDate = new Date(schedulingConfig.semesterStart);
    const examDate = new Date(startDate);
    const daysToAdd = (weekNumber - 1) * 7 + dayOfWeek;
    examDate.setDate(startDate.getDate() + daysToAdd);
    return examDate.toISOString().split('T')[0];
  };

  // Get available time slots based on exam type
  const getTimeSlots = (examType) => {
    if (examType === 'midterm') {
      return [
        { value: '08:00 - 10:00', label: 'Friday 8:00-10:00' },
        { value: '10:00 - 12:00', label: 'Friday 10:00-12:00' },
        { value: '12:00 - 14:00', label: 'Friday 12:00-14:00' },
        { value: '08:00 - 10:00', label: 'Saturday 8:00-10:00' },
        { value: '10:00 - 12:00', label: 'Saturday 10:00-12:00' },
        { value: '12:00 - 14:00', label: 'Saturday 12:00-14:00' }
      ];
    } else {
      return [
        { value: '08:00 - 10:00', label: 'Mon-Thu 8:00-10:00' },
        { value: '10:00 - 12:00', label: 'Mon-Thu 10:00-12:00' },
        { value: '12:00 - 14:00', label: 'Mon-Thu 12:00-14:00' },
        { value: '14:00 - 16:00', label: 'Mon-Thu 14:00-16:00' }
      ];
    }
  };

  // Group courses by year level
  const groupCoursesByLevel = (courses) => {
    const getLevelFromCode = (code) => {
      if (!code) return 100;
      const numbers = code.match(/\d+/g);
      if (!numbers || numbers.length === 0) return 100;
      const courseNumber = parseInt(numbers[0]);
      if (courseNumber >= 400) return 400;
      if (courseNumber >= 300) return 300;
      if (courseNumber >= 200) return 200;
      return 100;
    };

    const grouped = { 100: [], 200: [], 300: [], 400: [] };
    courses.forEach(course => {
      const level = getLevelFromCode(course.code);
      if (grouped[level]) {
        grouped[level].push(course);
      }
    });
    return grouped;
  };

  // Check if students have conflicts
  const hasStudentConflicts = (courseCode, date, timeSlot) => {
    const studentsInCourse = students.filter(student => 
      student.enrolledCourses.includes(courseCode)
    );
    for (const student of studentsInCourse) {
      const conflictingExams = exams.filter(exam => 
        student.enrolledCourses.includes(exam.courseCode) &&
        exam.date === date &&
        exam.time === timeSlot
      );
      if (conflictingExams.length > 0) {
        return true;
      }
    }
    return false;
  };

  // FIXED: Enhanced room assignment with proper seat color conflict detection
  const assignRoomAndSeatColor = (course, date, timeSlot, courseLevel, newExams) => {
    const availableRooms = rooms.filter(room => 
      room.status === 'available' &&
      room.capacity >= course.enrolled
    );

    // Strategy 1: Try rooms with exact capacity first
    const exactCapacityRooms = availableRooms.filter(room => 
      room.capacity >= course.enrolled && room.capacity <= course.enrolled + 10
    );
    
    // Strategy 2: Then try larger rooms
    const largerRooms = availableRooms.filter(room => 
      room.capacity > course.enrolled + 10
    );

    // Combine strategies
    const roomStrategies = [...exactCapacityRooms, ...largerRooms];

    for (const room of roomStrategies) {
      // Get exams already scheduled in this room at this time (both existing and new)
      const existingExamsInRoom = exams.filter(exam => 
        exam.room === room.name &&
        exam.date === date &&
        exam.time === timeSlot
      );

      // Also check exams that are being scheduled in this batch
      const newExamsInRoom = newExams.filter(exam => 
        exam.room === room.name &&
        exam.date === date &&
        exam.time === timeSlot
      );

      const allExamsInRoom = [...existingExamsInRoom, ...newExamsInRoom];

      // Check if room has available seat colors
      const assignedColors = allExamsInRoom.map(exam => exam.seatColor);
      const availableColors = room.seatColors.filter(color => 
        !assignedColors.includes(color)
      );

      // Allow same room if different course levels AND seat colors available
      const hasSameLevelConflict = allExamsInRoom.some(exam => 
        exam.courseLevel === courseLevel
      );

      // If no same-level conflict AND seat colors available, room is suitable
      if (!hasSameLevelConflict && availableColors.length > 0) {
        return {
          room: room.name,
          building: room.building,
          seatColor: availableColors[0], // Use the first available color
          roomCapacity: room.capacity
        };
      }
    }
    return null;
  };

  // Update instructor loads
  const updateInstructorLoads = (newExams) => {
    const updatedInstructors = instructors.map(instructor => {
      const instructorExams = [...exams, ...newExams].filter(
        exam => exam.instructor === instructor.fullName
      );
      return {
        ...instructor,
        currentLoad: instructorExams.length
      };
    });
    setInstructors(updatedInstructors);
    DataManager.saveInstructors(updatedInstructors);
  };

  // ENHANCED: Intelligent scheduling algorithm with better conflict resolution
  const autoScheduleExams = async () => {
    setSchedulingProgress({
      isScheduling: true,
      currentStep: 'Initializing scheduling...',
      progress: 0
    });

    // Get ALL active courses that aren't already scheduled
    const scheduledCourseCodes = new Set(exams.map(exam => exam.courseCode));
    const activeCourses = courses.filter(course => 
      course.status === 'active' && !scheduledCourseCodes.has(course.code)
    );

    if (activeCourses.length === 0) {
      setSchedulingProgress({
        isScheduling: false,
        currentStep: '',
        progress: 100
      });
      alert('✅ All courses are already scheduled!');
      return { newExams: [], unscheduledCourses: [] };
    }

    const groupedCourses = groupCoursesByLevel(activeCourses);
    const timeSlots = getTimeSlots(schedulingConfig.examType);
    const newExams = [];

    // Use multiple weeks for scheduling to accommodate all courses
    const startWeek = schedulingConfig.examType === 'midterm' 
      ? schedulingConfig.midtermStartWeek 
      : schedulingConfig.finalStartWeek;
    
    const totalWeeks = schedulingConfig.examType === 'midterm' ? 4 : 6;
    const totalSteps = Object.values(groupedCourses).flat().length;
    let completedSteps = 0;

    // Track instructor assignments
    const instructorAssignments = {};
    instructors.forEach(instructor => {
      instructorAssignments[instructor.fullName] = {
        currentLoad: exams.filter(exam => exam.instructor === instructor.fullName).length,
        maxLoad: instructor.maxLoad || 8,
        assignedExams: []
      };
    });

    const levels = [400, 300, 200, 100];
    const unscheduledCourses = [];

    // Enhanced scheduling with multiple attempts
    for (const level of levels) {
      const levelCourses = groupedCourses[level];
      
      for (const course of levelCourses) {
        setSchedulingProgress({
          isScheduling: true,
          currentStep: `Scheduling ${course.code} (${level}-level)...`,
          progress: (completedSteps / totalSteps) * 100
        });

        // Find available instructor with load consideration
        const courseInstructors = instructors
          .filter(instructor => 
            instructor.department === course.department && 
            instructor.status === 'active'
          )
          .sort((a, b) => {
            const loadA = instructorAssignments[a.fullName]?.currentLoad || 0;
            const loadB = instructorAssignments[b.fullName]?.currentLoad || 0;
            return loadA - loadB;
          });

        if (courseInstructors.length === 0) {
          unscheduledCourses.push({ course, reason: 'No available instructors' });
          completedSteps++;
          continue;
        }

        let scheduled = false;

        // Strategy 1: Try different instructors first
        for (const instructor of courseInstructors) {
          const instructorData = instructorAssignments[instructor.fullName];
          
          if (instructorData.currentLoad >= instructorData.maxLoad) {
            continue;
          }

          // Strategy 2: Try different weeks
          for (let weekOffset = 0; weekOffset < totalWeeks && !scheduled; weekOffset++) {
            const examWeek = startWeek + weekOffset;
            
            const dayRange = schedulingConfig.examType === 'midterm' 
              ? [5, 6]
              : [1, 2, 3, 4];

            // Strategy 3: Try different days
            for (const dayOfWeek of dayRange) {
              const examDate = calculateExamDate(examWeek, dayOfWeek);
              
              // Strategy 4: Try all time slots
              for (const timeSlot of timeSlots) {
                const slotDay = timeSlot.label.includes('Friday') ? 5 :
                              timeSlot.label.includes('Saturday') ? 6 :
                              timeSlot.label.includes('Mon') ? 1 :
                              timeSlot.label.includes('Tue') ? 2 :
                              timeSlot.label.includes('Wed') ? 3 : 4;

                if (slotDay !== dayOfWeek) continue;

                // Check student conflicts
                if (hasStudentConflicts(course.code, examDate, timeSlot.value)) {
                  continue;
                }
                
                // Check instructor time conflict
                const instructorTimeConflict = exams.some(exam => 
                  exam.instructor === instructor.fullName &&
                  exam.date === examDate &&
                  exam.time === timeSlot.value
                ) || newExams.some(exam => 
                  exam.instructor === instructor.fullName &&
                  exam.date === examDate &&
                  exam.time === timeSlot.value
                );

                if (instructorTimeConflict) {
                  continue;
                }

                // FIXED: Pass newExams parameter to check seat color conflicts
                const roomAssignment = assignRoomAndSeatColor(
                  course, 
                  examDate, 
                  timeSlot.value, 
                  level,
                  newExams  // This ensures we check against exams being scheduled in current batch
                );
                
                if (roomAssignment) {
                  const newExam = {
                    id: Date.now() + Math.random(),
                    courseCode: course.code,
                    course: course.name,
                    instructor: instructor.fullName,
                    instructorId: instructor.id,
                    room: roomAssignment.room,
                    building: roomAssignment.building,
                    seatColor: roomAssignment.seatColor,
                    date: examDate,
                    time: timeSlot.value,
                    duration: schedulingConfig.examDuration,
                    enrolledStudents: course.enrolled,
                    roomCapacity: roomAssignment.roomCapacity,
                    examType: schedulingConfig.examType,
                    courseLevel: level,
                    status: 'scheduled',
                    autoScheduled: true,
                    createdAt: new Date().toISOString()
                  };

                  newExams.push(newExam);
                  instructorAssignments[instructor.fullName].currentLoad++;
                  instructorAssignments[instructor.fullName].assignedExams.push(newExam);
                  scheduled = true;
                  break;
                }
              }
              if (scheduled) break;
            }
            if (scheduled) break;
          }
          if (scheduled) break;
        }

        if (!scheduled) {
          unscheduledCourses.push({ course, reason: 'No available time slots or rooms after trying all options' });
        }

        completedSteps++;
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }

    // Save exams and update UI
    if (newExams.length > 0) {
      const updatedExams = [...exams, ...newExams];
      setExams(updatedExams);
      DataManager.saveExams(updatedExams);
      updateInstructorLoads(newExams);
    }

    setSchedulingProgress({
      isScheduling: false,
      currentStep: '',
      progress: 100
    });

    return { newExams, unscheduledCourses };
  };

  const handleAutoSchedule = async () => {
    const { newExams, unscheduledCourses } = await autoScheduleExams();
    
    if (newExams.length > 0) {
      alert(`✅ Successfully scheduled ${newExams.length} ${schedulingConfig.examType} exams!`);
      if (unscheduledCourses.length > 0) {
        alert(`ℹ️ ${unscheduledCourses.length} courses could not be scheduled:\n${unscheduledCourses.map(uc => `• ${uc.course.code}: ${uc.reason}`).join('\n')}`);
      }
    } else {
      alert('❌ No exams could be scheduled. Check course and room availability.');
    }
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      const updatedExams = exams.filter(exam => exam.id !== examId);
      setExams(updatedExams);
      DataManager.saveExams(updatedExams);
    }
  };

  const handleClearSchedule = () => {
    if (window.confirm('Are you sure you want to clear all scheduled exams?')) {
      setExams([]);
      DataManager.saveExams([]);
    }
  };

  const getInstructorLoadInfo = (instructorName) => {
    const instructor = instructors.find(i => i.fullName === instructorName);
    if (!instructor) return 'N/A';
    const assignedExams = exams.filter(exam => exam.instructor === instructorName);
    return `${assignedExams.length}/${instructor.maxLoad || 8}`;
  };

  const getScheduledExamsByType = (examType) => {
    return exams.filter(exam => exam.examType === examType);
  };

  // Get unscheduled courses
  const getUnscheduledCourses = () => {
    const scheduledCourseCodes = new Set(exams.map(exam => exam.courseCode));
    return courses.filter(course => 
      course.status === 'active' && !scheduledCourseCodes.has(course.code)
    );
  };

  return (
    <div>
      <h2 className="page-header">Intelligent Exam Scheduling</h2>
      <p className="page-subtitle">Automatic conflict-free scheduling based on course levels and availability</p>

      {/* Scheduling Configuration */}
      <div className="card">
        <div className="card-header">
          <h3>Exam Scheduling Configuration</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-field">
              <label>Exam Type</label>
              <select
                value={schedulingConfig.examType}
                onChange={(e) => setSchedulingConfig({
                  ...schedulingConfig,
                  examType: e.target.value
                })}
              >
                <option value="midterm">Midterm Exams</option>
                <option value="final">Final Exams</option>
              </select>
            </div>

            <div className="form-field">
              <label>Semester Start Date</label>
              <input
                type="date"
                value={schedulingConfig.semesterStart}
                onChange={(e) => setSchedulingConfig({
                  ...schedulingConfig,
                  semesterStart: e.target.value
                })}
              />
            </div>

            <div className="form-field">
              <label>Exam Duration (hours)</label>
              <select
                value={schedulingConfig.examDuration}
                onChange={(e) => setSchedulingConfig({
                  ...schedulingConfig,
                  examDuration: parseInt(e.target.value)
                })}
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
              </select>
            </div>
          </div>

          <div className="scheduling-info">
            <h4>📅 Enhanced Scheduling Strategies:</h4>
            <ul>
              <li><strong>Multiple Weeks:</strong> {schedulingConfig.examType === 'midterm' ? '4 weeks' : '6 weeks'} for flexibility</li>
              <li><strong>Room Strategies:</strong> Tries exact capacity rooms first, then larger rooms</li>
              <li><strong>Instructor Load:</strong> Up to 8 exams per instructor with smart distribution</li>
              <li><strong>Conflict Resolution:</strong> Tries different days, times, rooms, and instructors</li>
              <li><strong>Seat Color Management:</strong> Ensures unique seat colors in same room at same time</li>
            </ul>
          </div>

          <div className="course-stats">
            <div className="stat-row">
              <span>Total Active Courses: <strong>{courses.filter(c => c.status === 'active').length}</strong></span>
              <span>Scheduled Exams: <strong>{exams.length}</strong></span>
              <span>Unscheduled Courses: <strong>{getUnscheduledCourses().length}</strong></span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleAutoSchedule}
              disabled={schedulingProgress.isScheduling}
            >
              {schedulingProgress.isScheduling ? '🔄 Smart Scheduling...' : '🚀 Smart Schedule All Exams'}
            </button>
            
            <button
              className="btn btn-danger"
              onClick={handleClearSchedule}
              disabled={exams.length === 0}
            >
              🗑️ Clear All Scheduled Exams
            </button>
          </div>

          {schedulingProgress.isScheduling && (
            <div className="scheduling-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${schedulingProgress.progress}%` }}
                ></div>
              </div>
              <div className="progress-text">{schedulingProgress.currentStep}</div>
              <div className="progress-percentage">{Math.round(schedulingProgress.progress)}%</div>
            </div>
          )}
        </div>
      </div>

      {/* Scheduled Exams */}
      <div className="card">
        <div className="card-header">
          <h3>
            Scheduled {schedulingConfig.examType === 'midterm' ? 'Midterm' : 'Final'} Exams 
            ({getScheduledExamsByType(schedulingConfig.examType).length})
          </h3>
          <div className="exam-stats">
            <span className="stat-badge">
              🏫 {new Set(exams.map(e => e.room)).size} Rooms Used
            </span>
            <span className="stat-badge">
              👨‍🏫 {new Set(exams.map(e => e.instructor)).size} Instructors
            </span>
          </div>
        </div>
        <div className="card-body">
          {getScheduledExamsByType(schedulingConfig.examType).length === 0 ? (
            <div className="no-data-message">
              No {schedulingConfig.examType} exams scheduled yet. Click "Smart Schedule All Exams" to generate the schedule.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Level</th>
                  <th>Date & Time</th>
                  <th>Room & Seat</th>
                  <th>Instructor</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getScheduledExamsByType(schedulingConfig.examType).map(exam => (
                  <tr key={exam.id}>
                    <td>
                      <strong>{exam.courseCode}</strong>
                      <div>{exam.course}</div>
                      {exam.autoScheduled && <span className="status-badge status-info">Auto</span>}
                    </td>
                    <td>
                      <span className="status-badge status-upcoming">
                        {exam.courseLevel}-level
                      </span>
                    </td>
                    <td>
                      <div>{exam.date}</div>
                      <div>{exam.time}</div>
                    </td>
                    <td>
                      <div>{exam.room}</div>
                      <div>
                        <span className={`seat-color-badge seat-color-${exam.seatColor.toLowerCase()}`}>
                          {exam.seatColor} Seats
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>{exam.instructor}</div>
                      <small className="text-muted">
                        Load: {getInstructorLoadInfo(exam.instructor)}
                      </small>
                    </td>
                    <td>
                      <div className="enrollment-display">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{
                              width: `${(exam.enrolledStudents / exam.roomCapacity) * 100}%`,
                              background: exam.enrolledStudents > exam.roomCapacity ? '#ef4444' : '#10b981'
                            }}
                          ></div>
                        </div>
                        <span>{exam.enrolledStudents}/{exam.roomCapacity}</span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteExam(exam.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Schedule Summary */}
      {exams.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Schedule Summary</h3>
          </div>
          <div className="card-body">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-value">{exams.length}</div>
                <div className="summary-label">Total Exams</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">
                  {getScheduledExamsByType('midterm').length}
                </div>
                <div className="summary-label">Midterm Exams</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">
                  {getScheduledExamsByType('final').length}
                </div>
                <div className="summary-label">Final Exams</div>
              </div>
              <div className="summary-card">
                <div className="summary-value">
                  {Math.round(exams.reduce((acc, exam) => acc + exam.enrolledStudents, 0) / exams.length)}
                </div>
                <div className="summary-label">Avg Students/Exam</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructor Workload Overview */}
      {exams.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Instructor Workload Overview</h3>
          </div>
          <div className="card-body">
            <div className="instructor-workload">
              {instructors
                .filter(instructor => instructor.status === 'active')
                .map(instructor => {
                  const assignedExams = exams.filter(exam => exam.instructor === instructor.fullName);
                  const loadPercentage = (assignedExams.length / (instructor.maxLoad || 8)) * 100;
                  
                  return (
                    <div key={instructor.id} className="instructor-load-item">
                      <div className="instructor-info">
                        <strong>{instructor.fullName}</strong>
                        <span>{instructor.department}</span>
                      </div>
                      <div className="load-display">
                        <div className="load-bar">
                          <div 
                            className={`load-fill ${
                              loadPercentage >= 100 ? 'overload' : 
                              loadPercentage >= 80 ? 'high' : 'normal'
                            }`}
                            style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="load-text">
                          {assignedExams.length}/{instructor.maxLoad || 8} exams
                        </span>
                      </div>
                      <div className="assigned-courses">
                        {assignedExams.map(exam => (
                          <span key={exam.id} className="course-badge">
                            {exam.courseCode}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleExams;