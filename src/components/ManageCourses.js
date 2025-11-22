import React, { useState, useMemo, useEffect } from 'react';
import { DataManager } from '../utils/dataPersistence';

const ManageCourses = () => {
  const academicYears = ['2023-2024', '2024-2025', '2025-2026', '2026-2027'];
  const semesters = ['Fall', 'Spring', 'Summer I', 'Summer II', 'Winter'];
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business'];
  const courseLevels = [
    { value: 100, label: '100-level (Introductory)' },
    { value: 200, label: '200-level (Intermediate)' },
    { value: 300, label: '300-level (Advanced)' },
    { value: 400, label: '400-level (Senior)' }
  ];

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [newCourse, setNewCourse] = useState({
    code: '', name: '', description: '', credits: 3, department: '', level: 100,
    instructor: '', semester: 'Fall', academicYear: '2024-2025', capacity: 30,
    prerequisites: [], schedule: '', room: '', category: 'Core'
  });

  const [filters, setFilters] = useState({
    search: '', department: '', level: '', semester: '', academicYear: '', status: 'active'
  });

  const [viewMode, setViewMode] = useState('table');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [prerequisiteSearch, setPrerequisiteSearch] = useState('');

  useEffect(() => {
    const loadedCourses = DataManager.getCourses();
    const loadedInstructors = DataManager.getInstructors();
    setCourses(loadedCourses);
    setInstructors(loadedInstructors);
  }, []);

  // Function to extract level from course code
  const getLevelFromCode = (code) => {
    if (!code) return 100;
    
    // Extract numbers from course code (e.g., "CSCI101" -> "101")
    const numbers = code.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 100;
    
    const courseNumber = parseInt(numbers[0]);
    
    // Determine level based on course number
    if (courseNumber >= 400) return 400;
    if (courseNumber >= 300) return 300;
    if (courseNumber >= 200) return 200;
    return 100;
  };

  // Function to get level label
  const getLevelLabel = (level) => {
    const levelConfig = courseLevels.find(l => l.value === level);
    return levelConfig ? levelConfig.label : `${level}-level`;
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = filters.search === '' || 
        course.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.name.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesDepartment = filters.department === '' || 
        course.department === filters.department;
      
      const matchesLevel = filters.level === '' || 
        course.level === parseInt(filters.level);
      
      const matchesSemester = filters.semester === '' || 
        course.semester === filters.semester;

      const matchesAcademicYear = filters.academicYear === '' || 
        course.academicYear === filters.academicYear;

      const matchesStatus = filters.status === '' || 
        course.status === filters.status;

      return matchesSearch && matchesDepartment && matchesLevel && 
             matchesSemester && matchesAcademicYear && matchesStatus;
    });
  }, [courses, filters]);

  const availablePrerequisites = useMemo(() => {
    return courses.filter(course => 
      (course.code.toLowerCase().includes(prerequisiteSearch.toLowerCase()) ||
      course.name.toLowerCase().includes(prerequisiteSearch.toLowerCase())) &&
      course.id !== editingCourse?.id &&
      course.status === 'active'
    );
  }, [courses, prerequisiteSearch, editingCourse]);

  const stats = useMemo(() => ({
    total: courses.length,
    active: courses.filter(c => c.status === 'active').length,
    totalEnrollment: courses.reduce((total, course) => total + course.enrolled, 0),
    totalCapacity: courses.reduce((total, course) => total + course.capacity, 0),
    coursesByLevel: {
      100: courses.filter(c => getLevelFromCode(c.code) === 100).length,
      200: courses.filter(c => getLevelFromCode(c.code) === 200).length,
      300: courses.filter(c => getLevelFromCode(c.code) === 300).length,
      400: courses.filter(c => getLevelFromCode(c.code) === 400).length
    }
  }), [courses]);

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (newCourse.code && newCourse.name && newCourse.department) {
      // Check if course code already exists
      const existingCourse = courses.find(course => course.code === newCourse.code);
      if (existingCourse) {
        alert('Course code already exists. Please use a unique course code.');
        return;
      }

      // Auto-determine level from course code
      const autoLevel = getLevelFromCode(newCourse.code);

      const course = {
        id: Date.now(),
        ...newCourse,
        level: autoLevel, // Use auto-determined level
        enrolled: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };

      const updatedCourses = [...courses, course];
      setCourses(updatedCourses);
      DataManager.saveCourses(updatedCourses);
      
      setNewCourse({
        code: '', name: '', description: '', credits: 3, department: '', level: 100,
        instructor: '', semester: 'Fall', academicYear: '2024-2025', capacity: 30,
        prerequisites: [], schedule: '', room: '', category: 'Core'
      });
      
      setPrerequisiteSearch('');
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse({...course});
    setShowEditModal(true);
  };

  const handleUpdateCourse = (e) => {
    e.preventDefault();
    if (editingCourse && editingCourse.code && editingCourse.name && editingCourse.department) {
      // Auto-update level if course code changed
      const updatedCourse = {
        ...editingCourse,
        level: getLevelFromCode(editingCourse.code)
      };

      const updatedCourses = courses.map(course => 
        course.id === updatedCourse.id ? updatedCourse : course
      );
      setCourses(updatedCourses);
      DataManager.saveCourses(updatedCourses);
      setShowEditModal(false);
      setEditingCourse(null);
    }
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const updatedCourses = courses.filter(course => course.id !== id);
      setCourses(updatedCourses);
      DataManager.saveCourses(updatedCourses);
    }
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  const togglePrerequisite = (courseCode, isEditMode = false) => {
    if (isEditMode) {
      setEditingCourse(prev => ({
        ...prev,
        prerequisites: prev.prerequisites.includes(courseCode)
          ? prev.prerequisites.filter(code => code !== courseCode)
          : [...prev.prerequisites, courseCode]
      }));
    } else {
      setNewCourse(prev => ({
        ...prev,
        prerequisites: prev.prerequisites.includes(courseCode)
          ? prev.prerequisites.filter(code => code !== courseCode)
          : [...prev.prerequisites, courseCode]
      }));
    }
  };

  const getEnrollmentPercentage = (enrolled, capacity) => {
    return Math.round((enrolled / capacity) * 100);
  };

  const getEnrollmentStatus = (enrolled, capacity) => {
    const percentage = getEnrollmentPercentage(enrolled, capacity);
    if (percentage >= 90) return { status: 'Full', color: '#f56565' };
    if (percentage >= 70) return { status: 'Almost Full', color: '#ed8936' };
    if (percentage >= 50) return { status: 'Moderate', color: '#ecc94b' };
    return { status: 'Available', color: '#48bb78' };
  };

  const getLevelBadge = (course) => {
    const level = getLevelFromCode(course.code);
    const levelConfig = {
      100: { class: 'status-upcoming', label: '100-level' },
      200: { class: 'status-active', label: '200-level' },
      300: { class: 'status-warning', label: '300-level' },
      400: { class: 'status-info', label: '400-level' }
    };
    
    const config = levelConfig[level] || { class: 'status-upcoming', label: `${level}-level` };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  // Auto-update level when course code changes
  const handleCourseCodeChange = (code) => {
    const upperCode = code.toUpperCase();
    const autoLevel = getLevelFromCode(upperCode);
    
    setNewCourse({
      ...newCourse,
      code: upperCode,
      level: autoLevel
    });
  };

  return (
    <div>
      <h2 className="page-header">Course Management</h2>
      <p className="page-subtitle">Manage course catalog, semesters, and academic scheduling</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalEnrollment}</div>
          <div className="stat-label">Total Enrollment</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Math.round((stats.totalEnrollment / stats.totalCapacity) * 100)}%
          </div>
          <div className="stat-label">Capacity Usage</div>
        </div>
      </div>

      {/* Level Distribution */}
      <div className="card">
        <div className="card-header">
          <h3>Course Level Distribution</h3>
        </div>
        <div className="card-body">
          <div className="level-distribution">
            <div className="level-stat">
              <span className="level-badge level-100">100-level</span>
              <span className="level-count">{stats.coursesByLevel[100]} courses</span>
            </div>
            <div className="level-stat">
              <span className="level-badge level-200">200-level</span>
              <span className="level-count">{stats.coursesByLevel[200]} courses</span>
            </div>
            <div className="level-stat">
              <span className="level-badge level-300">300-level</span>
              <span className="level-count">{stats.coursesByLevel[300]} courses</span>
            </div>
            <div className="level-stat">
              <span className="level-badge level-400">400-level</span>
              <span className="level-count">{stats.coursesByLevel[400]} courses</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Add New Course</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddCourse}>
            <div className="form-row">
              <div className="form-field">
                <label>Course Code *</label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => handleCourseCodeChange(e.target.value)}
                  placeholder="CSCI101"
                  required
                />
                <small className="code-help">
                  Level will be auto-detected: {newCourse.code ? getLevelLabel(getLevelFromCode(newCourse.code)) : 'Enter course code'}
                </small>
              </div>
              <div className="form-field">
                <label>Course Name *</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                  placeholder="Introduction to Programming"
                  required
                />
              </div>
              <div className="form-field">
                <label>Credits</label>
                <select
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({...newCourse, credits: parseInt(e.target.value)})}
                >
                  <option value={1}>1 Credit</option>
                  <option value={2}>2 Credits</option>
                  <option value={3}>3 Credits</option>
                  <option value={4}>4 Credits</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  placeholder="Course description and learning objectives..."
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Department *</label>
                <select
                  value={newCourse.department}
                  onChange={(e) => setNewCourse({...newCourse, department: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Course Level (Auto-detected)</label>
                <div className="level-display">
                  <span className={`status-badge ${
                    getLevelFromCode(newCourse.code) === 100 ? 'status-upcoming' :
                    getLevelFromCode(newCourse.code) === 200 ? 'status-active' :
                    getLevelFromCode(newCourse.code) === 300 ? 'status-warning' : 'status-info'
                  }`}>
                    {getLevelLabel(getLevelFromCode(newCourse.code))}
                  </span>
                </div>
                <small>Based on course code: {newCourse.code || 'N/A'}</small>
              </div>
              <div className="form-field">
                <label>Category</label>
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                >
                  <option value="Core">Core</option>
                  <option value="Elective">Elective</option>
                  <option value="General Education">General Education</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Instructor</label>
                <select
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                >
                  <option value="">Select Instructor</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.fullName}>
                      {instructor.fullName} - {instructor.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Semester *</label>
                <select
                  value={newCourse.semester}
                  onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
                  required
                >
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Academic Year *</label>
                <select
                  value={newCourse.academicYear}
                  onChange={(e) => setNewCourse({...newCourse, academicYear: e.target.value})}
                  required
                >
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Capacity</label>
                <input
                  type="number"
                  value={newCourse.capacity}
                  onChange={(e) => setNewCourse({...newCourse, capacity: parseInt(e.target.value)})}
                  min="1"
                  max="500"
                />
              </div>
              <div className="form-field">
                <label>Schedule</label>
                <input
                  type="text"
                  value={newCourse.schedule}
                  onChange={(e) => setNewCourse({...newCourse, schedule: e.target.value})}
                  placeholder="Mon, Wed 10:00-11:30"
                />
              </div>
              <div className="form-field">
                <label>Room</label>
                <input
                  type="text"
                  value={newCourse.room}
                  onChange={(e) => setNewCourse({...newCourse, room: e.target.value})}
                  placeholder="E-301"
                />
              </div>
            </div>

            <div className="prerequisites-section">
              <h4>Prerequisites</h4>
              <div className="form-row">
                <div className="form-field">
                  <label>Search Prerequisites</label>
                  <input
                    type="text"
                    value={prerequisiteSearch}
                    onChange={(e) => setPrerequisiteSearch(e.target.value)}
                    placeholder="Search courses by code or name..."
                  />
                </div>
              </div>
              <div className="prerequisites-list">
                {availablePrerequisites.length > 0 ? (
                  <div className="prerequisites-options">
                    {availablePrerequisites.map(course => (
                      <div key={course.id} className="prerequisite-option">
                        <input
                          type="checkbox"
                          checked={newCourse.prerequisites.includes(course.code)}
                          onChange={() => togglePrerequisite(course.code, false)}
                        />
                        <span>
                          <strong>{course.code}</strong> - {course.name} 
                          <small> ({getLevelLabel(getLevelFromCode(course.code))})</small>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-message">
                    {prerequisiteSearch ? 'No courses found matching your search' : 'Start typing to search for prerequisite courses'}
                  </div>
                )}
              </div>
              {newCourse.prerequisites.length > 0 && (
                <div>
                  <label>Selected Prerequisites:</label>
                  <div className="selected-prerequisites">
                    {newCourse.prerequisites.map(code => {
                      const course = courses.find(c => c.code === code);
                      return (
                        <span key={code} className="status-badge status-active">
                          {code}
                          {course && ` - ${course.name}`}
                          <button 
                            onClick={() => togglePrerequisite(code, false)}
                            className="remove-course-btn"
                            title="Remove prerequisite"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary">Add Course</button>
          </form>
        </div>
      </div>

      {viewMode === 'table' && (
        <div className="card">
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Instructor</th>
                  <th>Enrollment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(course => {
                  const enrollmentStatus = getEnrollmentStatus(course.enrolled, course.capacity);
                  return (
                    <tr key={course.id}>
                      <td><strong>{course.code}</strong></td>
                      <td>
                        <div>
                          <div>{course.name}</div>
                          <div>{course.category}</div>
                        </div>
                      </td>
                      <td>{course.department}</td>
                    <td>
  {course.instructor || 'Not Assigned'}
  {course.instructor && (
    <div>
      <small className="text-muted">
        {instructors.find(i => i.fullName === course.instructor)?.department || ''}
      </small>
    </div>
  )}
</td>
                      <td>
                        <div className="enrollment-display">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{
                                width: `${getEnrollmentPercentage(course.enrolled, course.capacity)}%`,
                                background: enrollmentStatus.color
                              }}
                            ></div>
                          </div>
                          <span>{course.enrolled}/{course.capacity}</span>
                          <div>{enrollmentStatus.status}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${course.status === 'active' ? 'status-active' : 'status-warning'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleViewDetails(course)}
                          >
                            View
                          </button>
                          <button 
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEditCourse(course)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredCourses.length === 0 && (
              <div className="no-data-message">
                No courses found matching your criteria
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="card">
          <div className="card-body">
            <div className="grid-view">
              {filteredCourses.map(course => {
                const enrollmentStatus = getEnrollmentStatus(course.enrolled, course.capacity);
                return (
                  <div key={course.id} className="grid-card">
                    <div className="grid-card-header">
                      <div>
                        <h4>{course.code}</h4>
                        <div>{course.name}</div>
                      </div>
                      {getLevelBadge(course.level)}
                    </div>

                    <div className="enrollment-display">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${getEnrollmentPercentage(course.enrolled, course.capacity)}%`,
                            background: enrollmentStatus.color
                          }}
                        ></div>
                      </div>
                      <span>{course.enrolled}/{course.capacity} ({enrollmentStatus.status})</span>
                    </div>

                    <div className="course-details">
                      <div>Department: {course.department}</div>
                    <div>
  Instructor: {course.instructor || 'Not Assigned'}
  {course.instructor && (
    <small> ({instructors.find(i => i.fullName === course.instructor)?.department})</small>
  )}
</div>
                      <div>Credits: {course.credits}</div>
                      {course.schedule && <div>Schedule: {course.schedule}</div>}
                    </div>

                    {course.prerequisites.length > 0 && (
                      <div>
                        <div>Prerequisites:</div>
                        <div className="course-tags">
                          {course.prerequisites.map(prereq => (
                            <span key={prereq} className="status-badge status-upcoming">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewDetails(course)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEditCourse(course)}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Course Details</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-field">
                  <label>Course Code</label>
                  <div>{selectedCourse.code}</div>
                </div>
                <div className="form-field">
                  <label>Course Name</label>
                  <div>{selectedCourse.name}</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Description</label>
                  <div>{selectedCourse.description}</div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Department</label>
                  <div>{selectedCourse.department}</div>
                </div>
                <div className="form-field">
                  <label>Level</label>
                  <div>{getLevelBadge(selectedCourse.level)}</div>
                </div>
                <div className="form-field">
                  <label>Credits</label>
                  <div>{selectedCourse.credits}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Course</h3>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEditModal(false)}
              >
                Close
              </button>
            </div>
            <form onSubmit={handleUpdateCourse}>
              <div className="form-row">
                <div className="form-field">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    value={editingCourse.code}
                    onChange={(e) => setEditingCourse({...editingCourse, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    value={editingCourse.name}
                    onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
              <div className="form-row">
  <div className="form-field">
    <label>Department *</label>
    <select
      value={editingCourse.department}
      onChange={(e) => setEditingCourse({...editingCourse, department: e.target.value})}
      required
    >
      <option value="">Select Department</option>
      {departments.map(dept => (
        <option key={dept} value={dept}>{dept}</option>
      ))}
    </select>
  </div>
  <div className="form-field">
    <label>Instructor</label>
    <select
      value={editingCourse.instructor}
      onChange={(e) => setEditingCourse({...editingCourse, instructor: e.target.value})}
    >
      <option value="">Select Instructor</option>
      {instructors
        .filter(instructor => instructor.department === editingCourse.department)
        .map(instructor => (
          <option key={instructor.id} value={instructor.fullName}>
            {instructor.fullName}
          </option>
        ))
      }
    </select>
  </div>
</div>
                <div className="form-field">
                  <label>Status</label>
                  <select
                    value={editingCourse.status}
                    onChange={(e) => setEditingCourse({...editingCourse, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">Update Course</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourses;