import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/dashboard">Task Manager</Link>
            </div>

            <ul className="navbar-nav">
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/tasks">My Tasks</Link></li>
                <li><Link to="/tasks/new">Create Task</Link></li>
            </ul>

            <div className="user-info">
                <span>Welcome, {user?.name}</span>
                <span className="user-role">{user?.role}</span>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;