import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0
    });
    const [recentTasks, setRecentTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch tasks for stats
            const tasksResponse = await axios.get('/api/v2/tasks?limit=100');
            if (tasksResponse.data.success) {
                const tasks = tasksResponse.data.data.tasks;

                // Calculate stats
                const totalTasks = tasks.length;
                const pendingTasks = tasks.filter(task => task.status === 'pending').length;
                const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
                const completedTasks = tasks.filter(task => task.status === 'completed').length;
                const overdueTasks = tasks.filter(task =>
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== 'completed'
                ).length;

                setStats({
                    totalTasks,
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,
                    overdueTasks
                });

                // Set recent tasks (last 5)
                setRecentTasks(tasks.slice(0, 5));
            }

            // If user is admin, fetch admin stats
            if (user?.role === 'admin') {
                try {
                    const adminStatsResponse = await axios.get('/api/v2/tasks/stats');
                    if (adminStatsResponse.data.success) {
                        const adminStats = adminStatsResponse.data.data;
                        setStats(prev => ({
                            ...prev,
                            totalTasks: adminStats.totalTasks,
                            overdueTasks: adminStats.overdueTasks
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching admin stats:', error);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Welcome back, {user?.name}!</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Tasks</h3>
                    <div className="number">{stats.totalTasks}</div>
                </div>

                <div className="stat-card">
                    <h3>Pending</h3>
                    <div className="number">{stats.pendingTasks}</div>
                </div>

                <div className="stat-card">
                    <h3>In Progress</h3>
                    <div className="number">{stats.inProgressTasks}</div>
                </div>

                <div className="stat-card">
                    <h3>Completed</h3>
                    <div className="number">{stats.completedTasks}</div>
                </div>

                {stats.overdueTasks > 0 && (
                    <div className="stat-card">
                        <h3>Overdue</h3>
                        <div className="number" style={{ color: '#e74c3c' }}>{stats.overdueTasks}</div>
                    </div>
                )}
            </div>

            <div className="recent-tasks">
                <div className="task-header">
                    <h2>Recent Tasks</h2>
                    <Link to="/tasks/new" className="btn">Create New Task</Link>
                </div>

                {recentTasks.length === 0 ? (
                    <div className="no-tasks">
                        <p>No tasks found. <Link to="/tasks/new">Create your first task</Link></p>
                    </div>
                ) : (
                    <div className="task-grid">
                        {recentTasks.map(task => (
                            <div key={task._id} className={`task-card ${task.priority}`}>
                                <div className="task-header-info">
                                    <div>
                                        <h3 className="task-title">{task.title}</h3>
                                        <div className="task-meta">
                                            <span className={`task-status ${task.status}`}>
                                                {task.status}
                                            </span>
                                            <span className={`task-priority ${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="task-description">
                                    {task.description.length > 100
                                        ? `${task.description.substring(0, 100)}...`
                                        : task.description
                                    }
                                </p>

                                <div className="task-info">
                                    <small>Created: {formatDate(task.createdAt)}</small>
                                    {task.dueDate && (
                                        <small>Due: {formatDate(task.dueDate)}</small>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/tasks" className="btn">View All Tasks</Link>
                    <Link to="/tasks/new" className="btn">Create Task</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;