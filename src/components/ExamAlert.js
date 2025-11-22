import React, { useState, useEffect } from 'react';

const ExamAlert = ({ exam, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(7200);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="exam-alert">
      <div className="exam-alert-content">
        <h2>🚨 YOU HAVE AN EXAM RIGHT NOW!</h2>
        <div className="countdown">{formatTime(timeLeft)}</div>
        <p><strong>Course:</strong> {exam.courseCode} - {exam.courseName}</p>
        <p><strong>Time:</strong> {exam.startTime} - {exam.endTime}</p>
        <p><strong>Room:</strong> {exam.room}, {exam.building}</p>
        <p><strong>Seat Color:</strong> 
          <span style={{ color: exam.seatColor.toLowerCase(), fontWeight: 'bold' }}>
            {exam.seatColor}
          </span>
        </p>
        <div className="alert warning">
          This alert cannot be closed until the exam time ends.
        </div>
      </div>
    </div>
  );
};

export default ExamAlert;