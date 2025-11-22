// Data persistence utility
export const DataManager = {
  // Students
  getStudents: () => {
    const stored = localStorage.getItem('liu_students');
    if (stored) return JSON.parse(stored);
    const defaultStudents = [
      { 
        id: 1, 
        studentId: '20230001', 
        name: 'John Doe', 
        major: 'Computer Science', 
        enrolledCourses: ['CSCI101'],
        email: 'john.doe@students.liu.edu.lb'
      },
      { 
        id: 2, 
        studentId: '20230002', 
        name: 'Jane Smith', 
        major: 'Mathematics', 
        enrolledCourses: ['MATH201'],
        email: 'jane.smith@students.liu.edu.lb'
      }
    ];
    localStorage.setItem('liu_students', JSON.stringify(defaultStudents));
    return defaultStudents;
  },

  saveStudents: (students) => {
    localStorage.setItem('liu_students', JSON.stringify(students));
  },

  // Courses
  getCourses: () => {
    const stored = localStorage.getItem('liu_courses');
    if (stored) return JSON.parse(stored);
    const defaultCourses = [
      {
        id: 1,
        code: 'CSCI101',
        name: 'Introduction to Programming',
        description: 'Fundamental concepts of programming and problem solving.',
        credits: 3,
        department: 'Computer Science',
        level: 100,
        instructor: 'Dr. Sarah Johnson',
        semester: 'Fall',
        academicYear: '2024-2025',
        capacity: 45,
        enrolled: 42,
        prerequisites: [],
        schedule: 'Mon, Wed 10:00-11:30',
        room: 'E-301',
        status: 'active',
        category: 'Core',
        createdAt: '2024-01-15'
      }
    ];
    localStorage.setItem('liu_courses', JSON.stringify(defaultCourses));
    return defaultCourses;
  },

  saveCourses: (courses) => {
    localStorage.setItem('liu_courses', JSON.stringify(courses));
  },

  // Instructors
  getInstructors: () => {
    const stored = localStorage.getItem('liu_instructors');
    if (stored) return JSON.parse(stored);
    const defaultInstructors = [
      {
        id: 1,
        employeeId: 'PROF001',
        title: 'Dr.',
        firstName: 'Sarah',
        lastName: 'Johnson',
        fullName: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@liu.edu.lb',
        phone: '+961 1 123456',
        department: 'Computer Science',
        faculty: 'Engineering',
        office: 'E-301',
        officeHours: 'Mon, Wed 10:00-12:00',
        specialization: 'Artificial Intelligence, Machine Learning',
        status: 'active',
        hireDate: '2020-09-01',
        courses: ['CSCI101', 'CSCI400'],
        maxLoad: 3,
        currentLoad: 2
      }
    ];
    localStorage.setItem('liu_instructors', JSON.stringify(defaultInstructors));
    return defaultInstructors;
  },

  saveInstructors: (instructors) => {
    localStorage.setItem('liu_instructors', JSON.stringify(instructors));
  },

  // Exams
  getExams: () => {
    const stored = localStorage.getItem('liu_exams');
    return stored ? JSON.parse(stored) : [];
  },

  saveExams: (exams) => {
    localStorage.setItem('liu_exams', JSON.stringify(exams));
  },

  // Rooms
  getRooms: () => {
    const stored = localStorage.getItem('liu_rooms');
    if (stored) return JSON.parse(stored);
    
    const defaultRooms = [
      {
        id: 1,
        name: 'Auditorium',
        building: 'Building E',
        capacity: 100,
        status: 'available',
        seatColors: ['Red', 'Green', 'Blue', 'Yellow'],
        usedSeatColors: []
      },
      {
        id: 2,
        name: 'C3',
        building: 'Building C', 
        capacity: 50,
        status: 'available',
        seatColors: ['Red', 'Green', 'Blue'],
        usedSeatColors: []
      },
      {
        id: 3,
        name: 'D4',
        building: 'Building D',
        capacity: 75,
        status: 'available',
        seatColors: ['Red', 'Green', 'Blue', 'Yellow'],
        usedSeatColors: []
      }
    ];
    localStorage.setItem('liu_rooms', JSON.stringify(defaultRooms));
    return defaultRooms;
  },

  saveRooms: (rooms) => {
    localStorage.setItem('liu_rooms', JSON.stringify(rooms));
  },

  // Clear all data
  clearAllData: () => {
    localStorage.removeItem('liu_students');
    localStorage.removeItem('liu_courses');
    localStorage.removeItem('liu_instructors');
    localStorage.removeItem('liu_exams');
    localStorage.removeItem('liu_rooms');
  }
};