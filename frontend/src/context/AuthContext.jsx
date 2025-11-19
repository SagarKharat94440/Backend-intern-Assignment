import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check if user is logged in on app start
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await axios.get('/api/v2/auth/profile');
                if (response.data.success) {
                    setUser(response.data.data.user);
                }
            }
        } catch (error) {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setError('');
            const response = await axios.post('/api/v2/auth/login', credentials);

            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(user);
                return { success: true };
            }
        } catch (error) {
            const errorData = error.response?.data;
            const message = errorData?.message || 'Login failed';
            const type = errorData?.type || 'UNKNOWN_ERROR';
            const errors = errorData?.errors || [];

            setError(message);
            return {
                success: false,
                error: message,
                type: type,
                errors: errors
            };
        }
    };

    const register = async (userData) => {
        try {
            setError('');
            const response = await axios.post('/api/v2/auth/register', userData);

            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(user);
                return { success: true };
            }
        } catch (error) {
            const errorData = error.response?.data;
            const message = errorData?.message || 'Registration failed';
            const type = errorData?.type || 'UNKNOWN_ERROR';
            const errors = errorData?.errors || [];

            setError(message);
            return {
                success: false,
                error: message,
                type: type,
                errors: errors
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/v2/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setError('');
            const response = await axios.put('/api/v2/auth/profile', profileData);

            if (response.data.success) {
                setUser(response.data.data.user);
                return { success: true };
            }
        } catch (error) {
            const errorData = error.response?.data;
            const message = errorData?.message || 'Profile update failed';
            const type = errorData?.type || 'UNKNOWN_ERROR';

            setError(message);
            return {
                success: false,
                error: message,
                type: type
            };
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};