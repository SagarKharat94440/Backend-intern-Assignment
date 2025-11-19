import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TaskList = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        current: 1,
        total: 1,
        count: 0,
        totalTasks: 0
    });

    useEffect(() => {
        fetchTasks();
    }, [filters]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await axios.get(`/api/v2/tasks?${queryParams}`);

            if (response.data.success) {
                setTasks(response.data.data.tasks);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await axios.delete(`/api/v2/tasks/${taskId}`);

                if (response.data.success) {
                    fetchTasks(); // Refresh the list
                }
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isOverdue = (dueDate, status) => {
        return dueDate && new Date(dueDate) < new Date() && status !== 'completed';
    };

    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    return (
        <div className="task-list">
            <div className="task-header">
                <h1>My Tasks</h1>
                <Link to="/tasks/new" className="btn">Create New Task</Link>
            </div>

            {/* Filters */}
            <div className="task-filters">
                <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />

                <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', e.target.value)}
                >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                    <option value="50">50 per page</option>
                </select>
            </div>

            {/* Task Count */}
            <div className="task-count">
                <p>Showing {pagination.count} of {pagination.totalTasks} tasks</p>
            </div>

            {/* Tasks Grid */}
            {tasks.length === 0 ? (
                <div className="no-tasks">
                    <p>No tasks found. <Link to="/tasks/new">Create your first task</Link></p>
                </div>
            ) : (
                <div className="task-grid">
                    {tasks.map(task => (
                        <div
                            key={task._id}
                            className={`task-card ${task.priority} ${isOverdue(task.dueDate, task.status) ? 'overdue' : ''}`}
                        >
                            <div className="task-header-info">
                                <div>
                                    <h3 className="task-title">{task.title}</h3>
                                    <div className="task-meta">
                                        <span className={`task-status ${task.status}`}>
                                            {task.status.replace('-', ' ')}
                                        </span>
                                        <span className={`task-priority ${task.priority}`}>
                                            {task.priority}
                                        </span>
                                        {isOverdue(task.dueDate, task.status) && (
                                            <span className="overdue-badge">OVERDUE</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="task-description">
                                {task.description.length > 150
                                    ? `${task.description.substring(0, 150)}...`
                                    : task.description
                                }
                            </p>

                            <div className="task-info">
                                <div>
                                    <small>Created: {formatDate(task.createdAt)}</small>
                                    {task.dueDate && (
                                        <small>Due: {formatDate(task.dueDate)}</small>
                                    )}
                                </div>
                                <div>
                                    <small>Created by: {task.createdBy?.name}</small>
                                    {task.assignedTo && task.assignedTo._id !== task.createdBy._id && (
                                        <small>Assigned to: {task.assignedTo.name}</small>
                                    )}
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    onClick={() => navigate(`/tasks/edit/${task._id}`)}
                                    className="btn-small btn-edit"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="btn-small btn-delete"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.total > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(pagination.current - 1)}
                        disabled={pagination.current === 1}
                    >
                        Previous
                    </button>

                    <span>
                        Page {pagination.current} of {pagination.total}
                    </span>

                    <button
                        onClick={() => handlePageChange(pagination.current + 1)}
                        disabled={pagination.current === pagination.total}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskList;