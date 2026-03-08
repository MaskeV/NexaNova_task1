// frontend/src/components/DashBoard/DashBoard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from '../Student/StudentDashboard';
import TrainerDashboard from '../Trainers/TrainerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  if (user?.role === 'trainer') {
    return <TrainerDashboard />;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Welcome to NexaNova</h1>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;