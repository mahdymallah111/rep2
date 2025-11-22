import React, { useState, useMemo, useEffect } from 'react';
import { DataManager } from '../utils/dataPersistence';

const ManageInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [departments] = useState(['Computer Science', 'Mathematics', 'Physics', 'Engineering']);
  const [faculties] = useState(['Engineering', 'Science', 'Business Administration']);
  const [titles] = useState(['Prof.', 'Dr.', 'Mr.', 'Ms.']);
  const [statuses] = useState(['active', 'on-leave', 'part-time']);

  const [newInstructor, setNewInstructor] = useState({
    employeeId: '', title: 'Dr.', firstName: '', lastName: '', email: '',
    phone: '', department: '', faculty: '', office: '', officeHours: '',
    specialization: '', status: 'active', hireDate: '', maxLoad: 3
  });

  const [filters, setFilters] = useState({
    search: '', department: '', faculty: '', status: ''
  });

  useEffect(() => {
    const loadedInstructors = DataManager.getInstructors();
    setInstructors(loadedInstructors);
  }, []);

  const generateEmail = (firstName, lastName) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@liu.edu.lb`;
  };

  const filteredInstructors = useMemo(() => {
    return instructors.filter(instructor => {
      const matchesSearch = filters.search === '' || 
        instructor.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        instructor.employeeId.includes(filters.search);
      
      const matchesDepartment = filters.department === '' || 
        instructor.department === filters.department;
      
      const matchesFaculty = filters.faculty === '' || 
        instructor.faculty === filters.faculty;
      
      const matchesStatus = filters.status === '' || 
        instructor.status === filters.status;

      return matchesSearch && matchesDepartment && matchesFaculty && matchesStatus;
    });
  }, [instructors, filters]);

  const stats = useMemo(() => ({
    total: instructors.length,
    active: instructors.filter(i => i.status === 'active').length,
    onLeave: instructors.filter(i => i.status === 'on-leave').length
  }), [instructors]);

  const handleAddInstructor = (e) => {
    e.preventDefault();
    if (newInstructor.employeeId && newInstructor.firstName && newInstructor.lastName) {
      const email = generateEmail(newInstructor.firstName, newInstructor.lastName);
      const fullName = `${newInstructor.title} ${newInstructor.firstName} ${newInstructor.lastName}`;
      
      const instructor = {
        id: Date.now(),
        ...newInstructor,
        email: email,
        fullName: fullName,
        courses: [],
        currentLoad: 0
      };

      const updatedInstructors = [...instructors, instructor];
      setInstructors(updatedInstructors);
      DataManager.saveInstructors(updatedInstructors);
      
      setNewInstructor({
        employeeId: '', title: 'Dr.', firstName: '', lastName: '', email: '',
        phone: '', department: '', faculty: '', office: '', officeHours: '',
        specialization: '', status: 'active', hireDate: '', maxLoad: 3
      });
    }
  };

  const handleDeleteInstructor = (id) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      const updatedInstructors = instructors.filter(instructor => instructor.id !== id);
      setInstructors(updatedInstructors);
      DataManager.saveInstructors(updatedInstructors);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'status-active', label: 'Active' },
      'on-leave': { class: 'status-warning', label: 'On Leave' },
      'part-time': { class: 'status-info', label: 'Part Time' }
    };
    
    const config = statusConfig[status] || { class: 'status-upcoming', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  return (
    <div>
      <h2 className="page-header">Faculty Management</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Faculty</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.onLeave}</div>
          <div className="stat-label">On Leave</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Add New Faculty Member</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddInstructor}>
            <div className="form-row">
              <div className="form-field">
                <label>Employee ID *</label>
                <input
                  type="text"
                  value={newInstructor.employeeId}
                  onChange={(e) => setNewInstructor({...newInstructor, employeeId: e.target.value})}
                  placeholder="PROF001"
                  required
                />
              </div>
              <div className="form-field">
                <label>Title</label>
                <select
                  value={newInstructor.title}
                  onChange={(e) => setNewInstructor({...newInstructor, title: e.target.value})}
                >
                  {titles.map(title => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>First Name *</label>
                <input
                  type="text"
                  value={newInstructor.firstName}
                  onChange={(e) => setNewInstructor({...newInstructor, firstName: e.target.value})}
                  placeholder="Sarah"
                  required
                />
              </div>
              <div className="form-field">
                <label>Last Name *</label>
                <input
                  type="text"
                  value={newInstructor.lastName}
                  onChange={(e) => setNewInstructor({...newInstructor, lastName: e.target.value})}
                  placeholder="Johnson"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={newInstructor.email}
                  onChange={(e) => setNewInstructor({...newInstructor, email: e.target.value})}
                  placeholder="sarah.johnson@liu.edu.lb"
                  readOnly
                />
                <small className="email-preview">
                  Auto-generated: {newInstructor.firstName && newInstructor.lastName 
                    ? generateEmail(newInstructor.firstName, newInstructor.lastName)
                    : 'first.last@liu.edu.lb'
                  }
                </small>
              </div>
              <div className="form-field">
                <label>Department *</label>
                <select
                  value={newInstructor.department}
                  onChange={(e) => setNewInstructor({...newInstructor, department: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select
                  value={newInstructor.status}
                  onChange={(e) => setNewInstructor({...newInstructor, status: e.target.value})}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Add Faculty Member</button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Faculty Directory</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-field">
              <label>Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Search by name or ID..."
              />
            </div>
            <div className="form-field">
              <label>Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Course Load</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map(instructor => (
                <tr key={instructor.id}>
                  <td><strong>{instructor.employeeId}</strong></td>
                  <td>
                    <div>
                      <div>{instructor.fullName}</div>
                      <div>{instructor.email}</div>
                    </div>
                  </td>
                  <td>{instructor.department}</td>
                  <td>{getStatusBadge(instructor.status)}</td>
                  <td>{instructor.currentLoad}/{instructor.maxLoad}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteInstructor(instructor.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInstructors.length === 0 && (
            <div className="no-data-message">
              No instructors found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageInstructors;