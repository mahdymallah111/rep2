import React, { useState, useMemo, useEffect } from 'react';
import { DataManager } from '../utils/dataPersistence';

const ManageStudents = () => {
 const [students, setStudents] = useState([]);
const [courses, setCourses] = useState([]);

  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: '',
    major: ''
  });

  const [enrollment, setEnrollment] = useState({
    searchStudent: '',
    searchCourse: '',
    departmentFilter: '',
    majorFilter: ''
  });

  const [bulkEnrollment, setBulkEnrollment] = useState({
    selectedCourse: '',
    studentIds: []
  });

useEffect(() => {
  const loadedStudents = DataManager.getStudents();
  const loadedCourses = DataManager.getCourses();
  setStudents(loadedStudents);
  setCourses(loadedCourses);
}, []);

  const generateEmail = (name) => {
    const nameParts = name.toLowerCase().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0]}.${nameParts[nameParts.length - 1]}@students.liu.edu.lb`;
    }
    return `${nameParts[0]}.${nameParts[0]}@students.liu.edu.lb`;
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = enrollment.searchStudent === '' || 
        student.name.toLowerCase().includes(enrollment.searchStudent.toLowerCase()) ||
        student.studentId.includes(enrollment.searchStudent);
      
      const matchesMajor = enrollment.majorFilter === '' || 
        student.major === enrollment.majorFilter;
      
      return matchesSearch && matchesMajor;
    });
  }, [students, enrollment.searchStudent, enrollment.majorFilter]);

  const filteredCourses = useMemo(() => {
  return courses.filter(course => {
    const matchesSearch = enrollment.searchCourse === '' || 
      course.code.toLowerCase().includes(enrollment.searchCourse.toLowerCase()) ||
      course.name.toLowerCase().includes(enrollment.searchCourse.toLowerCase());
    
    const matchesDepartment = enrollment.departmentFilter === '' || 
      course.department === enrollment.departmentFilter;
    
    const isActive = course.status === 'active';
    
    return matchesSearch && matchesDepartment && isActive;
  });
}, [courses, enrollment.searchCourse, enrollment.departmentFilter]);
  const uniqueMajors = useMemo(() => {
    const majors = students.map(s => s.major).filter(Boolean);
    return [...new Set(majors)];
  }, [students]);

 const uniqueDepartments = useMemo(() => {
  const departments = courses
    .filter(course => course.status === 'active')
    .map(c => c.department)
    .filter(Boolean);
  return [...new Set(departments)];
}, [courses]);

 const handleAddStudent = (e) => {
  e.preventDefault();
  if (newStudent.studentId && newStudent.name) {
    // Check if student ID already exists
    const existingStudent = students.find(student => student.studentId === newStudent.studentId);
    if (existingStudent) {
      alert('Student ID already exists. Please use a unique student ID.');
      return;
    }
    
    const email = generateEmail(newStudent.name, newStudent.studentId);
    const student = {
      id: Date.now(),
      ...newStudent,
      enrolledCourses: [],
      email: email,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updatedStudents = [...students, student];
    setStudents(updatedStudents);
    DataManager.saveStudents(updatedStudents);
    setNewStudent({ studentId: '', name: '', major: '' });
  }
};

const handleEnrollStudent = (studentId, courseCode) => {
  const course = courses.find(c => c.code === courseCode);
  if (!course) {
    alert('Course not found!');
    return;
  }
  
  // Check if course is at capacity
  if (course.enrolled >= course.capacity) {
    alert(`Course ${courseCode} is already at full capacity!`);
    return;
  }
  
  const updatedStudents = students.map(student => 
    student.studentId === studentId 
      ? { 
          ...student, 
          enrolledCourses: [...new Set([...student.enrolledCourses, courseCode])] 
        }
      : student
  );
  
  // Update course enrollment count
  const updatedCourses = courses.map(c => 
    c.code === courseCode 
      ? { ...c, enrolled: c.enrolled + 1 }
      : c
  );
  
  setStudents(updatedStudents);
  setCourses(updatedCourses);
  DataManager.saveStudents(updatedStudents);
  DataManager.saveCourses(updatedCourses);
};

const handleBulkEnroll = () => {
  if (!bulkEnrollment.selectedCourse || bulkEnrollment.studentIds.length === 0) {
    alert('Please select a course and at least one student');
    return;
  }

  const course = courses.find(c => c.code === bulkEnrollment.selectedCourse);
  if (!course) {
    alert('Selected course not found!');
    return;
  }

  // Check if course has enough capacity for all selected students
  const availableSpots = course.capacity - course.enrolled;
  if (bulkEnrollment.studentIds.length > availableSpots) {
    alert(`Only ${availableSpots} spots available in ${bulkEnrollment.selectedCourse}. Cannot enroll ${bulkEnrollment.studentIds.length} students.`);
    return;
  }

  const updatedStudents = students.map(student => 
    bulkEnrollment.studentIds.includes(student.studentId)
      ? { 
          ...student, 
          enrolledCourses: [...new Set([...student.enrolledCourses, bulkEnrollment.selectedCourse])] 
        }
      : student
  );

  // Update course enrollment count
  const updatedCourses = courses.map(c => 
    c.code === bulkEnrollment.selectedCourse 
      ? { ...c, enrolled: c.enrolled + bulkEnrollment.studentIds.length }
      : c
  );

  setStudents(updatedStudents);
  setCourses(updatedCourses);
  DataManager.saveStudents(updatedStudents);
  DataManager.saveCourses(updatedCourses);
  setBulkEnrollment({ selectedCourse: '', studentIds: [] });
};

 const handleUnenrollStudent = (studentId, courseCode) => {
  const updatedStudents = students.map(student => 
    student.studentId === studentId 
      ? { 
          ...student, 
          enrolledCourses: student.enrolledCourses.filter(c => c !== courseCode)
        }
      : student
  );
  
  // Update course enrollment count
  const updatedCourses = courses.map(c => 
    c.code === courseCode 
      ? { ...c, enrolled: Math.max(0, c.enrolled - 1) }
      : c
  );
  
  setStudents(updatedStudents);
  setCourses(updatedCourses);
  DataManager.saveStudents(updatedStudents);
  DataManager.saveCourses(updatedCourses);
};
  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const updatedStudents = students.filter(student => student.id !== id);
      setStudents(updatedStudents);
      DataManager.saveStudents(updatedStudents);
    }
  };

  const handleEmailClick = (email, studentName) => {
    const subject = `Message from LIU Exam System - Regarding ${studentName}`;
    const body = `Dear ${studentName},\n\n`;
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const toggleStudentSelection = (studentId) => {
    setBulkEnrollment(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredStudents.map(s => s.studentId);
    setBulkEnrollment(prev => ({
      ...prev,
      studentIds: allFilteredIds
    }));
  };

  const clearSelection = () => {
    setBulkEnrollment(prev => ({ ...prev, studentIds: [] }));
  };

  return (
    <div>
      <h2 className="page-header">Manage Students</h2>
      
      <div className="card">
        <div className="card-header">
          <h3>Add New Student</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddStudent}>
            <div className="form-row">
              <div className="form-field">
                <label>Student ID *</label>
                <input
                  type="text"
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                  placeholder="e.g., 20230001"
                  required
                />
              </div>
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="e.g., John Doe"
                  required
                />
                <small className="email-preview">
                  Email: {newStudent.name ? generateEmail(newStudent.name) : 'name.lastname@students.liu.edu.lb'}
                </small>
              </div>
              <div className="form-field">
                <label>Major</label>
                <input
                  type="text"
                  value={newStudent.major}
                  onChange={(e) => setNewStudent({...newStudent, major: e.target.value})}
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Add Student</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Course Enrollment</h3>
          <span className="status-badge status-active">Bulk Operations</span>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-field">
              <label>Search Students</label>
              <input
                type="text"
                value={enrollment.searchStudent}
                onChange={(e) => setEnrollment({...enrollment, searchStudent: e.target.value})}
                placeholder="Search by name or student ID..."
              />
            </div>
            <div className="form-field">
              <label>Filter by Major</label>
              <select
                value={enrollment.majorFilter}
                onChange={(e) => setEnrollment({...enrollment, majorFilter: e.target.value})}
              >
                <option value="">All Majors</option>
                {uniqueMajors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Selected Students</label>
              <div className="selection-count">
                {bulkEnrollment.studentIds.length} students selected
                {bulkEnrollment.studentIds.length > 0 && (
                  <button 
                    type="button"
                    className="btn btn-danger btn-sm clear-btn"
                    onClick={clearSelection}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bulk-actions">
            <button 
              className="btn btn-secondary"
              onClick={selectAllFiltered}
              disabled={filteredStudents.length === 0}
            >
              Select All ({filteredStudents.length} Students)
            </button>
          </div>

          <div className="students-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && bulkEnrollment.studentIds.length === filteredStudents.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllFiltered();
                        } else {
                          clearSelection();
                        }
                      }}
                    />
                  </th>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Major</th>
                  <th>Current Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={bulkEnrollment.studentIds.includes(student.studentId)}
                        onChange={() => toggleStudentSelection(student.studentId)}
                      />
                    </td>
                    <td><strong>{student.studentId}</strong></td>
                    <td>{student.name}</td>
                    <td>
                      <span className="status-badge status-upcoming">
                        {student.major || 'Undeclared'}
                      </span>
                    </td>
                    <td>
                      {student.enrolledCourses.length > 0 ? (
                        <div className="course-tags">
                          {student.enrolledCourses.map((courseCode, index) => (
                            <span key={index} className="status-badge status-active course-tag">
                              {courseCode}
                              <button 
                                onClick={() => handleUnenrollStudent(student.studentId, courseCode)}
                                className="remove-course-btn"
                                title="Unenroll"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="no-courses">No courses</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEmailClick(student.email, student.name)}
                          title={`Email ${student.name}`}
                        >
                          Email
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredStudents.length === 0 && (
              <div className="no-data-message">
                No students found matching your search criteria.
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Search Courses</label>
              <input
                type="text"
                value={enrollment.searchCourse}
                onChange={(e) => setEnrollment({...enrollment, searchCourse: e.target.value})}
                placeholder="Search by course code or name..."
              />
            </div>
            <div className="form-field">
              <label>Filter by Department</label>
              <select
                value={enrollment.departmentFilter}
                onChange={(e) => setEnrollment({...enrollment, departmentFilter: e.target.value})}
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Select Course for Enrollment</label>
             <select
  value={bulkEnrollment.selectedCourse}
  onChange={(e) => setBulkEnrollment({...bulkEnrollment, selectedCourse: e.target.value})}
>
  <option value="">Choose a course...</option>
  {filteredCourses.map(course => (
    <option key={course.id} value={course.code}>
      {course.code} - {course.name} ({course.department}) - {course.enrolled}/{course.capacity} enrolled
    </option>
  ))}
</select>
            </div>
          </div>

          <div className="enrollment-actions">
            <button 
              className="btn btn-primary"
              onClick={handleBulkEnroll}
              disabled={!bulkEnrollment.selectedCourse || bulkEnrollment.studentIds.length === 0}
            >
              Enroll {bulkEnrollment.studentIds.length} Selected Students
            </button>
          </div>
        </div>
      </div>

    
     
   
    </div>
  );
};

export default ManageStudents;