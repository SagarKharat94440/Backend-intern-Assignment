import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
});

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState('');

    const handleSubmit = async (values, { setFieldError }) => {
        setIsSubmitting(true);
        setErrorMessage('');
        setErrorType('');

        const result = await login(values);

        if (result.success) {
            navigate('/dashboard');
        } else {
            // Handle specific error types
            if (result.type === 'USER_NOT_FOUND') {
                setErrorMessage(result.error);
                setErrorType('user-not-found');
                setFieldError('email', 'This email is not registered');
            } else if (result.type === 'WRONG_PASSWORD') {
                setErrorMessage(result.error);
                setErrorType('wrong-password');
                setFieldError('password', 'Incorrect password');
            } else if (result.type === 'ACCOUNT_DEACTIVATED') {
                setErrorMessage(result.error);
                setErrorType('account-deactivated');
            } else if (result.type === 'VALIDATION_ERROR') {
                setErrorMessage('Please check your input and try again');
                setErrorType('validation-error');
            } else {
                setErrorMessage(result.error || 'Login failed. Please try again.');
                setErrorType('general-error');
            }
        }

        setIsSubmitting(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Login to Task Manager</h2>

                {errorMessage && (
                    <div className={`alert alert-error ${errorType}`}>
                        {errorMessage}
                        {errorType === 'user-not-found' && (
                            <div style={{ marginTop: '10px' }}>
                                <Link to="/register" style={{ color: '#fff', textDecoration: 'underline' }}>
                                    Create an account instead
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <Formik
                    initialValues={{
                        email: '',
                        password: ''
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isValid, dirty }) => (
                        <Form>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <Field
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                />
                                <ErrorMessage name="email" component="div" className="error-message" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <Field
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                />
                                <ErrorMessage name="password" component="div" className="error-message" />
                            </div>

                            <button
                                type="submit"
                                className="btn"
                                disabled={!isValid || !dirty || isSubmitting}
                            >
                                {isSubmitting ? 'Logging in...' : 'Login'}
                            </button>
                        </Form>
                    )}
                </Formik>

                <div className="auth-link">
                    <p>Don't have an account? <Link to="/register">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;