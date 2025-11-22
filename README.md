LIU Exam System
A comprehensive Smart Exam & Room Scheduling Management System for universities, built with React.js.

🚀 Features
Core Functionality
Smart Exam Scheduling: Automated conflict-free exam scheduling with intelligent room assignment

Room Management: Manage classrooms with seat color system for efficient space utilization

Course Management: Complete course catalog with prerequisites and enrollment tracking

Faculty Management: Instructor profiles with workload balancing

Student Management: Student enrollment and course registration

Conflict Detection: Automated detection of scheduling conflicts (room, instructor, student)

Smart Features
Seat Color System: Multiple exams can be scheduled in the same room using different seat colors

Level-based Scheduling: Exams are grouped by course levels (100-400) for optimal scheduling

Auto Conflict Resolution: Intelligent algorithms prevent scheduling conflicts

Capacity Management: Room capacity validation and enrollment tracking

Instructor Workload Balancing: Fair distribution of exam proctoring duties

👥 User Roles
1. Administrator
Full system access

Manage courses, instructors, students, and rooms

Schedule exams and generate reports

View and resolve conflicts

2. Instructor
View assigned exams

Access exam schedules and room assignments

Monitor student enrollment

3. Student
View personal exam schedule

Check room assignments and seat colors

Receive exam alerts

🏗️ System Architecture
Frontend
React.js with functional components and hooks

Local Storage for data persistence

Responsive Design for all devices

Data Structure
Courses: Code, name, level, department, instructor, capacity, prerequisites

Rooms: Name, building, capacity, seat colors, status

Exams: Course, date, time, room, seat color, instructor

Instructors: Profile, department, workload, assigned courses

Students: Enrollment, courses, personal information

📋 Installation & Setup
Prerequisites
Node.js (v14 or higher)

npm or yarn

Installation Steps
Clone the repository:

bash
git clone <repository-url>
cd liu-exam-system
Install dependencies:

bash
npm install
Start the development server:

bash
npm start
Open http://localhost:3000 in your browser

Default Login Credentials
Administrator:

ID: admin

Password: admin

Instructor:

ID: instructor

Password: instructor

Student:

ID: student

Password: student

📊 Key Components
Core Modules
AdminDashboard.js - Main admin interface with navigation

ScheduleExams.js - Intelligent exam scheduling system

ManageCourses.js - Course catalog management

ManageRooms.js - Room and seat color management

ManageInstructors.js - Faculty management

ManageStudents.js - Student enrollment system

ConflictReport.js - Conflict detection and reporting

Utility Modules
dataPersistence.js - Local storage management

ExamAlert.js - Real-time exam notifications

Login.js - Authentication system

🎯 Smart Scheduling Algorithm
Level-based Grouping
100-level: Introductory courses

200-level: Intermediate courses

300-level: Advanced courses

400-level: Senior-level courses

Conflict Prevention
Room Conflicts: Avoided using seat color system

Instructor Conflicts: No same instructor at same time

Student Conflicts: No overlapping exams for enrolled students

Capacity Conflicts: Room size validation

Scheduling Strategies
Multiple week scheduling windows

Priority-based room assignment

Instructor workload distribution

Student conflict minimization

🎨 Seat Color System
Purpose
Allow multiple exams in the same room simultaneously by assigning different seat colors to different exams.

Implementation
Each room has configurable seat colors (Red, Green, Blue, Yellow, etc.)

Exams in same room/time must have different seat colors

Visual color coding in schedules and alerts

Prevents physical seating conflicts

📱 Usage Guide
For Administrators
Setup Courses

Add courses with codes, levels, and departments

Set prerequisites and capacities

Assign instructors

Manage Rooms

Add classrooms with capacities

Configure available seat colors

Set room status (available, occupied, maintenance)

Schedule Exams

Use auto-scheduling for bulk scheduling

Configure exam periods (midterm/final)

Review and adjust generated schedule

Monitor Conflicts

View conflict reports

Resolve scheduling issues

Optimize room utilization

For Instructors
View assigned exam schedule

Check room and seat color assignments

Monitor student enrollment

For Students
View personal exam timetable

Check room locations and seat colors

Receive exam reminders

🔧 Technical Details
Data Persistence
Uses browser LocalStorage

Data survives browser refresh

Default sample data provided

Easy data reset functionality

State Management
React useState and useEffect hooks

Component-level state management

Memoized calculations for performance

Responsive Design
Mobile-friendly interfaces

Adaptive layouts for different screen sizes

Accessible color schemes and contrasts

🚨 Exam Alert System
Features
Real-time countdown timer

Cannot-be-closed during exam period

Displays critical exam information

Seat color emphasis

Trigger Conditions
Active exam within 2-hour window

Automatic display

Manual dismissal not allowed

📈 Reporting & Analytics
Available Reports
Conflict Report: Room, instructor, and student conflicts

Schedule Summary: Exam statistics and room utilization

Instructor Workload: Teaching load distribution

Capacity Analysis: Room usage efficiency

🔄 Data Management
Backup & Reset
Local storage automatically persists data

Default data can be restored

Individual component data reset options

Clear all data functionality

Sample Data
The system comes with pre-loaded sample data:

Default courses across different levels

Sample rooms with capacities

Instructor profiles

Student enrollments

🛠️ Troubleshooting
Common Issues
Data Not Persisting

Check browser localStorage support

Clear browser cache and reload

Use reset functionality

Scheduling Conflicts

Review conflict report

Adjust room seat colors

Modify exam timing

Performance Issues

Browser cache clearance

Reduce large data sets

Use filtering for large lists

Support
For technical issues or feature requests, contact the development team.

📄 License
This project is developed for educational and institutional use.

🎓 About
Developed for Lebanese International University (LIU) to streamline exam scheduling and room management processes.
